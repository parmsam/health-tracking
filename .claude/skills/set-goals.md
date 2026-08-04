# set-goals

View or update your health targets. Each change writes a **new dated snapshot** rather than overwriting the last one — `data/goals/` is a history of every target change, and the most recent file is "current." This is what powers the Goals page's history table.

## Usage

```
/set-goals
```
Also triggered naturally when the user wants to change a target ("bump my calorie target to 2400"), or as a hand-off from `archive-source` after transcribing a food/diet plan PDF.

## Steps

### 1. Read current targets

Find the most recent file in `data/goals/` (by filename date) and show its values. If `data/goals/` is empty or doesn't exist, this is a first-time setup — proceed with empty defaults.

### 2. Determine what's changing

If invoked from `archive-source` with extracted targets from a food plan, propose those values. Otherwise ask the user what they want to set/change — don't require all fields if they only want to change one (e.g. just the calorie target); **carry forward every other field unchanged** from the current snapshot.

Required: `calories_target`, `protein_g_target`, `carbs_g_target`, `fat_g_target`, `workout_frequency_target`.
Optional: `weight_goal_lb`, `weight_goal_direction` (`lose | gain | maintain`).

### 3. Preview and confirm

Show the full resulting set of targets (old values carried forward plus whatever changed) before writing.

### 4. Write a new snapshot

Today's date in `YYYY-MM-DD`. `mkdir -p data/goals` if needed. Target file: `data/goals/<YYYY-MM-DD>.md`.

- If **no file exists yet for today**, write a new one — this preserves every prior snapshot as history:
  ```yaml
  ---
  date: <YYYY-MM-DD>
  calories_target: <number>
  protein_g_target: <number>
  carbs_g_target: <number>
  fat_g_target: <number>
  weight_goal_lb: <number>              # omit line if not set
  weight_goal_direction: <lose|gain|maintain>  # omit line if not set
  workout_frequency_target: <number>
  ---
  ```
- If a file **for today already exists** (goals changed twice in one day), overwrite just that day's file — one snapshot per day is enough resolution for history.

Never touch any other file under `data/goals/` — that's how the history stays intact.

### 5. Confirm

Briefly confirm the updated targets, and mention they're viewable (with history) on the Goals page.
