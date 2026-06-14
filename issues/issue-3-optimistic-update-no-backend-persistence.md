## `updateDailyPlanTask` Uses Optimistic Updates Without Backend Persistence — All Changes Are Lost on Page Refresh

### Severity: High
### Category: Bug (Data Integrity / Missing Feature)

## Description

The `updateDailyPlanTask` function in `frontend/src/store/AppContext.jsx` updates the local state optimistically but **never persists the changes to the backend**. A developer comment explicitly acknowledges this gap:

```js
// For now, update locally (backend doesn't have update endpoint)
```

This means every time a user modifies a planned task's properties (completion status, time, notes, etc.), the change only exists in the browser's memory. Any page refresh, navigation away and back, or app reload **reverts all changes**.

### The Problem

**File:** `frontend/src/store/AppContext.jsx` (lines 912-926)

```jsx
const updateDailyPlanTask = async (id, updates) => {
    try {
      // For now, update locally (backend doesn't have update endpoint)
      setDailyPlan(prev => ({
        ...prev,
        plannedTasks: prev.plannedTasks.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      }));
    } catch (error) {
      console.error('Error updating daily plan task:', error);
    }
};
```

**What happens in practice:**

1. User opens the Daily Plan view
2. `loadInitialData()` fetches today's plan from the backend (via `getDailyPlan` API)
3. User marks a task as "completed" — `updateDailyPlanTask` is called
4. The UI updates optimistically — user sees the task checked off
5. User closes the browser tab or navigates away
6. **User returns** — `loadInitialData()` fires again, fetches the OLD plan from the backend
7. **The completion is gone** — user has to repeat their changes

### The Toggle Inconsistency

There are TWO paths for toggling task completion:

**Path 1 — `toggleDailyPlanTask` (dailyPlanController.js lines 155-237):**
This IS properly handled on the backend. When a user toggles a task's completion in the daily plan, it calls the backend API which:
- Updates the completion status
- Calculates habit streaks (if the task is linked to a habit)
- Returns the updated daily plan

**Path 2 — `updateDailyPlanTask` (AppContext.jsx lines 912-926):**
This is NOT handled on the backend. The function is used for:
- Changing a planned task's time slot (drag-and-drop rescheduling)
- Adding notes to a planned task
- Changing the task's priority in the daily plan
- Any property update that isn't a simple completion toggle

The inconsistency creates a confusing UX where toggling completion works across refreshes, but rescheduling or editing does not.

### Affected Features

1. **Drag-and-drop time rescheduling** — User reorders their day's tasks → lost on refresh
2. **Adding notes/descriptions** to planned tasks → lost on refresh
3. **Changing priority** of a planned task → lost on refresh
4. **Splitting/merging** planned task time blocks → lost on refresh
5. Any future feature that adds new fields to `plannedTasks` → not persisted

### Why the Backend Endpoint Doesn't Exist

The daily plan model (`backend/models/DailyPlan.js`) has a `plannedTasks` array with subdocuments that have their own `_id` fields. The `addToDailyPlan` controller properly adds tasks and `toggleDailyPlanTask` properly toggles completion, but there is **no general-purpose update endpoint** for individual planned task subdocuments. The `clearDailyPlan` endpoint exists but there's no `PATCH /api/daily-plan/task/:plannedTaskId` endpoint.

## Impact

- **All non-toggle changes are ephemeral:** Users cannot rely on the daily planner for task scheduling because changes disappear on refresh
- **Data loss:** Users may spend time organizing their day, only to lose all changes
- **Feature is effectively broken:** The drag-and-drop rescheduling and note-taking features for daily plan tasks are non-functional in practice
- **UX trust erosion:** Users who notice the inconsistency will lose trust in the application's data reliability

## Files Affected

1. **`backend/controllers/dailyPlanController.js`** — Add a new `updateDailyPlanTask` endpoint that uses `findOneAndUpdate` with `$set` on the specific planned task subdocument
2. **`backend/routes/dailyPlanRoute.js`** — Add the new route (`PATCH /api/daily-plan/task/:plannedTaskId`)
3. **`backend/models/DailyPlan.js`** — Verify the plannedTask subdocument schema supports all fields that the frontend tries to update
4. **`frontend/src/api/apiService.js`** — Add a new API method for updating individual planned tasks
5. **`frontend/src/store/AppContext.jsx`** — Update `updateDailyPlanTask` to call the backend and handle errors (revert optimistic update on failure)

## Suggested Fix

1. **Add a backend endpoint:**
   ```js
   // PATCH /api/daily-plan/task/:plannedTaskId
   const updateDailyPlanTask = async (req, res) => {
     const userId = req.user.id;
     const { plannedTaskId } = req.params;
     const updates = req.body; // Only allow specific fields
     
     const dailyPlan = await DailyPlan.findOneAndUpdate(
       { userId, date: today, "plannedTasks._id": plannedTaskId },
       { $set: Object.keys(updates).reduce((acc, key) => {
         acc[`plannedTasks.$.${key}`] = updates[key];
         return acc;
       }, {}) },
       { new: true }
     );
     
     res.json({ success: true, dailyPlan });
   };
   ```

2. **Update the frontend to call the backend** and add rollback on failure:
   ```jsx
   const updateDailyPlanTask = async (id, updates) => {
     const previousPlan = dailyPlan;
     try {
       // Optimistic update
       setDailyPlan(prev => ({ ... }));
       // Persist to backend
       await dailyPlanAPI.updateTask(id, updates);
     } catch (error) {
       // Rollback on failure
       setDailyPlan(previousPlan);
       toast.error("Failed to save changes");
     }
   };
   ```

3. **Add field allowlisting** on the backend to prevent mass-assignment attacks on planned task subdocuments.
