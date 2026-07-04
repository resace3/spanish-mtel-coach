import { describe, expect, it } from 'vitest';
import { questionBank } from '../content/questionBank';
import { averageRubricScore, heuristicFeedback, scoreObjective } from '../engine/scoring';

describe('scoring', () => {
  it('scores objective choices exactly', () => {
    const question = questionBank.find((item) => item.correctAnswer);
    expect(question).toBeDefined();
    expect(scoreObjective(question!, question!.correctAnswer!)).toBe(true);
  });

  it('averages rubric scores for writing and oral practice', () => {
    expect(averageRubricScore({ 'task completion': 4, 'grammar and syntax': 2 })).toBe(3);
  });

  it('produces local heuristic feedback without pretending to be official scoring', () => {
    const feedback = heuristicFeedback('¿Cómo puedo mejorar? Tengo una idea clara pero necesito más detalles.');
    expect(feedback.wordCount).toBeGreaterThan(5);
    expect(feedback.comments.length).toBeGreaterThan(0);
  });
});
