export type SkillArea = 'listening' | 'reading' | 'language_structures' | 'culture' | 'writing' | 'oral';
export type PromptLanguage = 'es' | 'en' | 'mixed';
export type QuestionSource = 'original_static' | 'original_template';

export interface Choice {
  id: string;
  text: string;
}

export interface RubricCategory {
  name: 'task completion' | 'grammar and syntax' | 'vocabulary and idiom' | 'organization and communicative effectiveness';
  min: 0;
  max: 4;
  description: string;
}

export interface Rubric {
  categories: RubricCategory[];
}

export interface Question {
  id: string;
  skillArea: SkillArea;
  objectiveCode: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  promptLanguage: PromptLanguage;
  promptText: string;
  passageText?: string;
  audioScript?: string;
  choices?: Choice[];
  correctAnswer?: string;
  rubric?: Rubric;
  explanationText: string;
  tags: string[];
  estimatedSeconds: number;
  source: QuestionSource;
  safetyReviewed: boolean;
}

export const skillLabels: Record<SkillArea, string> = {
  listening: 'Listening',
  reading: 'Reading',
  language_structures: 'Language structures',
  culture: 'Culture',
  writing: 'Writing',
  oral: 'Oral expression',
};

export const allSkillAreas: SkillArea[] = [
  'listening',
  'reading',
  'language_structures',
  'culture',
  'writing',
  'oral',
];

export const standardRubric: Rubric = {
  categories: [
    {
      name: 'task completion',
      min: 0,
      max: 4,
      description: 'Addresses every part of the prompt with enough relevant detail.',
    },
    {
      name: 'grammar and syntax',
      min: 0,
      max: 4,
      description: 'Uses accurate forms, agreement, verb tenses, and sentence structure.',
    },
    {
      name: 'vocabulary and idiom',
      min: 0,
      max: 4,
      description: 'Uses precise, natural vocabulary and avoids English calques when possible.',
    },
    {
      name: 'organization and communicative effectiveness',
      min: 0,
      max: 4,
      description: 'Presents ideas clearly with logical organization and appropriate register.',
    },
  ],
};

export function isObjectiveQuestion(question: Question): boolean {
  return Boolean(question.choices && question.correctAnswer);
}
