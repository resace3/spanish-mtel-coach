import { cultureQuestionSeeds } from './cultureQuestions';
import { grammarQuestionSeeds, type GrammarSeed } from './grammarTemplates';
import { listeningPromptSeeds } from './listeningPrompts';
import { oralPromptFamilies } from './oralPrompts';
import type { Choice, Question, SkillArea } from './questionTypes';
import { readingPassageSeeds } from './readingPassages';
import { writingPromptFamilies } from './writingPrompts';
import { buildPromptVariants, type GeneratedPromptSeed } from '../engine/templateGenerator';
import { hashString } from '../engine/prng';

function rebalanceCorrectAnswer(question: Question): Question {
  const correctIndex = question.choices.findIndex((choice) => choice.id === question.correctAnswer);
  if (correctIndex < 0) return question;

  const orderSeed = hashString(question.id);
  const rotateBy = (orderSeed % (question.choices.length - 1)) + 1;
  const reordered = [...question.choices.slice(rotateBy), ...question.choices.slice(0, rotateBy)].map((choice, index) => ({
    id: String.fromCharCode(65 + index),
    text: choice.text,
  }));

  const newCorrectIndex = reordered.findIndex((choice) => choice.text === question.choices[correctIndex].text);
  return {
    ...question,
    choices: reordered,
    correctAnswer: newCorrectIndex >= 0 ? String.fromCharCode(65 + newCorrectIndex) : reordered[0].id,
  };
}

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

function writingChoiceQuestion(seed: GeneratedPromptSeed): Question {
  const choices = choicesFrom([
    'Address the exact task, organize ideas with clear transitions, include specific details, and use an appropriate Spanish register.',
    'List several isolated vocabulary words and leave the reader to infer the message.',
    'Write mostly in English and add a Spanish greeting and closing.',
    'Focus on an unrelated personal story without answering the assigned situation.',
  ]);
  return {
    id: seed.id,
    skillArea: 'writing',
    objectiveCode: seed.objectiveCode,
    difficulty: seed.difficulty,
    promptLanguage: 'mixed',
    promptText: `Multiple choice only: Which plan would produce the strongest written Spanish response? ${seed.promptText}`,
    choices,
    correctAnswer: choices[0].id,
    explanationText:
      'A strong written response must directly answer the task, stay organized, include relevant detail, and use Spanish appropriate to the audience.',
    tags: [...seed.tags, 'multiple-choice-writing'],
    estimatedSeconds: 75,
    source: 'original_template',
    safetyReviewed: true,
  };
}

function oralChoiceQuestion(seed: GeneratedPromptSeed): Question {
  const choices = choicesFrom([
    'State the purpose first, speak in complete Spanish sentences, include the required details, use a fitting register, and close clearly.',
    'Use memorized phrases that sound fluent but do not answer the situation.',
    'Give a one-word answer and rely on tone instead of explaining the message.',
    'Switch mostly to English when the prompt asks for communication in Spanish.',
  ]);
  return {
    id: seed.id,
    skillArea: 'oral',
    objectiveCode: seed.objectiveCode,
    difficulty: seed.difficulty,
    promptLanguage: 'mixed',
    promptText: `Multiple choice only: Which approach would make the strongest spoken Spanish response? ${seed.promptText}`,
    choices,
    correctAnswer: choices[0].id,
    explanationText:
      'A strong spoken response addresses the situation directly in Spanish, gives enough detail, uses an appropriate register, and is easy to follow.',
    tags: [...seed.tags, 'multiple-choice-oral'],
    estimatedSeconds: 75,
    source: 'original_template',
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
  const writingQuestions: Question[] = buildPromptVariants('write', writingPromptFamilies).map(writingChoiceQuestion);
  const oralQuestions: Question[] = buildPromptVariants('oral', oralPromptFamilies).map(oralChoiceQuestion);

  const assembled = [
    ...listeningQuestions,
    ...readingQuestions,
    ...languageQuestions,
    ...cultureQuestions,
    ...writingQuestions,
    ...oralQuestions,
  ];

  return assembled.map(rebalanceCorrectAnswer);
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
