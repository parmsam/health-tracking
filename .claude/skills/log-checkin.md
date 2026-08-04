# log-checkin

Log a daily weight/body-metric check-in. Can be invoked as `/log-checkin <weight> [notes]`, or triggered naturally when the user mentions their weight or how they're feeling in a check-in sense.

## Usage

```
/log-checkin <weight> [notes]
```
e.g. `/log-checkin 178.4 slept 7.5 hrs, feeling good`, or just "I'm 178.4 today."

## Steps

### 1. Collect fields

`weight_lb` is the main field — take it directly from what's given. `body_fat_pct` and `notes` are optional; don't ask for them unless the user seems to want a fuller check-in. If the user gives only notes and no weight (e.g. "feeling great today"), that's fine — log an entry with just `notes` and `time`, weight is optional.

### 2. Write the entry

Today's date in `YYYY-MM-DD`. Target file: `data/checkins/<YYYY-MM-DD>.md`.

- `mkdir -p data/checkins` if needed.
- If the file doesn't exist, create it with `date` and a one-item `entries` array.
- If it exists, read it, parse the frontmatter, **append** the new object to the existing `entries` array, and rewrite the whole file. Multiple check-ins per day are fine (e.g. AM and PM weigh-ins), though typically there's just one.

Use the current time in 24h `HH:MM` for `time` unless the user specifies otherwise.

### 3. Confirm

Briefly confirm what was logged. If `data/goals/targets.md` exists and has a `weight_goal_lb`, optionally mention progress toward it (e.g. "3.4 lb to go").
