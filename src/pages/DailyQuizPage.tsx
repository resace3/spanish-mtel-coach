import { Link } from 'react-router-dom';
import { QuestionCard, type QuestionSubmitPayload } from '../components/QuestionCard';
import { getQuestionById } from '../content/questionBank';
import type { Question } from '../content/questionTypes';
import { getChicagoDateKey } from '../engine/dateChicago';
import { selectDailyQuestions } from '../engine/dailySelector';
import { scoreObjective } from '../engine/scoring';
import { buildStreakState } from '../engine/streaks';
import {
  getAttempts,
  getCompletions,
  getDailySet,
  getLoginDates,
  putAttempt,
  putCompletion,
  putDailySet,
} from '../storage/db';
import type { AttemptRecord, DailyCompletionRecord, DailySetRecord } from '../storage/schema';
import { useEffect, useMemo, useState } from 'react';

export function DailyQuizPage(): JSX.Element {
  const todayKey = getChicagoDateKey();
  const [dailySet, setDailySet] = useState<DailySetRecord | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [completions, setCompletions] = useState<DailyCompletionRecord[]>([]);
  const [loginDates, setLoginDates] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      const [allAttempts, allCompletions, existingSet, loadedLogins] = await Promise.all([
        getAttempts(),
        getCompletions(),
        getDailySet(todayKey),
        getLoginDates(),
      ]);
      let set = existingSet;
      if (!set) {
        const selected = selectDailyQuestions({ dateKey: todayKey, attempts: allAttempts });
        set = {
          dateKey: todayKey,
          questionIds: selected.map((question) => question.id),
          createdAt: new Date().toISOString(),
          submittedQuestionIds: [],
        };
        await putDailySet(set);
      }
      setAttempts(allAttempts);
      setCompletions(allCompletions);
      setDailySet(set);
      setQuestions(set.questionIds.map(getQuestionById));
      setLoginDates(loadedLogins);
      setLoading(false);
    }
    void load();
  }, [todayKey]);

  const dailyAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.sessionType === 'daily' && attempt.dailyDateKey === todayKey),
    [attempts, todayKey],
  );
  const complete = Boolean(dailySet?.completedAt) || completions.some((completion) => completion.dateKey === todayKey);
  const currentQuestion = questions[index];
  const currentAttempt = currentQuestion ? dailyAttempts.find((attempt) => attempt.questionId === currentQuestion.id) : undefined;

  async function submit(payload: QuestionSubmitPayload): Promise<void> {
    if (!currentQuestion || currentAttempt || !dailySet) return;
    const now = new Date().toISOString();
    const correct = scoreObjective(currentQuestion, payload.selectedChoiceId);
    const attempt: AttemptRecord = {
      id: `daily-${todayKey}-${currentQuestion.id}-${Date.now()}`,
      questionId: currentQuestion.id,
      dateKey: todayKey,
      attemptedAt: now,
      sessionType: 'daily',
      dailyDateKey: todayKey,
      skillArea: currentQuestion.skillArea,
      objectiveCode: currentQuestion.objectiveCode,
      difficulty: currentQuestion.difficulty,
      selectedChoiceId: payload.selectedChoiceId,
      correct,
      elapsedSeconds: payload.elapsedSeconds,
    };
    await putAttempt(attempt);
    const submittedQuestionIds = [...new Set([...dailySet.submittedQuestionIds, currentQuestion.id])];
    const updatedSet: DailySetRecord = { ...dailySet, submittedQuestionIds };
    const nextAttempts = [...attempts, attempt];
    if (submittedQuestionIds.length === 10 && !updatedSet.completedAt) {
      updatedSet.completedAt = now;
      const score = nextAttempts.filter((item) => item.sessionType === 'daily' && item.dailyDateKey === todayKey && item.correct === true).length;
      const completion = { dateKey: todayKey, completedAt: now, score, total: 10 };
      await putCompletion(completion);
      setCompletions((value) => [...value.filter((item) => item.dateKey !== todayKey), completion]);
    }
    await putDailySet(updatedSet);
    setDailySet(updatedSet);
    setAttempts(nextAttempts);
  }

  if (loading) return <p className="muted">Loading daily practice...</p>;
  if (!currentQuestion || !dailySet) return <p className="form-error">Daily practice could not be loaded.</p>;

  if (complete) {
    const streak = buildStreakState(completions, attempts, loginDates, todayKey);
    const correct = dailyAttempts.filter((attempt) => attempt.correct).length;
    return (
      <section className="complete-screen">
        <p className="eyebrow">Daily complete</p>
        <h1>All 10 questions are submitted</h1>
        <p>
          Objective score: {correct} correct. Current streak: <strong>{streak.currentStreak}</strong>.
        </p>
        <div className="button-row">
          <Link className="primary-button" to="/">
            Dashboard
          </Link>
          <Link className="secondary-button" to="/practice">
            Suggested extra practice
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <p className="eyebrow">Daily set for {todayKey}</p>
        <h1>Question {index + 1} of 10</h1>
        <progress value={dailySet.submittedQuestionIds.length} max={10} aria-label="Daily progress" />
      </div>
      <QuestionCard question={currentQuestion} attempt={currentAttempt} onSubmit={(payload) => void submit(payload)} />
      <div className="quiz-nav">
        <button className="secondary-button" type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
          Previous
        </button>
        <button className="secondary-button" type="button" onClick={() => setIndex((value) => Math.min(9, value + 1))} disabled={!currentAttempt || index === 9}>
          Next
        </button>
      </div>
    </div>
  );
}
