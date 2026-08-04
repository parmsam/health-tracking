import type { CollectionEntry } from 'astro:content';

export type FoodEntry = CollectionEntry<'food'>['data']['entries'][number];
export type ExerciseEntry = CollectionEntry<'exercise'>['data']['entries'][number];
type CheckinEntry = CollectionEntry<'checkins'>['data']['entries'][number];

export function dailyFoodTotals(entries: FoodEntry[]) {
  return entries.reduce(
    (totals, e) => ({
      calories: totals.calories + e.calories,
      protein_g: totals.protein_g + e.protein_g,
      carbs_g: totals.carbs_g + e.carbs_g,
      fat_g: totals.fat_g + e.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

export function sortByDateDesc<T extends { data: { date: Date } }>(days: T[]): T[] {
  return [...days].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function sortEntriesByTime<T extends { time: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.time.localeCompare(b.time));
}

export function todayId(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function findDay<T extends { id: string }>(days: T[], id: string): T | undefined {
  return days.find(d => d.id === id);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isWithinCurrentWeek(date: Date, reference: Date = new Date()): boolean {
  const start = startOfWeek(reference);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

export function thisWeekExerciseSessionCount(
  days: CollectionEntry<'exercise'>[],
  reference: Date = new Date()
): number {
  return days
    .filter(d => isWithinCurrentWeek(d.data.date, reference))
    .reduce((count, d) => count + d.data.entries.length, 0);
}

export function weightTrend(
  days: CollectionEntry<'checkins'>[]
): { date: Date; weight_lb: number }[] {
  return sortByDateDesc(days)
    .flatMap(day =>
      day.data.entries
        .filter((e): e is CheckinEntry & { weight_lb: number } => e.weight_lb !== undefined)
        .map(e => ({ date: day.data.date, weight_lb: e.weight_lb }))
    )
    .reverse(); // chronological order for charting
}

// Flatten day-files into individual entries paired with their day's date —
// the shape /tags/[tag] needs to filter across every logged occurrence.
export function flattenByDate<TDay extends { data: { date: Date; entries: unknown[] } }>(
  days: TDay[]
): { date: Date; entry: TDay['data']['entries'][number] }[] {
  return days.flatMap(day => day.data.entries.map(entry => ({ date: day.data.date, entry })));
}

export function allTags(flatEntries: { entry: { tags: string[] } }[][]): string[] {
  const set = new Set<string>();
  for (const list of flatEntries) {
    for (const { entry } of list) {
      for (const tag of entry.tags) set.add(tag);
    }
  }
  return Array.from(set).sort();
}
