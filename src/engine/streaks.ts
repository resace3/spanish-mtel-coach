import type { AttemptRecord, DailyCompletionRecord } from '../storage/schema';
import { addChicagoDays, lastNDatesChicago } from './dateChicago';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  last7Days: Array<{ dateKey: string; completed: boolean; active: boolean; login: boolean }>;
  totalQuestionsAnswered: number;
}

export function calculateCurrentStreak(completedDateKeys: string[], todayKey: string): number {
  const completed = new Set(completedDateKeys);
  let cursor = completed.has(todayKey) ? todayKey : addChicagoDays(todayKey, -1);
  if (!completed.has(cursor)) return 0;
  let streak = 0;
  while (completed.has(cursor)) {
    streak += 1;
    cursor = addChicagoDays(cursor, -1);
  }
  return streak;
}

export function calculateLongestStreak(completedDateKeys: string[]): number {
  const sorted = [...new Set(completedDateKeys)].sort();
  let longest = 0;
  let current = 0;
  let previous: string | undefined;
  for (const key of sorted) {
    if (!previous || addChicagoDays(previous, 1) === key) current += 1;
    else current = 1;
    longest = Math.max(longest, current);
    previous = key;
  }
  return longest;
}

export function buildStreakState(
  completions: DailyCompletionRecord[],
  attempts: AttemptRecord[],
  loginDates: string[],
  todayKey: string,
): StreakState {
  const completedDates = completions.map((completion) => completion.dateKey).sort();
  const activeDates = new Set(attempts.map((attempt) => attempt.dateKey));
  const completed = new Set(completedDates);
  const logins = new Set(loginDates);
  return {
    currentStreak: calculateCurrentStreak(completedDates, todayKey),
    longestStreak: calculateLongestStreak(completedDates),
    completedDates,
    last7Days: lastNDatesChicago(7, todayKey).map((dateKey) => ({
      dateKey,
      completed: completed.has(dateKey),
      active: activeDates.has(dateKey),
      login: logins.has(dateKey),
    })),
    totalQuestionsAnswered: attempts.length,
  };
}
