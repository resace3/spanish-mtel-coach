import { questionBank } from '../src/content/questionBank.ts';
import { questionSchema } from '../src/content/questionSchema.ts';

const minimums = {
  listening: 40,
  reading: 40,
  language_structures: 60,
  culture: 30,
  writing: 35,
  oral: 35,
};

const ids = new Set();
const counts = Object.fromEntries(Object.keys(minimums).map((key) => [key, 0]));
const errors = [];

for (const question of questionBank) {
  const result = questionSchema.safeParse(question);
  if (!result.success) {
    errors.push(`${question.id ?? 'unknown'}: ${result.error.message}`);
    continue;
  }
  if (ids.has(question.id)) errors.push(`${question.id}: duplicate id`);
  ids.add(question.id);
  counts[question.skillArea] += 1;
  if (!question.safetyReviewed) errors.push(`${question.id}: safetyReviewed must be true`);
  if (question.choices && question.choices.length !== 4) errors.push(`${question.id}: must have four choices`);
}

for (const [skill, minimum] of Object.entries(minimums)) {
  if (counts[skill] < minimum) errors.push(`${skill}: expected at least ${minimum}, found ${counts[skill]}`);
}

if (questionBank.length < 240) errors.push(`expected at least 240 questions, found ${questionBank.length}`);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${questionBank.length} original Spanish MTEL-style multiple-choice questions.`);
