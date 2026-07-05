import { describe, expect, it } from 'vitest';
import { questionBank } from '../content/questionBank';
import { questionSchema } from '../content/questionSchema';

describe('question bank schema', () => {
  it('validates every original question', () => {
    const results = questionBank.map((question) => questionSchema.safeParse(question));
    expect(results.every((result) => result.success)).toBe(true);
  });

  it('keeps every practice item multiple choice', () => {
    expect(questionBank.every((question) => question.choices.length === 4 && question.correctAnswer)).toBe(true);
    expect(questionBank.every((question) => question.choices.some((choice) => choice.id === question.correctAnswer))).toBe(true);
  });

  it('does not use the same correct option position for all items', () => {
    const uniqueCorrectKeys = new Set(questionBank.map((question) => question.correctAnswer));
    expect(uniqueCorrectKeys.size).toBeGreaterThan(1);
  });

  it('meets minimum content counts', () => {
    const counts = questionBank.reduce<Record<string, number>>((accumulator, question) => {
      accumulator[question.skillArea] = (accumulator[question.skillArea] ?? 0) + 1;
      return accumulator;
    }, {});
    expect(questionBank.length).toBeGreaterThanOrEqual(240);
    expect(counts.listening).toBeGreaterThanOrEqual(40);
    expect(counts.reading).toBeGreaterThanOrEqual(40);
    expect(counts.language_structures).toBeGreaterThanOrEqual(60);
    expect(counts.culture).toBeGreaterThanOrEqual(30);
    expect(counts.writing).toBeGreaterThanOrEqual(35);
    expect(counts.oral).toBeGreaterThanOrEqual(35);
  });
});
