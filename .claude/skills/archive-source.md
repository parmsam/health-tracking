# archive-source

Archive a photographed nutrition label or a PDF food/diet plan: save the raw file plus a markdown transcription, then hand the extracted data off to `log-food` or `set-goals`. Invoked directly ("save this label", "archive this plan"), or automatically by `log-food`/`set-goals` when the user shares an image or PDF mid-conversation.

## Usage

```
/archive-source <path to image or PDF>
```
Also triggers implicitly whenever the user attaches/pastes an image of a nutrition label or references a PDF food/diet plan file.

## Steps

### 1. Determine category

- **Nutrition label**: a photo of a packaged food's nutrition facts panel (or ingredient list).
- **Food plan**: a PDF (or other document) laying out daily targets, a meal structure, or dietary restrictions — e.g. from a doctor or nutritionist.

If unclear from context, ask which.

### 2. Read and transcribe

Use the Read tool on the image/PDF directly (it supports both). Transcribe faithfully:

**Nutrition label** → capture: product name, serving size, calories, protein_g, carbs_g, fat_g, and any other notable fields visible (fiber, sugar, sodium), plus the ingredient list if legible. Don't guess at anything not visible in the image — leave it out rather than inventing a number.

**Food plan** → capture: daily calorie/macro targets if stated, meal structure, restrictions/notes, and anything else relevant to `data/goals/targets.md`'s fields. Summarize rather than transcribing verbatim if the source is long — the point is a usable reference, not a full copy.

### 3. Generate a slug and write both files

Today's date in `YYYY-MM-DD`, plus a short lowercase-hyphenated slug from the product/plan name (max ~5 words). Category determines the subdirectory: `data/archive/nutrition-labels/` or `data/archive/food-plans/`.

- `mkdir -p` the target subdirectory if needed.
- Copy the original file alongside the transcription, same basename, original extension: `<YYYY-MM-DD>-<slug>.<ext>`.
- Write the transcription: `<YYYY-MM-DD>-<slug>.md`, with a small YAML frontmatter header (`date`, `slug`, `source_file`) followed by the transcribed content as markdown body text. For a nutrition label, include the macro fields in frontmatter too so they're easy to parse back out later:

```markdown
---
date: <YYYY-MM-DD>
slug: <slug>
source_file: <YYYY-MM-DD>-<slug>.<ext>
serving_size: <string, if visible>
calories: <number, if visible>
protein_g: <number, if visible>
carbs_g: <number, if visible>
fat_g: <number, if visible>
---

<ingredient list / plan details / any other transcribed notes>
```

### 4. Hand off

- Nutrition label → offer to log it now via `log-food`, passing the transcribed macros through (set `source` to the transcription's path instead of re-estimating).
- Food plan → offer to update `data/goals/targets.md` now via `set-goals`, pre-filled with the extracted targets.

### 5. Confirm

Briefly confirm what was archived and where, so the user knows it's saved even if they decline the hand-off.
