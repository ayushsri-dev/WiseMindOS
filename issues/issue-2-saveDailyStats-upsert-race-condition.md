## `saveDailyStats` Uses Range-Based Upsert Causing Duplicate Documents Under Concurrent Writes — Weekly Stats Analytics Are Corrupted

### Severity: High
### Category: Bug (Data Integrity / Race Condition)

## Description

The `saveDailyStats` function in `backend/controllers/statsController.js` uses a range-based `findOneAndUpdate` query for its upsert operation. Under concurrent access (which happens regularly because the frontend calls `saveStats` on every `dailyPlan` change), this creates duplicate daily stats documents, corrupting the weekly analytics.

### Root Cause

**File:** `backend/controllers/statsController.js` (lines 14-34)

```js
const saveDailyStats = async (req, res) => {
  const userId = req.body.userId;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const stats = await DailyStats.findOneAndUpdate(
    { userId, date: { $gte: start, $lte: end } },  // <-- RANGE-BASED QUERY
    { $set: { ...statsData, date: today } },
    { upsert: true, new: true }
  );
  // ...
};
```

**The bug:** The `findOneAndUpdate` uses a **date range** (`$gte: start, $lte: end`) instead of an **exact date match**. The unique index on `{ userId: 1, date: 1 }` uses the exact `date` field value, but the upsert query uses a range. This creates a race condition:

1. **Request A** runs at `08:00:00.000` — creates a stats document with `date: 2026-06-08T08:00:00.000Z`
2. **Request B** runs at `08:00:00.050` (50ms later) — the range `$gte: start` to `$lte: end` also matches, but due to timing, the upsert creates a **second document** because the `findOneAndUpdate` didn't find the document created by Request A (it hadn't been written yet)
3. Now there are **two daily stats documents** for the same user on the same day with different `date` timestamps

The unique index `{ userId: 1, date: 1 }` does NOT prevent this because:
- Index uses exact `date` value (e.g., `2026-06-08T08:00:00.000Z` vs `2026-06-08T08:00:00.050Z`)
- Two different millisecond timestamps = two different index entries = no unique constraint violation
- The range query finds the first existing document but the concurrent creation happens between the find and the insert

### Commented-Out Code Shows the Correct Approach

**File:** `backend/controllers/statsController.js` (lines 36-49 — commented out)

```js
// const todayStart = new Date();
// todayStart.setHours(0, 0, 0, 0);
// 
// const stats = await DailyStats.findOneAndUpdate(
//   { userId, date: todayStart },  // <-- EXACT MATCH (correct approach)
//   { $set: { ...statsData, date: todayStart } },
//   { upsert: true, new: true }
// );
```

The commented-out code normalizes the date to midnight (`setHours(0,0,0,0)`) and uses an **exact match**. This is the correct approach. The current code was apparently replaced with the range-based version and the correct version was commented out, but the fix was never completed.

### Concurrent Call Pattern

**File:** `frontend/src/store/AppContext.jsx` (lines 959-979)

The frontend calls `saveStats` on every `dailyPlan` change:

```jsx
useEffect(() => {
  if (dailyPlan) {
    saveStats();  // Called on every dailyPlan update
  }
}, [dailyPlan]);
```

Every time the user modifies their daily plan (add task, remove task, toggle completion, reorder), this effect fires and calls `saveStats`. Since the `toggleDailyPlanTask` function also modifies `dailyPlan` state, a series of rapid toggles creates concurrent `saveStats` calls, each potentially creating a duplicate stats document.

### Data Corruption in Weekly Stats

**File:** `backend/controllers/statsController.js` (lines 62-76)

```js
const getWeeklyStats = async (req, res) => {
  const userId = req.body.userId || req.headers.userid;
  const stats = await DailyStats.find({ userId });  // Returns ALL stats, no date filter
  // ...
};
```

The `getWeeklyStats` function returns ALL stats without any date filtering. The frontend processes ALL of them. With duplicate documents:

- Some days appear multiple times in the stats array
- Averages are calculated incorrectly (overweight days with multiple entries)
- The productivity streak calculation breaks because it uses `stats.length` as the number of days
- The frontend mapping (e.g., `stats.map(s => s.productivityScore)`) includes duplicate values

## Impact

- **Corrupted weekly analytics:** Duplicate daily stats skew all weekly calculations (productivity, discipline, habit completion)
- **Incorrect streak calculations:** Streak logic breaks when multiple entries exist for the same day
- **Frontend displays wrong data:** The Dashboard shows incorrect productivity/consistency scores
- **Progressive degradation:** Over time, more duplicates accumulate, making the stats increasingly unreliable

## Files Affected

1. **`backend/controllers/statsController.js`** — Fix the upsert query to use exact date match; remove `req.headers.userid` fallback; add date filtering to `getWeeklyStats` (should only return last 7 days)
2. **`backend/models/DailyStats.js`** — Ensure the unique index is `{ userId: 1, date: 1 }` where `date` is normalized to midnight
3. **`frontend/src/store/AppContext.jsx`** — Debounce or throttle the `saveStats` call to prevent rapid concurrent saves

## Suggested Fix

1. **Normalize date to midnight** and use exact match in the upsert query:
   ```js
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   
   const stats = await DailyStats.findOneAndUpdate(
     { userId, date: today },
     { $set: { ...statsData } },
     { upsert: true, new: true }
   );
   ```

2. **Add a compound unique index** on `{ userId: 1, date: 1 }` with `date` normalized to midnight (already exists but verify it's correctly defined in the model).

3. **Debounce the frontend `saveStats` call** — collect changes for 2 seconds before saving to reduce concurrent calls.

4. **Add a cleanup migration** to remove duplicate daily stats entries for the same userId+date combination.

5. **Add date filtering to `getWeeklyStats`:**
   ```js
   const lastWeek = new Date();
   lastWeek.setDate(lastWeek.getDate() - 7);
   const stats = await DailyStats.find({
     userId,
     date: { $gte: lastWeek }
   });
   ```
