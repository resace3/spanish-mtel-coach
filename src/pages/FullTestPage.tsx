import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { QuestionCard, type QuestionSubmitPayload } from '../components/QuestionCard';
import { summarizeWeakAreas } from '../engine/review';
import { getChicagoDateKey } from '../engine/dateChicago';
import { selectMockTestQuestions } from '../engine/dailySelector';
import { scoreObjective } from '../engine/scoring';
import { putAttempt } from '../storage/db';
import type { AttemptRecord } from '../storage/schema';
import type { Question } from '../content/questionTypes';

const QUESTIONS_PER_TEST = 100;
const PASSING_PERCENT = 70;

export function FullTestPage(): JSX.Element {
  const todayKey = getChicagoDateKey();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [index, setIndex] = useState(0);
  const [sessionId, setSessionId] = useState('');

  const weakAreas = useMemo(() => summarizeWeakAreas(attempts, 3), [attempts]);
  const current = questions[index];
  const currentAttempt = current ? attempts.find((attempt) => attempt.questionId === current.id) : undefined;
  const complete = attempts.length === QUESTIONS_PER_TEST;

  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const percent = QUESTIONS_PER_TEST > 0 ? Math.round((correctCount / QUESTIONS_PER_TEST) * 100) : 0;
  const passed = percent >= PASSING_PERCENT;

  function startTest(): void {
    const id = `mock-${Date.now()}`;
    const selected = selectMockTestQuestions({
      questionCount: QUESTIONS_PER_TEST,
      seed: `mock-test:${id}`,
    });
    setSessionId(id);
    setQuestions(selected);
    setAttempts([]);
    setIndex(0);
  }

  async function submit(payload: QuestionSubmitPayload): Promise<void> {
    if (!current || currentAttempt || sessionId.length === 0) return;
    const now = new Date().toISOString();
    const correct = scoreObjective(current, payload.selectedChoiceId);
    const attempt: AttemptRecord = {
      id: `${sessionId}-${current.id}-${Date.now()}`,
      questionId: current.id,
      dateKey: todayKey,
      attemptedAt: now,
      sessionType: 'mock',
      skillArea: current.skillArea,
      objectiveCode: current.objectiveCode,
      difficulty: current.difficulty,
      selectedChoiceId: payload.selectedChoiceId,
      correct,
      elapsedSeconds: payload.elapsedSeconds,
    };

    const nextAttempts = [...attempts, attempt];
    await putAttempt(attempt);
    setAttempts(nextAttempts);
    if (nextAttempts.length < QUESTIONS_PER_TEST) {
      setIndex((value) => value + 1);
    }
  }

  if (questions.length === 0) {
    return (
      <section className="panel">
        <p className="eyebrow">MTEL Mock Exam</p>
        <h1>Take a 100-item Spanish MTEL-style practice exam</h1>
        <p>
          This is a full-length practice test with multiple-choice questions only. You can take this from scratch once per attempt.
        </p>
        <ul>
          <li>Every question is 4-choice multiple-choice.</li>
          <li>Each answer is shown after you submit.</li>
          <li>Your score and pass guidance appear when you finish.</li>
        </ul>
        <p className="muted">Pass/fail is a practice benchmark and is not an official MTEL certification result.</p>
        <button className="primary-button" type="button" onClick={() => startTest()}>
          Start 100-question test
        </button>
      </section>
    );
  }

  if (complete) {
    const advice = passed
      ? 'Great work. Keep using daily practice to hold this level and improve consistency on weaker skills.'
      : `You are close. Focus practice on ${weakAreas.length ? weakAreas.map((item) => item.label).join(', ') : 'your lowest skill areas'} before retaking.`;

    return (
      <section className="complete-screen">
        <p className="eyebrow">Full test complete</p>
        <h1>Score: {correctCount}/{QUESTIONS_PER_TEST}</h1>
        <p>{percent}% correct</p>
        <p className={passed ? 'muted' : 'warning-text'}>{passed ? 'Mock pass achieved' : 'Mock pass not reached'}</p>
        <p>{advice}</p>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => setQuestions([])}>
            Take a new mock exam
          </button>
          <Link className="secondary-button" to="/practice">
            Review weak areas in practice
          </Link>
          <Link className="secondary-button" to="/review">
            Review daily practice history
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <p className="eyebrow">Spanish MTEL mock test</p>
        <h1>
          Question {index + 1} of {QUESTIONS_PER_TEST}
        </h1>
        <progress value={attempts.length} max={QUESTIONS_PER_TEST} aria-label="Mock test progress" />
      </div>
      <QuestionCard question={current} attempt={currentAttempt} onSubmit={(payload) => void submit(payload)} />
      <div className="quiz-nav">
        <button
          className="secondary-button"
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
        >
          Previous
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setIndex((value) => Math.min(QUESTIONS_PER_TEST - 1, value + 1))}
          disabled={!currentAttempt || index === QUESTIONS_PER_TEST - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
