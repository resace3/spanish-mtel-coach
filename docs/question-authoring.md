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
- four `choices`
- `correctAnswer`
- optional `rubric`
- `explanationText`
- `tags`
- `estimatedSeconds`
- `source`
- `safetyReviewed`

Every learner-facing practice item is multiple choice. Each question must have exactly four choices, one correct answer, and an explanation.

Writing and oral skill areas should be authored as multiple-choice response-strategy or judgment questions. Do not add typed free-response prompts, transcript fields, microphone recording, or self-scored rubric tasks.

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
