import { z } from 'zod';
import type { Question, SkillArea } from '../content/questionTypes';
import type { HeuristicFeedback, RubricScores } from '../engine/scoring';

export interface UserSettings {
  id: 'settings';
  displayName?: string;
  lastExportAt?: string;
  preferReducedMotion?: boolean;
}

export interface AttemptRecord {
  id: string;
  questionId: string;
  dateKey: string;
  attemptedAt: string;
  sessionType: 'daily' | 'extra' | 'mock';
  dailyDateKey?: string;
  skillArea: SkillArea;
  objectiveCode: string;
  difficulty: Question['difficulty'];
  selectedChoiceId?: string;
  correct?: boolean;
  responseText?: string;
  rubricScores?: Partial<RubricScores>;
  heuristicFeedback?: HeuristicFeedback;
  elapsedSeconds?: number;
}

export interface DailySetRecord {
  dateKey: string;
  questionIds: string[];
  createdAt: string;
  completedAt?: string;
  submittedQuestionIds: string[];
}

export interface DailyCompletionRecord {
  dateKey: string;
  completedAt: string;
  score: number;
  total: number;
}

export interface ExtraPracticeSessionRecord {
  id: string;
  createdAt: string;
  completedAt?: string;
  selectedArea: SkillArea | 'weakest' | 'mixed';
  questionIds: string[];
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  settings?: UserSettings;
  attempts: AttemptRecord[];
  dailySets: DailySetRecord[];
  completions: DailyCompletionRecord[];
  extraSessions: ExtraPracticeSessionRecord[];
  meta: {
    app: 'spanish-mtel-coach';
    storage: 'indexeddb';
  };
}

const skillAreaSchema = z.enum(['listening', 'reading', 'language_structures', 'culture', 'writing', 'oral']);

const rubricScoresSchema = z
  .object({
    'task completion': z.number().min(0).max(4).optional(),
    'grammar and syntax': z.number().min(0).max(4).optional(),
    'vocabulary and idiom': z.number().min(0).max(4).optional(),
    'organization and communicative effectiveness': z.number().min(0).max(4).optional(),
  })
  .partial();

export const attemptRecordSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attemptedAt: z.string(),
  sessionType: z.enum(['daily', 'extra', 'mock']),
  dailyDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  skillArea: skillAreaSchema,
  objectiveCode: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  selectedChoiceId: z.string().optional(),
  correct: z.boolean().optional(),
  responseText: z.string().optional(),
  rubricScores: rubricScoresSchema.optional(),
  heuristicFeedback: z
    .object({
      comments: z.array(z.string()),
      wordCount: z.number(),
      possibleAccentReminder: z.boolean(),
    })
    .optional(),
  elapsedSeconds: z.number().optional(),
});

export const exportDataSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  settings: z
    .object({
      id: z.literal('settings'),
      displayName: z.string().optional(),
      lastExportAt: z.string().optional(),
      preferReducedMotion: z.boolean().optional(),
    })
    .optional(),
  attempts: z.array(attemptRecordSchema),
  dailySets: z.array(
    z.object({
      dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      questionIds: z.array(z.string()).length(10),
      createdAt: z.string(),
      completedAt: z.string().optional(),
      submittedQuestionIds: z.array(z.string()),
    }),
  ),
  completions: z.array(
    z.object({
      dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      completedAt: z.string(),
      score: z.number(),
      total: z.number(),
    }),
  ),
  extraSessions: z.array(
    z.object({
      id: z.string(),
      createdAt: z.string(),
      completedAt: z.string().optional(),
      selectedArea: z.union([skillAreaSchema, z.literal('weakest'), z.literal('mixed')]),
      questionIds: z.array(z.string()),
    }),
  ),
  meta: z.object({
    app: z.literal('spanish-mtel-coach'),
    storage: z.literal('indexeddb'),
  }),
});
