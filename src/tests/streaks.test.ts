import { describe, expect, it } from 'vitest';
import { buildStreakState, calculateCurrentStreak, calculateLongestStreak } from '../engine/streaks';

describe('streaks', () => {
  it('counts same-day completion', () => {
    expect(calculateCurrentStreak(['2026-07-04'], '2026-07-04')).toBe(1);
  });

  it('keeps a streak alive before today is completed if yesterday was complete', () => {
    expect(calculateCurrentStreak(['2026-07-03'], '2026-07-04')).toBe(1);
  });

  it('resets after a missed day', () => {
    expect(calculateCurrentStreak(['2026-07-01'], '2026-07-04')).toBe(0);
  });

  it('preserves longest streak', () => {
    expect(calculateLongestStreak(['2026-07-01', '2026-07-02', '2026-07-04'])).toBe(2);
  });

  it('does not treat extra practice as daily completion', () => {
    const state = buildStreakState([], [{ id: 'a', questionId: 'q', dateKey: '2026-07-04', attemptedAt: new Date().toISOString(), sessionType: 'extra', skillArea: 'reading', objectiveCode: 'R', difficulty: 2 }], [], '2026-07-04');
    expect(state.currentStreak).toBe(0);
    expect(state.totalQuestionsAnswered).toBe(1);
  });
});
