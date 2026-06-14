## Critical IDOR Anti-Pattern: Auth Middleware Stores User ID on `req.body.userId` Instead of `req.user.id` Across All 9 Controllers

### Severity: Critical
### Category: Security (IDOR — Insecure Direct Object Reference)

## Description

The authentication middleware (`backend/middlewares/auth.js` line 15) stores the authenticated user's ID directly on the request body:

```js
// backend/middlewares/auth.js line 15
req.body.userId = token_decode.id;
```

This is a fundamental security anti-pattern. By placing the user ID on `req.body` instead of on a dedicated `req.user` property, the code creates a dangerous situation where any client-supplied `userId` field in the request body can potentially override the authenticated identity.

### The Problem

**Current behavior:**
```js
// Auth middleware runs and sets:
req.body.userId = "authenticated_user_id_123";

// But if the client sends:
// { "userId": "evil_user_id_456", ... }
// The middleware OVERWRITES req.body.userId, so it appears safe...
```

**Why it's still dangerous:**

1. **Middleware order dependency:** If ANY middleware runs BEFORE the auth middleware and reads `req.body.userId`, it gets the **client-supplied** value. Currently, body-parser runs before auth middleware. If someone adds a logging middleware or validation middleware before auth, it could log/use the client-supplied userId.

2. **Future refactoring risk:** A future developer might see `req.body.userId` and think "this is user-supplied data" and add validation for it, or worse, add a feature that accepts `userId` from the client for admin operations. The variable name strongly suggests it's user-supplied input, which contradicts its actual purpose.

3. **Spread operator risk:** If any controller uses `const { ...safeFields } = req.body` to extract allowed fields, and `userId` is NOT in the allowlist, it could still leak into the database update because of how the spread is used:
   ```js
   const updateData = { ...safeFields }; // If userId wasn't in whitelist...
   await User.findByIdAndUpdate(req.body.userId, updateData); // But it's used here separately
   ```

4. **Testing confusion:** When writing tests, developers naturally set `req.body = { userId: "test_user" }` thinking they're setting up the request. This works but reinforces the wrong mental model.

5. **Violation of security principle:** The authenticated user identity should NEVER come from the same channel as user input. `req.user` (or `req.auth`) is the established convention in Express/Passport/Node.js ecosystem for authenticated identity. Using `req.body` mixes untrusted input with trusted authentication data.

### All Affected Controllers (Must Read from `req.user.id` Instead)

Every single controller function reads the userId from `req.body.userId`:

| Controller File | Lines Using `req.body.userId` |
|---|---|
| `userController.js` | Login, Register, getProfile, updateProfile — all read userId from body |
| `goalController.js` | createGoal, getGoals, getGoal, updateGoal, deleteGoal — all use req.body.userId |
| `projectController.js` | createProject, getProjects, getProject, updateProject, deleteProject — all use req.body.userId |
| `taskController.js` | createTask, getTasks, getTask, updateTask, deleteTask — all use req.body.userId |
| `notebookController.js` | createNotebook, getNotebooks, getNotebook, updateNotebook, deleteNotebook — all use req.body.userId |
| `pageController.js` | createPage, getPages, getPage, updatePage, deletePage — all use req.body.userId |
| `habitController.js` | createHabit, getHabits, getHabit, updateHabit, deleteHabit, completeHabit — all use req.body.userId |
| `dailyPlanController.js` | getDailyPlan, addToDailyPlan, toggleDailyPlanTask, clearDailyPlan — all use req.body.userId |
| `statsController.js` | saveDailyStats, getWeeklyStats — uses req.body.userId (with a fallback to req.headers.userid!) |

### Additional Vulnerability: `statsController.js` Falls Back to `req.headers.userid`

In `statsController.js` line 65:
```js
const userId = req.body.userId || req.headers.userid;
```

The fallback to `req.headers.userid` (lowercase 'id', no 'e') means an attacker could set the `userid` header directly, completely bypassing the auth middleware. If the middleware fails silently or is accidentally removed from a route, any client can access any user's stats by simply sending their ID in the header.

## Impact

- **IDOR vulnerability:** Any middleware reordering could expose user data to unauthorized access
- **Auth bypass potential:** The `req.headers.userid` fallback in `statsController.js` is a direct auth bypass
- **Data leakage:** Users could potentially access other users' goals, projects, tasks, notebooks, pages, habits, and daily plans
- **Data tampering:** Malicious users could modify other users' data if they can influence the userId value before auth middleware processes it

## Files Affected

1. **`backend/middlewares/auth.js`** — Change to set `req.user = { id: token_decode.id }` instead of `req.body.userId`
2. **`backend/controllers/userController.js`** — Update ALL references from `req.body.userId` to `req.user.id`
3. **`backend/controllers/goalController.js`** — Same update across all CRUD operations
4. **`backend/controllers/projectController.js`** — Same update
5. **`backend/controllers/taskController.js`** — Same update
6. **`backend/controllers/notebookController.js`** — Same update
7. **`backend/controllers/pageController.js`** — Same update
8. **`backend/controllers/habitController.js`** — Same update
9. **`backend/controllers/dailyPlanController.js`** — Same update
10. **`backend/controllers/statsController.js`** — Same update + remove `req.headers.userid` fallback

## Suggested Fix

1. **In auth middleware:**
   ```js
   // Change from:
   req.body.userId = token_decode.id;
   // To:
   req.user = { id: token_decode.id };
   ```

2. **In ALL controllers, replace every instance of:**
   ```js
   const userId = req.body.userId;
   // With:
   const userId = req.user.id;
   ```

3. **In statsController.js, additionally remove the fallback:**
   ```js
   // Change from:
   const userId = req.body.userId || req.headers.userid;
   // To:
   const userId = req.user.id;
   ```

4. **Add a test** that verifies client-supplied `userId` in the request body is NEVER used as the authenticated identity. This regression test should simulate a request with a malicious `userId` in the body and verify the server uses the JWT identity instead.
