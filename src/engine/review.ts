import type { SkillArea } from '../content/questionTypes';
import { skillLabels } from '../content/questionTypes';
import type { AttemptRecord } from '../storage/schema';
import { computeWeaknessProfile, sortSkillsByWeakness } from './adaptiveWeights';

export function summarizeWeakAreas(attempts: AttemptRecord[], limit = 3): Array<{ skillArea: SkillArea; label: string; score: number }> {
  const profile = computeWeaknessProfile(attempts);
  return sortSkillsByWeakness(profile)
    .slice(0, limit)
    .map((skillArea) => ({ skillArea, label: skillLabels[skillArea], score: profile.bySkill[skillArea] }));
}

export function accuracyBySkill(attempts: AttemptRecord[]): Array<{ skillArea: SkillArea; correct: number; total: number; accuracy: number }> {
  const groups = new Map<SkillArea, { correct: number; total: number }>();
  for (const attempt of attempts) {
    if (attempt.correct === undefined) continue;
    const group = groups.get(attempt.skillArea) ?? { correct: 0, total: 0 };
    group.total += 1;
    if (attempt.correct) group.correct += 1;
    groups.set(attempt.skillArea, group);
  }
  return Array.from(groups, ([skillArea, group]) => ({
    skillArea,
    correct: group.correct,
    total: group.total,
    accuracy: group.total === 0 ? 0 : group.correct / group.total,
  }));
}
