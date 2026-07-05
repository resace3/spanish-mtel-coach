import { questionBank, questionsBySkill } from '../content/questionBank';
import type { Question, SkillArea } from '../content/questionTypes';
import type { AttemptRecord } from '../storage/schema';
import { computeWeaknessProfile, sortSkillsByWeakness } from './adaptiveWeights';
import { hashString, shuffleStable } from './prng';

export type ExtraPracticeArea = SkillArea | 'weakest' | 'mixed';

export interface DailySelectionInput {
  dateKey: string;
  attempts: AttemptRecord[];
  existingTodayIds?: string[];
}

export interface MockTestSelectionInput {
  questionCount?: number;
  seed?: string;
}

function profileSeed(attempts: AttemptRecord[]): string {
  const signature = attempts
    .slice(-80)
    .map((attempt) => `${attempt.questionId}:${attempt.correct ?? averageRubricBucket(attempt)}`)
    .join('|');
  return String(hashString(signature));
}

function averageRubricBucket(attempt: AttemptRecord): string {
  if (!attempt.rubricScores) return 'na';
  const values = Object.values(attempt.rubricScores).filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return 'na';
  return String(Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
}

function unseenFirst(candidates: Question[], attempts: AttemptRecord[]): Question[] {
  const seen = new Set(attempts.map((attempt) => attempt.questionId));
  return [...candidates].sort((a, b) => Number(seen.has(a.id)) - Number(seen.has(b.id)));
}

function pickQuestion(
  candidates: Question[],
  used: Set<string>,
  seed: string,
  attempts: AttemptRecord[],
  avoidIds: Set<string>,
): Question {
  const available = unseenFirst(
    candidates.filter((question) => !used.has(question.id) && !avoidIds.has(question.id)),
    attempts,
  );
  const relaxed = unseenFirst(candidates.filter((question) => !used.has(question.id)), attempts);
  const shuffled = shuffleStable(available.length ? available : relaxed, seed);
  const picked = shuffled[0];
  if (!picked) throw new Error('Unable to select a question for the requested criteria.');
  used.add(picked.id);
  return picked;
}

export function selectDailyQuestions({ dateKey, attempts, existingTodayIds = [] }: DailySelectionInput): Question[] {
  const profile = computeWeaknessProfile(attempts);
  const weakSkills = sortSkillsByWeakness(profile);
  const used = new Set<string>();
  const avoidIds = new Set(existingTodayIds);
  const seed = `${dateKey}:${profileSeed(attempts)}`;
  const slotSkills: Array<SkillArea | 'listening-main' | 'listening-infer' | 'reading-main' | 'reading-detail' | 'communication'> = [
    'listening-main',
    'listening-infer',
    'reading-main',
    'reading-detail',
    'language_structures',
    'language_structures',
    'culture',
    attempts.length === 0 ? 'communication' : weakSkills.find((skill) => skill !== 'writing' && skill !== 'oral') ?? 'communication',
    'writing',
    'oral',
  ];

  return slotSkills.map((slot, index) => {
    if (slot === 'listening-main') {
      return pickQuestion(
        questionBank.filter((question) => question.skillArea === 'listening' && question.tags.includes('listening-main-idea')),
        used,
        `${seed}:daily:${index}`,
        attempts,
        avoidIds,
      );
    }
    if (slot === 'listening-infer') {
      return pickQuestion(
        questionBank.filter((question) => question.skillArea === 'listening' && question.tags.includes('listening-inference')),
        used,
        `${seed}:daily:${index}`,
        attempts,
        avoidIds,
      );
    }
    if (slot === 'reading-main') {
      return pickQuestion(
        questionBank.filter((question) => question.skillArea === 'reading' && question.tags.includes('reading-main-idea')),
        used,
        `${seed}:daily:${index}`,
        attempts,
        avoidIds,
      );
    }
    if (slot === 'reading-detail') {
      return pickQuestion(
        questionBank.filter((question) => question.skillArea === 'reading' && question.tags.includes('reading-detail-inference')),
        used,
        `${seed}:daily:${index}`,
        attempts,
        avoidIds,
      );
    }
    if (slot === 'communication') {
      return pickQuestion(
        questionBank.filter(
          (question) =>
            (question.skillArea === 'language_structures' || question.skillArea === 'culture') &&
            question.tags.some((tag) => ['classroom', 'register', 'communication', 'community'].includes(tag)),
        ),
        used,
        `${seed}:daily:${index}`,
        attempts,
        avoidIds,
      );
    }
    return pickQuestion(questionsBySkill(slot), used, `${seed}:daily:${index}`, attempts, avoidIds);
  });
}

export function selectExtraPracticeQuestions(
  area: ExtraPracticeArea,
  count: 5 | 10 | 20,
  attempts: AttemptRecord[],
  avoidQuestionIds: string[] = [],
): Question[] {
  const profile = computeWeaknessProfile(attempts);
  const targetArea = area === 'weakest' ? profile.weakestSkill : area;
  const avoidIds = new Set(avoidQuestionIds);
  const used = new Set<string>();
  const missedIds = attempts.filter((attempt) => attempt.correct === false).map((attempt) => attempt.questionId);
  const missedQuestions = questionBank.filter(
    (question) =>
      missedIds.includes(question.id) &&
      !avoidIds.has(question.id) &&
      (targetArea === 'mixed' || question.skillArea === targetArea),
  );
  const pool = targetArea === 'mixed' ? questionBank : questionsBySkill(targetArea);
  const seed = `extra:${area}:${count}:${profileSeed(attempts)}`;
  const picked: Question[] = [];

  for (const question of shuffleStable(missedQuestions, `${seed}:missed`)) {
    if (picked.length >= Math.min(3, count)) break;
    used.add(question.id);
    picked.push(question);
  }

  while (picked.length < count) {
    picked.push(pickQuestion(pool, used, `${seed}:${picked.length}`, attempts, avoidIds));
  }

  return picked;
}

export function selectMockTestQuestions({
  questionCount = 100,
  seed = 'spanish-mtel-mock-test',
}: MockTestSelectionInput = {}): Question[] {
  if (questionCount <= 0) throw new Error('Mock test must request at least one question.');
  const randomized = shuffleStable(questionBank, seed);
  if (randomized.length < questionCount) {
    throw new Error(`Not enough questions to build a ${questionCount}-item mock test.`);
  }
  return randomized.slice(0, questionCount);
}
