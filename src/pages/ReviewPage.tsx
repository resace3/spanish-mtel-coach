import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { getQuestionById } from '../content/questionBank';
import { skillLabels } from '../content/questionTypes';
import { getAttempts, getDailySets } from '../storage/db';
import type { AttemptRecord, DailySetRecord } from '../storage/schema';

export function ReviewPage(): JSX.Element {
  const [sets, setSets] = useState<DailySetRecord[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    async function load(): Promise<void> {
      const [loadedSets, loadedAttempts] = await Promise.all([getDailySets(), getAttempts()]);
      const sorted = loadedSets.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
      setSets(sorted);
      setAttempts(loadedAttempts);
      setSelectedDate(sorted[0]?.dateKey ?? '');
    }
    void load();
  }, []);

  const selectedSet = sets.find((set) => set.dateKey === selectedDate);
  const dateAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.dailyDateKey === selectedDate || attempt.dateKey === selectedDate),
    [attempts, selectedDate],
  );

  if (sets.length === 0) return <EmptyState title="No daily sets yet" body="Complete or start a daily set, then return here to review answers and explanations." />;

  return (
    <section className="review-page">
      <p className="eyebrow">Review</p>
      <h1>Daily practice history</h1>
      <label className="date-picker">
        Date
        <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
          {sets.map((set) => (
            <option key={set.dateKey} value={set.dateKey}>
              {set.dateKey} {set.completedAt ? 'complete' : 'in progress'}
            </option>
          ))}
        </select>
      </label>
      <div className="review-list">
        {selectedSet?.questionIds.map((questionId) => {
          const question = getQuestionById(questionId);
          const attempt = dateAttempts.find((item) => item.questionId === questionId);
          return (
            <article key={questionId} className="review-item">
              <span className="badge">{skillLabels[question.skillArea]}</span>
              <h2>{question.promptText}</h2>
              {attempt ? (
                <>
                  <p>
                    <strong>Status:</strong>{' '}
                    {attempt.correct === undefined ? 'Constructed response submitted' : attempt.correct ? 'Correct' : 'Needs review'}
                  </p>
                  {attempt.selectedChoiceId ? <p>Selected choice: {attempt.selectedChoiceId}</p> : null}
                  {attempt.responseText ? <p className="passage">{attempt.responseText}</p> : null}
                  <p>{question.explanationText}</p>
                </>
              ) : (
                <p className="muted">Not answered yet.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
