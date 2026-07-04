import { describe, expect, it } from 'vitest';
import { computeWeaknessProfile } from '../engine/adaptiveWeights';
import type { AttemptRecord } from '../storage/schema';

describe('adaptiveWeights', () => {
  it('prioritizes recent misses and low rubric scores', () => {
    const now = new Date('2026-07-04T12:00:00Z');
    const attempts: AttemptRecord[] = [
      {
        id: '1',
        questionId: 'q1',
        dateKey: '2026-07-04',
        attemptedAt: '2026-07-04T11:00:00Z',
        sessionType: 'daily',
        skillArea: 'listening',
        objectiveCode: 'L-01',
        difficulty: 3,
        correct: false,
      },
      {
        id: '2',
        questionId: 'q2',
        dateKey: '2026-07-04',
        attemptedAt: '2026-07-04T11:00:00Z',
        sessionType: 'daily',
        skillArea: 'writing',
        objectiveCode: 'W-01',
        difficulty: 3,
        rubricScores: { 'task completion': 1, 'grammar and syntax': 1 },
      },
    ];
    const profile = computeWeaknessProfile(attempts, now);
    expect(profile.bySkill.listening).toBeGreaterThan(0);
    expect(profile.bySkill.writing).toBeGreaterThan(0);
  });
});
