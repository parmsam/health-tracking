import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Local dev/build (no env var set) reads the gitignored `data/` directory —
// your real, private logs. CI sets HEALTH_DATA_DIR=demo-data so the public
// GitHub Pages deploy only ever builds from committed synthetic sample data.
const DATA_DIR = process.env.HEALTH_DATA_DIR ?? 'data';

const foodItem = z.object({
  name: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
});

const foodEntry = z.object({
  time: z.string(), // "HH:MM", 24h
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  description: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  source: z.string().optional(), // path to an archived nutrition-label transcription, if any
  tags: z.array(z.string()).default([]), // lowercase-hyphenated, e.g. the core food item(s) — powers /tags/<tag>
  servings: z.array(z.object({ category: z.string(), amount: z.number() })).default([]), // e.g. [{category: "vegetables", amount: 1}] — only for categories in current goals' serving_targets
  items: z.array(foodItem).optional(), // per-item calorie/macro breakdown when the entry covers more than one distinct food; the fields above remain the source of truth for the entry's totals
});

const food = defineCollection({
  loader: glob({ pattern: '*.md', base: `${DATA_DIR}/food` }),
  schema: z.object({
    date: z.coerce.date(),
    entries: z.array(foodEntry),
  }),
});

const strengthSet = z.object({
  reps: z.number(),
  weight_lb: z.number(),
});

const exerciseEntry = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('strength'),
    time: z.string(),
    exercise: z.string(),
    sets: z.array(strengthSet),
    notes: z.string().optional(),
    tags: z.array(z.string()).default([]), // e.g. the slugified exercise name, plus any program tags
  }),
  z.object({
    type: z.literal('cardio'),
    time: z.string(),
    activity: z.string(),
    duration_min: z.number(),
    distance_mi: z.number().optional(),
    pace_min_per_mi: z.number().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).default([]), // e.g. the slugified activity name, plus any program tags
  }),
]);

const exercise = defineCollection({
  loader: glob({ pattern: '*.md', base: `${DATA_DIR}/exercise` }),
  schema: z.object({
    date: z.coerce.date(),
    entries: z.array(exerciseEntry),
  }),
});

const checkinEntry = z.object({
  time: z.string(),
  weight_lb: z.number().optional(),
  body_fat_pct: z.number().optional(),
  notes: z.string().optional(),
});

const checkins = defineCollection({
  loader: glob({ pattern: '*.md', base: `${DATA_DIR}/checkins` }),
  schema: z.object({
    date: z.coerce.date(),
    entries: z.array(checkinEntry),
  }),
});

// One file per change (data/goals/YYYY-MM-DD.md), not per day like the logs above —
// a goals change is a single event, so there's no entries array. The most recent
// file by date is "current"; older files are history. Never overwritten in place
// (that's how the history exists at all) — see the set-goals skill.
const goals = defineCollection({
  loader: glob({ pattern: '*.md', base: `${DATA_DIR}/goals` }),
  schema: z.object({
    date: z.coerce.date(),
    calories_target: z.number(),
    protein_g_target: z.number(),
    carbs_g_target: z.number(),
    fat_g_target: z.number(),
    weight_goal_lb: z.number().optional(),
    weight_goal_direction: z.enum(['lose', 'gain', 'maintain']).optional(),
    workout_frequency_target: z.number(),
    // Open-ended, like tags — no fixed food-group enum. e.g. [{category: "vegetables", target: 4, unit: "servings"}]
    serving_targets: z.array(z.object({ category: z.string(), target: z.number(), unit: z.string().default('servings') })).default([]),
    // Also open-ended. category is matched against exercise entries' `tags` — no separate
    // per-entry field needed, since this is a pure weekly count. e.g. [{category: "upper-body", target: 1}]
    exercise_targets: z.array(z.object({ category: z.string(), target: z.number() })).default([]),
  }),
});

export const collections = { food, exercise, checkins, goals };
