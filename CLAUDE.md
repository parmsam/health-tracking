# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A personal nutrition, exercise, and goals tracker. Logging happens *conversationally* through Claude Code — via the skills in `.claude/skills/`, or just by mentioning food/workouts/weight in conversation — not through a manual UI. The Astro 5 + Tailwind v4 frontend is read-only: it renders whatever is in `data/`, it never writes to it.

## Commands

- `npm run dev` — local dev server at localhost:4321, reads from `data/`
- `npm run build` — production build; reads from `data/` locally, or `demo-data/` in CI (see below)
- `npm run preview` — serve the built `dist/`

## The public/private data split — read this before touching anything under `data/`

**`data/` is gitignored and must never be committed.** It holds this user's real, private health data. `src/content.config.ts` picks its data source from `process.env.HEALTH_DATA_DIR`, defaulting to `data/` when unset (local dev/build). The GitHub Actions deploy workflow sets `HEALTH_DATA_DIR=demo-data` so the public site only ever builds from the small, committed, synthetic dataset in `demo-data/`. The two directories must have identical internal structure (`food/`, `exercise/`, `checkins/`, `goals/`) so the same schema and pages work against either.

**Never `git add` or `git commit` anything under `data/`.** The logging skills below never do this either — there's nothing to commit since it's ignored. If you ever seed or edit example content for the public demo, that goes in `demo-data/`, by hand, not by running the logging skills against it.

## Content schemas

Source of truth: `src/content.config.ts`. Files are markdown with YAML frontmatter, no body content needed. One file per day per category (`YYYY-MM-DD.md`), each holding an `entries` array so a day can accumulate multiple logged events (breakfast, then lunch, then a workout, etc. — often across separate conversations).

**Food** (`data/food/YYYY-MM-DD.md`)
```yaml
date: YYYY-MM-DD
entries:
  - time: "HH:MM"                                 # 24h
    meal: breakfast | lunch | dinner | snack
    description: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    source: string    # optional — path to an archived nutrition-label transcription, if this came from one
    tags: [string]     # lowercase-hyphenated, e.g. the core food item(s) — see Tagging below
    servings: [{ category: string, amount: number }]   # e.g. [{category: vegetables, amount: 1}] — see Category goals below
    items: [{ name: string, calories: number, protein_g: number, carbs_g: number, fat_g: number }]   # optional — per-item breakdown when the entry covers more than one distinct food; calories/protein_g/carbs_g/fat_g above remain the entry's totals and source of truth
```

**Exercise** (`data/exercise/YYYY-MM-DD.md`)
```yaml
date: YYYY-MM-DD
entries:
  # strength
  - type: strength
    time: "HH:MM"
    exercise: string
    sets: [{ reps: number, weight_lb: number }]
    notes: string     # optional
    tags: [string]     # lowercase-hyphenated, e.g. the slugified exercise name
  # cardio
  - type: cardio
    time: "HH:MM"
    activity: string
    duration_min: number
    distance_mi: number     # optional
    pace_min_per_mi: number # optional
    notes: string            # optional
    tags: [string]           # lowercase-hyphenated, e.g. the slugified activity name
```

**Check-ins** (`data/checkins/YYYY-MM-DD.md`)
```yaml
date: YYYY-MM-DD
entries:
  - time: "HH:MM"
    weight_lb: number       # optional
    body_fat_pct: number    # optional
    notes: string            # optional
```

**Goals** (`data/goals/YYYY-MM-DD.md`) — one file per *change*, not per day. A goals change is a single event, so there's no `entries` array — just the full target snapshot. The most recent file by date is "current"; every earlier file is history, shown on the Goals page.
```yaml
date: YYYY-MM-DD
calories_target: number
protein_g_target: number
carbs_g_target: number
fat_g_target: number
weight_goal_lb: number             # optional
weight_goal_direction: lose | gain | maintain   # optional
workout_frequency_target: number   # workouts/week
serving_targets: [{ category: string, target: number, unit: string }]   # optional — see Category goals below
exercise_targets: [{ category: string, target: number }]                  # optional — see Category goals below
```

## Unit conventions

- Weight: pounds (`weight_lb`, `weight_goal_lb`)
- Distance/pace: miles (`distance_mi`, `pace_min_per_mi`)
- Duration: minutes (`duration_min`)
- Time: 24-hour `"HH:MM"` strings
- Dates: `YYYY-MM-DD`

## Calorie/macro estimation

When the user describes food in plain language, estimate `calories`/`protein_g`/`carbs_g`/`fat_g` from general nutritional knowledge. Round to the nearest 5 calories and nearest 1 g. Always show the estimate to the user before writing it — these are estimates, not lab measurements, and the user should get a chance to correct them. If a value came from an archived nutrition-label transcription (see below) instead of an estimate, use the label's numbers directly and set `source` to the archived file's path.

## Conversational intake

Logging should not require exact slash-command syntax or a complete structured form up front:

