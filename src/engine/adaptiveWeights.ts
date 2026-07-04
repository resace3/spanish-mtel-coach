import type { SkillArea } from '../content/questionTypes';
import { allSkillAreas } from '../content/questionTypes';
import type { AttemptRecord } from '../storage/schema';
import { averageRubricScore } from './scoring';

export interface WeaknessProfile {
  bySkill: Record<SkillArea, number>;
  byObjective: Record<string, number>;
  weakestSkill: SkillArea;
}

export function computeWeaknessProfile(attempts: AttemptRecord[], now = new Date()): WeaknessProfile {
  const bySkill = Object.fromEntries(allSkillAreas.map((skill) => [skill, 0])) as Record<SkillArea, number>;
  const byObjective: Record<string, number> = {};

  for (const attempt of attempts) {
    const ageDays = Math.max(0, (now.getTime() - new Date(attempt.attemptedAt).getTime()) / 86_400_000);
    const recency = Math.exp(-ageDays / 21);
    const objectivePenalty = attempt.correct === false ? 2 : 0;
    const rubricAverage = attempt.rubricScores ? averageRubricScore(attempt.rubricScores) : undefined;
    const rubricPenalty = rubricAverage === undefined ? 0 : Math.max(0, (3 - rubricAverage) / 1.5);
    const timePenalty = attempt.elapsedSeconds && attempt.elapsedSeconds > 160 ? 0.35 : 0;
    const successCredit = attempt.correct === true ? -0.45 : 0;
    const score = Math.max(0, (objectivePenalty + rubricPenalty + timePenalty + successCredit) * recency);

    bySkill[attempt.skillArea] += score;
    byObjective[attempt.objectiveCode] = (byObjective[attempt.objectiveCode] ?? 0) + score;
  }

  const weakestSkill = allSkillAreas.reduce((weakest, skill) => (bySkill[skill] > bySkill[weakest] ? skill : weakest), allSkillAreas[0]);
  return { bySkill, byObjective, weakestSkill };
}

export function sortSkillsByWeakness(profile: WeaknessProfile): SkillArea[] {
  return [...allSkillAreas].sort((a, b) => profile.bySkill[b] - profile.bySkill[a]);
}
