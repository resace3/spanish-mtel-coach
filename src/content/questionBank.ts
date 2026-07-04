import { cultureQuestionSeeds } from './cultureQuestions';
import { grammarQuestionSeeds, type GrammarSeed } from './grammarTemplates';
import { listeningPromptSeeds } from './listeningPrompts';
import { oralPromptFamilies } from './oralPrompts';
import type { Choice, Question, SkillArea } from './questionTypes';
import { standardRubric } from './questionTypes';
import { readingPassageSeeds } from './readingPassages';
import { writingPromptFamilies } from './writingPrompts';
import { buildPromptVariants } from '../engine/templateGenerator';

function choicesFrom(labels: string[]): Choice[] {
  return labels.map((text, index) => ({ id: String.fromCharCode(65 + index), text }));
}

function objectiveQuestionFromSeed(seed: GrammarSeed, skillArea: SkillArea, idPrefix: string): Question {
  const choices = choicesFrom(seed.choices);
  return {
    id: `${idPrefix}-${seed.id}`,
    skillArea,
    objectiveCode: seed.objectiveCode,
    difficulty: seed.difficulty,
    promptLanguage: 'mixed',
    promptText: seed.promptText,
    choices,
    correctAnswer: choices[seed.correctIndex].id,
    explanationText: seed.explanationText,
    tags: seed.tags,
    estimatedSeconds: skillArea === 'culture' ? 75 : 60,
    source: 'original_static',
    safetyReviewed: true,
  };
}

export function buildQuestionBank(): Question[] {
  const listeningQuestions: Question[] = listeningPromptSeeds.flatMap((seed) => {
    const mainChoices = choicesFrom(seed.mainChoices);
    const inferenceChoices = choicesFrom(seed.inferenceChoices);
    return [
      {
        id: `listen-${seed.id}-main`,
        skillArea: 'listening',
        objectiveCode: seed.objectiveCode,
        difficulty: seed.difficulty,
        promptLanguage: 'mixed',
        promptText: seed.mainQuestion,
        audioScript: seed.script,
        choices: mainChoices,
        correctAnswer: mainChoices[seed.mainCorrectIndex].id,
        explanationText: seed.mainExplanation,
        tags: [...seed.tags, 'listening-main-idea'],
        estimatedSeconds: 90,
        source: 'original_static',
        safetyReviewed: true,
      },
      {
        id: `listen-${seed.id}-infer`,
        skillArea: 'listening',
        objectiveCode: seed.objectiveCode,
        difficulty: Math.min(5, seed.difficulty + 1) as Question['difficulty'],
        promptLanguage: 'mixed',
        promptText: seed.inferenceQuestion,
        audioScript: seed.script,
        choices: inferenceChoices,
        correctAnswer: inferenceChoices[seed.inferenceCorrectIndex].id,
        explanationText: seed.inferenceExplanation,
        tags: [...seed.tags, 'listening-inference'],
        estimatedSeconds: 105,
        source: 'original_static',
        safetyReviewed: true,
      },
    ];
  });

  const readingQuestions: Question[] = readingPassageSeeds.flatMap((seed) => {
    const mainChoices = choicesFrom(seed.mainChoices);
    const detailChoices = choicesFrom(seed.detailChoices);
    return [
      {
        id: `read-${seed.id}-main`,
        skillArea: 'reading',
        objectiveCode: seed.objectiveCode,
        difficulty: seed.difficulty,
        promptLanguage: 'mixed',
        promptText: seed.mainQuestion,
        passageText: seed.passage,
        choices: mainChoices,
        correctAnswer: mainChoices[seed.mainCorrectIndex].id,
        explanationText: seed.mainExplanation,
        tags: [...seed.tags, 'reading-main-idea'],
        estimatedSeconds: 100,
        source: 'original_static',
        safetyReviewed: true,
      },
      {
        id: `read-${seed.id}-detail`,
        skillArea: 'reading',
        objectiveCode: seed.objectiveCode,
        difficulty: seed.difficulty,
        promptLanguage: 'mixed',
        promptText: seed.detailQuestion,
        passageText: seed.passage,
        choices: detailChoices,
        correctAnswer: detailChoices[seed.detailCorrectIndex].id,
        explanationText: seed.detailExplanation,
        tags: [...seed.tags, 'reading-detail-inference'],
        estimatedSeconds: 110,
        source: 'original_static',
        safetyReviewed: true,
      },
    ];
  });

  const languageQuestions = grammarQuestionSeeds.map((seed) => objectiveQuestionFromSeed(seed, 'language_structures', 'grammar'));
  const cultureQuestions = cultureQuestionSeeds.map((seed) => objectiveQuestionFromSeed(seed, 'culture', 'culture'));
  const writingQuestions: Question[] = buildPromptVariants('write', writingPromptFamilies).map((seed) => ({
    id: seed.id,
    skillArea: 'writing',
    objectiveCode: seed.objectiveCode,
    difficulty: seed.difficulty,
    promptLanguage: 'mixed',
    promptText: seed.promptText,
    rubric: standardRubric,
    explanationText:
      'Use the rubric for practice self-assessment. This local feedback is not official MTEL scoring and should be treated as study guidance only.',
    tags: seed.tags,
    estimatedSeconds: 420,
    source: 'original_template',
    safetyReviewed: true,
  }));
  const oralQuestions: Question[] = buildPromptVariants('oral', oralPromptFamilies).map((seed) => ({
    id: seed.id,
    skillArea: 'oral',
    objectiveCode: seed.objectiveCode,
    difficulty: seed.difficulty,
    promptLanguage: 'mixed',
    promptText: seed.promptText,
    rubric: standardRubric,
    explanationText:
      'Use the timer, speak in Spanish, then self-assess with the rubric. No microphone audio is recorded.',
    tags: seed.tags,
    estimatedSeconds: 240,
    source: 'original_template',
    safetyReviewed: true,
  }));

  return [
    ...listeningQuestions,
    ...readingQuestions,
    ...languageQuestions,
    ...cultureQuestions,
    ...writingQuestions,
    ...oralQuestions,
  ];
}

export const questionBank = buildQuestionBank();
export const questionById = new Map(questionBank.map((question) => [question.id, question]));

export function getQuestionById(id: string): Question {
  const question = questionById.get(id);
  if (!question) throw new Error(`Unknown question id: ${id}`);
  return question;
}

export function questionsBySkill(skillArea: SkillArea): Question[] {
  return questionBank.filter((question) => question.skillArea === skillArea);
}
