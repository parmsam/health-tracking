# Health Tracking

A personal nutrition, exercise, and goals tracker. You log meals, workouts, weight, and even photos of nutrition labels by *talking to Claude Code* — no forms, no app to open. A small Astro dashboard renders whatever's been logged.

**Live demo:** https://parmsam.github.io/health-tracking

> The demo above shows **synthetic sample data only**. This project's whole point is that your real health data never gets committed or deployed — see [How the public/private split works](#how-the-publicprivate-split-works) below.

---

## What it is

| Layer | How it works |
|---|---|
| **Input** | Claude Code, via the skills in `.claude/skills/` — `/log-food`, `/log-exercise`, `/log-checkin`, `/set-goals`, `/archive-source` — or just by mentioning what you ate/did in conversation |
| **Storage** | Markdown files with YAML frontmatter, one file per day per category, gitignored |
| **Output** | A read-only [Astro 5](https://astro.build) + [Tailwind v4](https://tailwindcss.com) dashboard: today's calories/macros vs. target, this week's workouts vs. your frequency goal, a weight trend chart, and full food/exercise history |

The frontend is styled after [`ril`](https://github.com/parmsam/ril), another project of mine — same stone/amber palette, same class-based dark mode, same "the site is a read-only view over files a Claude Code skill writes" model.

## Setup

```bash
git clone https://github.com/parmsam/health-tracking.git
cd health-tracking
npm install
```

Then, in Claude Code (from this directory), just start logging — the skills create `data/` and its subfolders automatically the first time you use them:

```
/log-food had two eggs and toast for breakfast
/log-exercise squats 185x5, 185x5, 195x5
/log-checkin 178.4, slept well
/set-goals
```

Run the dashboard locally:

```bash
npm run dev        # http://localhost:4321
```

That's it — no database, no accounts, no API keys. Everything lives in `data/` on your machine.

## Skills

- **`/log-food <description>`** — logs a meal; Claude estimates calories/protein/carbs/fat from what you describe.
- **`/log-exercise <description>`** — logs a strength or cardio session.
- **`/log-checkin <weight> [notes]`** — logs today's weight and/or a note.
- **`/set-goals`** — view or update your calorie/macro/weight/workout-frequency targets.
- **`/archive-source <image or PDF>`** — archive a photographed nutrition label or a PDF food/diet plan; transcribes it to markdown and can feed straight into `/log-food` or `/set-goals`.

None of these require exact syntax — mention what you ate or did in conversation and Claude will offer to log it. See `CLAUDE.md` for the full schemas and conventions.

## How the public/private split works

`data/` is in `.gitignore` — it holds your real logs and is never committed. The Astro content config (`src/content.config.ts`) reads its data source from an environment variable:

```ts
const DATA_DIR = process.env.HEALTH_DATA_DIR ?? 'data';
```

- **Locally**, you never set that variable, so `npm run dev`/`npm run build` always read your private `data/`.
- **In CI** (`.github/workflows/deploy.yml`), the build step sets `HEALTH_DATA_DIR=demo-data`, so the site deployed to GitHub Pages is built exclusively from the small, committed, synthetic dataset in `demo-data/` — your real data is never in the repo, so it's never in the build.

Both directories share the same structure (`food/`, `exercise/`, `checkins/`, `goals/`), so nothing in the schema or the pages needs to know which one it's reading from.

(One caveat if you ever build locally with `HEALTH_DATA_DIR` set to something different than usual, e.g. to preview the demo site: Astro's content-layer cache — `node_modules/.astro/data-store.json`, not the project-root `.astro/` — doesn't always invalidate when a collection goes from populated to empty across runs, so a later plain `npm run dev` can briefly show phantom demo entries. This never affects the actual deploy, since CI always starts from a clean `npm ci`/`node_modules` — it's purely a local-cache quirk. Delete `node_modules/.astro/` if a local build seems to be showing the wrong dataset.)

## Stack

| Layer | Choice |
|---|---|
| Framework | [Astro 5](https://astro.build) — static output, Content Layer API |
| Schema | [Zod](https://zod.dev) via Astro content collections |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Deploy | GitHub Actions → GitHub Pages |

## Deployment

Push to `main` and the GitHub Actions workflow builds the site (from `demo-data/`, per above) and deploys it to GitHub Pages automatically. To deploy manually: `Actions → Deploy to GitHub Pages → Run workflow`.

## Development

```bash
npm install
npm run dev        # dev server at localhost:4321, reads data/
npm run build       # production build, reads data/ locally or demo-data/ in CI
npm run preview     # preview the built dist/
npm run check       # typecheck with astro check
```
