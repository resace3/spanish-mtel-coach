import { describe, expect, it } from 'vitest';
import { selectDailyQuestions, selectExtraPracticeQuestions } from '../engine/dailySelector';
import type { AttemptRecord } from '../storage/schema';

describe('dailySelector', () => {
  it('selects exactly 10 deterministic daily questions with required broad mix', () => {
    const first = selectDailyQuestions({ dateKey: '2026-07-04', attempts: [] });
    const second = selectDailyQuestions({ dateKey: '2026-07-04', attempts: [] });
    expect(first.map((question) => question.id)).toEqual(second.map((question) => question.id));
    expect(first).toHaveLength(10);
    expect(first[0].skillArea).toBe('listening');
    expect(first[1].skillArea).toBe('listening');
    expect(first[2].skillArea).toBe('reading');
    expect(first[8].skillArea).toBe('writing');
    expect(first[9].skillArea).toBe('oral');
    expect(first.every((question) => question.choices.length === 4 && question.correctAnswer)).toBe(true);
  });

  it('focuses extra practice on selected area and avoids today when possible', () => {
    const selected = selectExtraPracticeQuestions('reading', 5, [], ['read-parent-email-main']);
    expect(selected).toHaveLength(5);
    expect(selected.every((question) => question.skillArea === 'reading')).toBe(true);
    expect(selected.some((question) => question.id === 'read-parent-email-main')).toBe(false);
  });

  it('uses prior misses for extra practice review', () => {
    const attempts: AttemptRecord[] = [
      {
        id: 'a',
        questionId: 'listen-school-conference-main',
        dateKey: '2026-07-04',
        attemptedAt: '2026-07-04T12:00:00Z',
        sessionType: 'daily',
        skillArea: 'listening',
        objectiveCode: 'L-01',
        difficulty: 2,
        correct: false,
      },
    ];
    const selected = selectExtraPracticeQuestions('weakest', 5, attempts);
    expect(selected[0].id).toBe('listen-school-conference-main');
  });
});
