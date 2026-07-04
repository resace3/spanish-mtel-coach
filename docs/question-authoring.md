# Question Authoring

Question items live in `src/content`.

Each question supports:

- `id`
- `skillArea`
- `objectiveCode`
- `difficulty`
- `promptLanguage`
- `promptText`
- optional `passageText`
- optional `audioScript`
- optional four `choices`
- optional `correctAnswer`
- optional `rubric`
- `explanationText`
- `tags`
- `estimatedSeconds`
- `source`
- `safetyReviewed`

Multiple-choice questions must have exactly four choices, one correct answer, and an explanation.

Writing and oral prompts must not have one required correct answer. They must include the four-category rubric:

- task completion
- grammar and syntax
- vocabulary and idiom
- organization and communicative effectiveness

## Content Standards

- Write original content only.
- Do not copy official MTEL questions.
- Do not copy copyrighted passages.
- Avoid stereotypes and shallow cultural claims.
- Treat regional Spanish variation as legitimate.
- Include plausible distractors without trick trivia.
- Use explanations that teach the underlying language or cultural reasoning.

## Validation

Question validation runs in GitHub Actions:

```bash
npm run validate:questions
```

Codex should not run this locally for this repository; validation belongs in Actions.
