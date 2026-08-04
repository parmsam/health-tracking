# set-goals

View or update the current health targets. Unlike the logging skills, this **overwrites** `data/goals/targets.md` in place — it's not a log, there's only ever one current set of targets.

## Usage

```
/set-goals
```
Also triggered naturally when the user wants to change a target ("bump my calorie target to 2400"), or as a hand-off from `archive-source` after transcribing a food/diet plan PDF.

## Steps

### 1. Read current targets

If `data/goals/targets.md` exists, read and show the current values. If not, this is a first-time setup — proceed with empty defaults.

### 2. Determine what's changing

If invoked from `archive-source` with extracted targets from a food plan, propose those values. Otherwise ask the user what they want to set/change — don't require all fields if they only want to change one (e.g. just the calorie target); keep everything else as-is.

Required: `calories_target`, `protein_g_target`, `carbs_g_target`, `fat_g_target`, `workout_frequency_target`.
Optional: `weight_goal_lb`, `weight_goal_direction` (`lose | gain | maintain`).

### 3. Preview and confirm

Show the full resulting set of targets (old values carried forward plus whatever changed) before writing.

### 4. Write the file

`mkdir -p data/goals` if needed. **Overwrite** `data/goals/targets.md` entirely with the complete, current target set:

```yaml
---
calories_target: <number>
protein_g_target: <number>
carbs_g_target: <number>
fat_g_target: <number>
weight_goal_lb: <number>              # omit line if not set
weight_goal_direction: <lose|gain|maintain>  # omit line if not set
workout_frequency_target: <number>
updated: <YYYY-MM-DD>
---
```

### 5. Confirm

Briefly confirm the updated targets.
