import type { Question, RubricCategory } from '../content/questionTypes';

export type RubricScores = Record<RubricCategory['name'], number>;

export interface HeuristicFeedback {
  comments: string[];
  wordCount: number;
  possibleAccentReminder: boolean;
}

export function scoreObjective(question: Question, selectedChoiceId: string): boolean {
  if (!question.correctAnswer) throw new Error('Question does not have an objective answer.');
  return question.correctAnswer === selectedChoiceId;
}

export function averageRubricScore(scores: Partial<RubricScores>): number {
  const values = Object.values(scores).filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildEmptyRubricScores(): RubricScores {
  return {
    'task completion': 0,
    'grammar and syntax': 0,
    'vocabulary and idiom': 0,
    'organization and communicative effectiveness': 0,
  };
}

export function heuristicFeedback(response: string): HeuristicFeedback {
  const trimmed = response.trim();
  const words = trimmed.length === 0 ? [] : trimmed.split(/\s+/);
  const comments: string[] = [];
  if (words.length < 25) comments.push('Try adding more development and specific details.');
  if (/[.!?]$/.test(trimmed)) comments.push('The response ends with sentence punctuation.');
  else comments.push('Consider ending complete thoughts with clear punctuation.');
  if (/[¿¡]/.test(trimmed)) comments.push('Spanish opening punctuation appears where useful.');
  if (/\b(ser|estar|tener|hacer|ir|decir|poder|querer)\b/i.test(trimmed)) {
    comments.push('You used common high-value verbs; vary forms where appropriate.');
  }
  const possibleAccentReminder = /\b(que|como|cuando|donde|tu|el|si|mas)\b/i.test(trimmed) && !/[áéíóúÁÉÍÓÚñÑüÜ]/.test(trimmed);
  if (possibleAccentReminder) comments.push('Review whether any question words or pronouns need accent marks.');
  return { comments, wordCount: words.length, possibleAccentReminder };
}
