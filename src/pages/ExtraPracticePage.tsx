import { useState } from 'react';
import { QuestionCard, type QuestionSubmitPayload } from '../components/QuestionCard';
import type { Question, SkillArea } from '../content/questionTypes';
import { skillLabels } from '../content/questionTypes';
import { getChicagoDateKey } from '../engine/dateChicago';
import { selectExtraPracticeQuestions, type ExtraPracticeArea } from '../engine/dailySelector';
import { scoreObjective } from '../engine/scoring';
import { getAttempts, getDailySet, putAttempt, putExtraSession } from '../storage/db';
import type { AttemptRecord } from '../storage/schema';

const areas: Array<{ value: ExtraPracticeArea; label: string }> = [
  { value: 'weakest', label: 'Weakest area' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'language_structures', label: 'Language structures' },
  { value: 'culture', label: 'Culture' },
  { value: 'writing', label: 'Writing strategy' },
  { value: 'oral', label: 'Oral strategy' },
  { value: 'mixed', label: 'Mixed review' },
];

export function ExtraPracticePage(): JSX.Element {
  const [area, setArea] = useState<ExtraPracticeArea>('weakest');
  const [count, setCount] = useState<5 | 10 | 20>(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [sessionAttempts, setSessionAttempts] = useState<AttemptRecord[]>([]);
  const [index, setIndex] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const todayKey = getChicagoDateKey();

  async function start(): Promise<void> {
    const [allAttempts, todaySet] = await Promise.all([getAttempts(), getDailySet(todayKey)]);
    const selected = selectExtraPracticeQuestions(area, count, allAttempts, todaySet?.questionIds ?? []);
    const id = `extra-${Date.now()}`;
    await putExtraSession({
      id,
      createdAt: new Date().toISOString(),
      selectedArea: area,
      questionIds: selected.map((question) => question.id),
    });
    setSessionId(id);
    setAttempts(allAttempts);
    setSessionAttempts([]);
    setQuestions(selected);
    setIndex(0);
  }

  async function submit(payload: QuestionSubmitPayload): Promise<void> {
    const question = questions[index];
    if (!question || sessionAttempts.some((attempt) => attempt.questionId === question.id)) return;
    const now = new Date().toISOString();
    const correct = scoreObjective(question, payload.selectedChoiceId);
    const attempt: AttemptRecord = {
      id: `${sessionId}-${question.id}-${Date.now()}`,
      questionId: question.id,
      dateKey: todayKey,
      attemptedAt: now,
      sessionType: 'extra',
      skillArea: question.skillArea as SkillArea,
      objectiveCode: question.objectiveCode,
      difficulty: question.difficulty,
      selectedChoiceId: payload.selectedChoiceId,
      correct,
      elapsedSeconds: payload.elapsedSeconds,
    };
    await putAttempt(attempt);
    setAttempts((value) => [...value, attempt]);
    setSessionAttempts((value) => [...value, attempt]);
    if (sessionAttempts.length + 1 === questions.length) {
      await putExtraSession({
        id: sessionId,
        createdAt: now,
        completedAt: now,
        selectedArea: area,
        questionIds: questions.map((item) => item.id),
      });
    }
  }

  if (questions.length === 0) {
    return (
      <section className="practice-setup panel-wide">
        <p className="eyebrow">Extra practice</p>
        <h1>Choose a focused practice set</h1>
        <div className="form-grid">
          <label>
            Skill focus
            <select value={area} onChange={(event) => setArea(event.target.value as ExtraPracticeArea)}>
              {areas.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Question count
            <select value={count} onChange={(event) => setCount(Number(event.target.value) as 5 | 10 | 20)}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>
        <p className="muted">Extra practice updates weak-area statistics but does not count toward the daily streak.</p>
        <button className="primary-button" type="button" onClick={() => void start()}>
          Start practice
        </button>
      </section>
    );
  }

  const question = questions[index];
  const attempt = sessionAttempts.find((item) => item.questionId === question.id);
  const done = sessionAttempts.length === questions.length;

  if (done) {
    const correct = sessionAttempts.filter((item) => item.correct).length;
    return (
      <section className="complete-screen">
        <p className="eyebrow">Extra practice summary</p>
        <h1>{questions.length} questions finished</h1>
        <p>
          Objective correct: {correct}. Focus: {area === 'weakest' || area === 'mixed' ? area : skillLabels[area]}.
        </p>
        <button className="primary-button" type="button" onClick={() => setQuestions([])}>
          New practice set
        </button>
      </section>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <p className="eyebrow">Extra practice</p>
        <h1>
          Question {index + 1} of {questions.length}
        </h1>
        <progress value={sessionAttempts.length} max={questions.length} aria-label="Extra practice progress" />
      </div>
      <QuestionCard question={question} attempt={attempt} onSubmit={(payload) => void submit(payload)} />
      <div className="quiz-nav">
        <button className="secondary-button" type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
          Previous
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}
          disabled={!attempt || index === questions.length - 1}
        >
          Next
        </button>
      </div>
      <p className="muted">Saved attempts so far: {attempts.length}</p>
    </div>
  );
}
