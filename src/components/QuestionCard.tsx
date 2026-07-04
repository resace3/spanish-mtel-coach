import { useEffect, useState } from 'react';
import type { Question } from '../content/questionTypes';
import { skillLabels } from '../content/questionTypes';
import type { AttemptRecord } from '../storage/schema';
import { AudioPrompt } from './AudioPrompt';
import { ChoiceList } from './ChoiceList';

export interface QuestionSubmitPayload {
  selectedChoiceId: string;
  elapsedSeconds?: number;
}

export function QuestionCard({
  question,
  attempt,
  onSubmit,
}: {
  question: Question;
  attempt?: AttemptRecord;
  onSubmit: (payload: QuestionSubmitPayload) => void;
}): JSX.Element {
  const [selectedChoiceId, setSelectedChoiceId] = useState('');
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSelectedChoiceId(attempt?.selectedChoiceId ?? '');
    setSeconds(attempt?.elapsedSeconds ?? 0);
  }, [question.id, attempt]);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [question.id]);

  const submitted = Boolean(attempt);
  const isCorrect = submitted && attempt?.correct === true;
  const canSubmit = selectedChoiceId.length > 0;

  return (
    <article className="question-card">
      <div className="question-meta">
        <span className="badge">{skillLabels[question.skillArea]}</span>
        <span className="badge muted-badge">Difficulty {question.difficulty}</span>
      </div>
      {question.audioScript ? <AudioPrompt script={question.audioScript} submitted={submitted} /> : null}
      {question.passageText ? <p className="passage">{question.passageText}</p> : null}
      <h2>{question.promptText}</h2>
      <ChoiceList
        choices={question.choices}
        selected={selectedChoiceId}
        correctAnswer={question.correctAnswer}
        submitted={submitted}
        onSelect={setSelectedChoiceId}
      />
      {!submitted ? (
        <button
          className="primary-button"
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              selectedChoiceId,
              elapsedSeconds: seconds,
            })
          }
        >
          Submit answer
        </button>
      ) : (
        <section className={`explanation ${isCorrect ? 'correct' : 'wrong'}`}>
          <strong>{isCorrect ? 'Correct' : 'Review this answer'}</strong>
          <p>{question.explanationText}</p>
        </section>
      )}
    </article>
  );
}
