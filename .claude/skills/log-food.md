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

### 5. Estimate servings, but only for categories the user actually tracks

Read the most recent file in `data/goals/` (highest date). If it has a non-empty `serving_targets` (e.g. `vegetables`, `fruits`, `dairy`, `whole-grains`), estimate how many servings of *each of those specific categories* this food contributes — e.g. "roasted broccoli" contributes to `vegetables`, "greek yogurt" to `dairy`. Skip categories the food doesn't touch; skip this step entirely if there's no `serving_targets` set or the food doesn't match any tracked category. Don't invent categories that aren't in the current goals — this is scoped to what the user actually set a target for.

### 6. Preview and confirm

Show a brief preview before writing. If the entry covers more than one distinct food item, break the estimate down per item (as a small table or list) rather than only showing the combined total — this makes it easy to spot which item is driving the number and to correct just one piece of it:
```
Meal: lunch — chicken burrito bowl

| Item              | Cal | Protein | Carbs | Fat |
|-------------------|-----|---------|-------|-----|
| Chicken (grilled)  | 280 | 35g     | 0g    | 14g |
| Rice (1 cup)       | 205 | 4g      | 45g   | 0g  |
| Black beans (½ cup)| 115 | 8g      | 20g   | 1g  |
| Salsa              | 20  | 1g      | 4g    | 0g  |
| **Total**          | **720** | **48g** | **69g** | **15g** |

Tags:     chicken, burrito-bowl
Servings: vegetables 0.5   (omit this line if no serving_targets are set, or none apply)
```
A single-item entry (e.g. one archived-label food) doesn't need a table — the flat `Calories: / Protein: / Carbs: / Fat:` format is enough. Ask if anything needs correcting. Don't demand exact figures if the user doesn't have them — the estimate is the point.

### 7. Write the entry

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
      servings: [{ category: <category>, amount: <number> }]   # omit line if none apply
      items: [{ name: <string>, calories: <number>, protein_g: <number>, carbs_g: <number>, fat_g: <number> }]   # omit line for single-item entries; otherwise one object per row of the preview table from step 6, same numbers
  ---
  ```
- If the file already exists, read it, parse the frontmatter, **append** the new object to the existing `entries` array (don't touch prior entries), and rewrite the whole file.

Use the current time in 24h `HH:MM` for `time` unless the user specifies otherwise.

### 8. Confirm

Briefly confirm what was logged and, if the user has goals set (a file exists under `data/goals/`), optionally mention how the day's running total compares to `calories_target` — and, if serving targets are set, how today's category totals compare too.
