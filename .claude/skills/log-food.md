# log-food

Log a food or meal entry to today's food file. Can be invoked as `/log-food <description>`, or triggered naturally when the user mentions something they ate in conversation — don't wait for the slash command.

## Usage

```
/log-food <description>
```
e.g. `/log-food two eggs and toast for breakfast`, or just say "I had a chicken burrito bowl for lunch."

## Steps

### 1. Check the archive first

If the description matches (or the user references) a nutrition label archived previously under `data/archive/nutrition-labels/`, use its transcribed macros directly instead of estimating, and set `source` to that file's path. Otherwise, or if the user is currently sharing a photo of a label, hand off to the `archive-source` skill first, then continue here with its output.

### 2. Determine the meal

Infer `breakfast | lunch | dinner | snack` from context (time of day, wording) if possible. If genuinely ambiguous, ask — but only that one question, don't interrogate.

### 3. Estimate macros

Per `CLAUDE.md`'s calorie/macro estimation guidance: estimate `calories`, `protein_g`, `carbs_g`, `fat_g` from general nutritional knowledge, rounded to the nearest 5 cal / 1 g (skip this if macros came from an archived label — use those numbers as-is).

### 4. Propose tags

Per `CLAUDE.md`'s Tagging convention: propose 1–3 lowercase-hyphenated tags for the core food item(s) (not every ingredient). Check `data/food/` for a prior entry naming the same food and reuse its exact tag spelling instead of coining a near-duplicate.

### 5. Preview and confirm

Show a brief preview before writing:
```
Meal:        lunch
Description: chicken burrito bowl (rice, black beans, salsa, chicken)
Calories:    720
Protein:     45g   Carbs: 80g   Fat: 22g
Tags:        chicken, burrito-bowl
```
Ask if anything needs correcting. Don't demand exact figures if the user doesn't have them — the estimate is the point.

### 6. Write the entry

Today's date in `YYYY-MM-DD` format. Target file: `data/food/<YYYY-MM-DD>.md`.

- `mkdir -p data/food` if needed.
- If the file doesn't exist, create it:
  ```yaml
  ---
  date: <YYYY-MM-DD>
  entries:
    - time: "<HH:MM>"
      meal: <meal>
      description: <description>
      calories: <calories>
      protein_g: <protein_g>
      carbs_g: <carbs_g>
      fat_g: <fat_g>
      source: <archived-file-path>   # omit line if not from an archive
      tags: [<tag1>, <tag2>]
  ---
  ```
- If the file already exists, read it, parse the frontmatter, **append** the new object to the existing `entries` array (don't touch prior entries), and rewrite the whole file.

Use the current time in 24h `HH:MM` for `time` unless the user specifies otherwise.

### 7. Confirm

Briefly confirm what was logged and, if the user has set goals (`data/goals/targets.md` exists), optionally mention how the day's running total compares to `calories_target` so far.
