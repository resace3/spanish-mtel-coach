import { beforeEach, describe, expect, it } from 'vitest';
import { clearAllData, putAttempt, putCompletion, resetDbConnectionForTests } from '../storage/db';
import { exportProgress, importProgress, validateImportText } from '../storage/exportImport';

describe('storage, export, and import', () => {
  beforeEach(async () => {
    resetDbConnectionForTests();
    await clearAllData();
  });

  it('exports and validates local progress', async () => {
    await putAttempt({
      id: 'attempt-1',
      questionId: 'q1',
      dateKey: '2026-07-04',
      attemptedAt: '2026-07-04T12:00:00Z',
      sessionType: 'daily',
      skillArea: 'reading',
      objectiveCode: 'R-01',
      difficulty: 2,
      correct: true,
    });
    await putCompletion({ dateKey: '2026-07-04', completedAt: '2026-07-04T12:30:00Z', score: 8, total: 10 });
    const text = await exportProgress();
    const data = validateImportText(text);
    expect(data.attempts).toHaveLength(1);
    expect(data.completions).toHaveLength(1);
  });

  it('rejects invalid imports before writing', () => {
    expect(() => validateImportText('{"version":1,"attempts":[]}')).toThrow();
  });

  it('imports validated progress', async () => {
    const text = JSON.stringify({
      version: 1,
      exportedAt: '2026-07-04T12:00:00Z',
      attempts: [],
      dailySets: [],
      completions: [],
      extraSessions: [],
      meta: { app: 'spanish-mtel-coach', storage: 'indexeddb' },
    });
    await expect(importProgress(text, 'merge')).resolves.toBeDefined();
  });
});
