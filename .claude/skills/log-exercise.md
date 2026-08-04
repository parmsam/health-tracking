# log-exercise

Log a workout entry (strength or cardio) to today's exercise file. Can be invoked as `/log-exercise <description>`, or triggered naturally when the user mentions a workout in conversation.

## Usage

```
/log-exercise <description>
```
e.g. `/log-exercise squats 185x5, 185x5, 195x5`, or `/log-exercise 30 min easy run, 3.1 miles`, or just "just got back from a run."

## Steps

### 1. Determine type

Infer `strength` vs `cardio` from the description. If genuinely ambiguous, ask — one question only.

### 2. Collect the relevant fields

**Strength**: exercise name, and one `{ reps, weight_lb }` per set. If the user gives shorthand like "185x5, 185x5, 195x5", parse it directly rather than asking them to restate it. If weight isn't given (e.g. bodyweight work), ask only if it matters to them — otherwise omit reasonably or ask once.

**Cardio**: activity, `duration_min`, and `distance_mi`/`pace_min_per_mi` if given. If only two of {duration, distance, pace} are given, compute the third rather than asking for it.

Don't demand a complete structured form — log what's given, ask at most one clarifying question for something genuinely missing and useful (e.g. "how heavy?" only if weight matters and wasn't mentioned).

### 3. Tags

Default to a single tag: the slugified `exercise`/`activity` name (e.g. `exercise: "Barbell Back Squat"` → `tags: [barbell-back-squat]`) — this is essentially free.

Then read the most recent file in `data/goals/` (highest date). If it has a non-empty `exercise_targets` (e.g. `upper-body`, `lower-body`, `push`, `pull`), add whichever of those categories this session actually belongs to as additional tags — e.g. a bench press session gets `tags: [barbell-bench-press, upper-body]`. Skip this if `exercise_targets` is empty or the session doesn't fit any tracked category; don't invent categories that aren't in current goals.

### 4. Preview and confirm

Show a brief preview before writing, e.g.:
```
Strength — Barbell Back Squat
185 lb x5, 185 lb x5, 195 lb x5
Tags: barbell-back-squat, lower-body
```
or
```
Cardio — running, 30 min, 3.1 mi (9:41/mi pace)
Tags: running
```

### 5. Write the entry

Today's date in `YYYY-MM-DD`. Target file: `data/exercise/<YYYY-MM-DD>.md`.

- `mkdir -p data/exercise` if needed.
- If the file doesn't exist, create it with `date` and a one-item `entries` array containing the new object (strength or cardio shape, per `CLAUDE.md`'s schema, including `tags`).
- If it exists, read it, parse the frontmatter, **append** the new object to the existing `entries` array, and rewrite the whole file — never drop prior entries.

Use the current time in 24h `HH:MM` for `time` unless the user specifies otherwise.

### 6. Confirm

Briefly confirm what was logged and, if goals are set (a file exists under `data/goals/`), optionally mention this week's workout count vs. `workout_frequency_target` — and, if this session matched an `exercise_targets` category, how that category's weekly count compares to its target.
