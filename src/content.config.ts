import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Local dev/build (no env var set) reads the gitignored `data/` directory —
// your real, private logs. CI sets HEALTH_DATA_DIR=demo-data so the public
// GitHub Pages deploy only ever builds from committed synthetic sample data.
const DATA_DIR = process.env.HEALTH_DATA_DIR ?? 'data';

const foodEntry = z.object({
  time: z.string(), // "HH:MM", 24h
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  description: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  source: z.string().optional(), // path to an archived nutrition-label transcription, if any
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
  }),
  z.object({
    type: z.literal('cardio'),
    time: z.string(),
    activity: z.string(),
    duration_min: z.number(),
    distance_mi: z.number().optional(),
    pace_min_per_mi: z.number().optional(),
    notes: z.string().optional(),
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

// Singleton — one file (targets.md), loaded as a one-entry collection.
// Access with: const targets = await getEntry('goals', 'targets');
const goals = defineCollection({
  loader: glob({ pattern: '*.md', base: `${DATA_DIR}/goals` }),
  schema: z.object({
    calories_target: z.number(),
    protein_g_target: z.number(),
    carbs_g_target: z.number(),
    fat_g_target: z.number(),
    weight_goal_lb: z.number().optional(),
    weight_goal_direction: z.enum(['lose', 'gain', 'maintain']).optional(),
    workout_frequency_target: z.number(),
    updated: z.coerce.date(),
  }),
});

export const collections = { food, exercise, checkins, goals };