- Recognize logging intent naturally — if the user mentions what they ate, a workout they did, or their weight, offer to log it rather than waiting for `/log-food` etc. to be typed explicitly.
- Ask at most **one** clarifying question for a missing required field (e.g. which meal, or exact weight lifted); fill in a reasonable default or estimate otherwise instead of demanding a complete form.
- Prefer showing a quick preview of what will be written and letting the user correct it over interrogating them field-by-field.

## Tagging

Every food and exercise entry has a `tags` array (default `[]`). Each tag gets its own page at `/tags/<tag>` listing every entry — food or exercise — that carries it, most recent first, so "when did I last have X" or "show me every squat session" is a click, not a search. This is deliberately not a full-text search: tags are an exact-match index over things the user actually logs repeatedly, generated at log time rather than guessed from prose later.

- **Exercise**: default the tag to the slugified `exercise`/`activity` name (e.g. `exercise: "Barbell Back Squat"` → `tags: [barbell-back-squat]`) — this is essentially free since the name is already being written. Add a second tag only if the user mentions a program/context worth tracking separately (e.g. `5k-training`).
- **Food**: propose 1–3 tags for the core food item(s) in the description (e.g. "grilled salmon, roasted broccoli, quinoa" → `tags: [salmon, quinoa]` — pick what's identifiable and reusable, not every ingredient). Before inventing a new tag, check `data/food/` for a prior entry describing the same food and reuse its tag spelling — `grep -rl` for the food name across recent day files is enough, no need for anything fancier.
- Tags are lowercase, hyphenated, no special characters — same slug rules as everywhere else in this file.
- Show proposed tags in the log-food/log-exercise preview step so the user can edit them before confirming, same as any other field.

## Category goals

Beyond the fixed calorie/macro/weight/frequency targets, goals can include **open-ended category targets** — no fixed food-group or muscle-group enum, same philosophy as tags: the user names whatever categories matter to them (`vegetables`, `whole-grains`, `upper-body`, ...) and the system doesn't need a schema change to support a new one.

- **`serving_targets`** (food): daily serving-count goals, e.g. "4 servings of vegetables, 2 of fruit." Each food entry that contributes gets a matching `servings: [{category, amount}]` entry (see `log-food`'s step 5) — a *separate* field from `tags`, because this is a magnitude ("how many") where tags are identity ("which one"). Only estimate servings for categories present in the **current** goals snapshot's `serving_targets` — don't track categories nobody asked for.
- **`exercise_targets`** (exercise): weekly session-count goals per workout category, e.g. "1 upper-body and 1 lower-body strength session a week." These do **not** get a separate field — they're matched against exercise entries' existing `tags` array. `log-exercise` adds a category tag (e.g. `upper-body`) alongside the default exercise-name tag whenever a session matches a category in the current goals (see `log-exercise`'s step 3). Same "only tag what's tracked" rule.
- Both are rendered as progress meters on the dashboard (today's total for `serving_targets`, this week's tagged count for `exercise_targets`) and summarized on the Goals page, current + history.
- `unit` on `serving_targets` defaults to `servings` but isn't required to be — e.g. a user could target `oz` instead if they prefer a weight-based target for one category while keeping others serving-based.

## Archive convention

When the user shares a photo of a nutrition label, or a PDF food/diet plan (e.g. from a nutritionist), use the `archive-source` skill: transcribe it to markdown, save the raw file alongside the transcription under `data/archive/nutrition-labels/` or `data/archive/food-plans/`, and offer to feed the extracted data into `log-food` (for a label) or `set-goals` (for a plan). Check the archive before re-estimating macros for a food that's been logged from a label before — reuse the transcription instead of guessing again.

## Create-vs-append convention

For the three day-file collections (`food`, `exercise`, `checkins`): `mkdir -p` the target subdirectory if needed; if today's file doesn't exist, create it with `date` and a one-item `entries` array; if it exists, read it, parse the frontmatter, push the new entry onto the existing `entries` array, and rewrite the whole file — never overwrite or drop prior entries for the day.

For `goals/`: never overwrite an existing snapshot from a prior day — each change to targets writes a **new** `data/goals/YYYY-MM-DD.md` with the complete, current set of targets (unchanged fields carried forward), so history accumulates automatically. Only same-day re-runs overwrite (today's file, if `set-goals` is invoked twice in one day).

**Restart the dev server after writing the first-ever file into an otherwise-empty collection directory.** Astro's dev-mode watcher only reacts to changes on files it already knows about — if `data/food/`, `data/checkins/`, or `data/goals/` had zero files when the server started, a newly created file in it won't show up on refresh (the page keeps reporting the collection as empty) until you run `npm run dev:stop && npm run dev:start`. Appends to a day file that already existed hot-reload fine and need no restart — this only bites the very first write into a directory.

## YAML gotchas

- **Values with colons**: if a `description`/`notes` value contains a colon (e.g. `"pasta: garlic, olive oil"`), wrap the whole value in double quotes, or js-yaml will parse the colon as a mapping separator.
- **Values with quotes**: if a value contains both `'` and `"`, use a YAML block scalar (`>-`) rather than fighting with quoting.
