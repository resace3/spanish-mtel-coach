import { z } from 'zod';

export const skillAreaSchema = z.enum(['listening', 'reading', 'language_structures', 'culture', 'writing', 'oral']);

export const rubricCategorySchema = z.object({
  name: z.enum([
    'task completion',
    'grammar and syntax',
    'vocabulary and idiom',
    'organization and communicative effectiveness',
  ]),
  min: z.literal(0),
  max: z.literal(4),
  description: z.string().min(12),
});

export const rubricSchema = z.object({
  categories: z.array(rubricCategorySchema).length(4),
});

export const questionSchema = z
  .object({
    id: z.string().min(4),
    skillArea: skillAreaSchema,
    objectiveCode: z.string().min(2),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    promptLanguage: z.enum(['es', 'en', 'mixed']),
    promptText: z.string().min(10),
    passageText: z.string().min(20).optional(),
    audioScript: z.string().min(20).optional(),
    choices: z.array(z.object({ id: z.string().min(1), text: z.string().min(1) })).length(4),
    correctAnswer: z.string().min(1),
    rubric: rubricSchema.optional(),
    explanationText: z.string().min(12),
    tags: z.array(z.string().min(2)).min(1),
    estimatedSeconds: z.number().int().min(20).max(900),
    source: z.enum(['original_static', 'original_template']),
    safetyReviewed: z.literal(true),
  })
  .superRefine((question, ctx) => {
    if (!question.choices.some((choice) => choice.id === question.correctAnswer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'correctAnswer must match a choice id.',
        path: ['correctAnswer'],
      });
    }
  });
