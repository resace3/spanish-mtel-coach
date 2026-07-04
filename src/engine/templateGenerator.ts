import type { PromptFamily } from '../content/writingPrompts';

export interface GeneratedPromptSeed {
  id: string;
  objectiveCode: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  promptText: string;
  tags: string[];
}

export function buildPromptVariants(prefix: string, families: PromptFamily[]): GeneratedPromptSeed[] {
  return families.flatMap((family) =>
    family.tasks.map((task, index) => ({
      id: `${prefix}-${family.id}-${String(index + 1).padStart(2, '0')}`,
      objectiveCode: family.objectiveCode,
      difficulty: family.difficulty,
      promptText: `${family.context} ${task}. Include a clear beginning, specific details, and an appropriate closing when useful.`,
      tags: [...family.tags, family.id],
    })),
  );
}
