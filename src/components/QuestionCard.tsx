import { Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question } from '../content/questionTypes';
import { skillLabels } from '../content/questionTypes';
import type { RubricScores } from '../engine/scoring';
import { buildEmptyRubricScores } from '../engine/scoring';
import type { AttemptRecord } from '../storage/schema';
import { AccentToolbar } from './AccentToolbar';
import { AudioPrompt } from './AudioPrompt';
import { ChoiceList } from './ChoiceList';
import { RubricPanel } from './RubricPanel';

export interface QuestionSubmitPayload {
  selectedChoiceId?: string;
  responseText?: string;
  rubricScores?: Partial<RubricScores>;
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
  const [responseText, setResponseText] = useState('');
  const [rubricScores, setRubricScores] = useState<Partial<RubricScores>>(buildEmptyRubricScores());
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSelectedChoiceId(attempt?.selectedChoiceId ?? '');
    setResponseText(attempt?.responseText ?? '');
    setRubricScores(attempt?.rubricScores ?? buildEmptyRubricScores());
    setSeconds(attempt?.elapsedSeconds ?? 0);
    setTimerRunning(false);
  }, [question.id, attempt]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const submitted = Boolean(attempt);
  const isObjective = Boolean(question.choices && question.correctAnswer);
  const isCorrect = submitted && attempt?.correct === true;
  const canSubmit = isObjective ? selectedChoiceId.length > 0 : responseText.trim().length > 0;
  const timerLabel = useMemo(() => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, [seconds]);

  function insertAccent(character: string): void {
    const input = textareaRef.current;
    if (!input) {
      setResponseText((value) => `${value}${character}`);
      return;
    }
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const next = `${responseText.slice(0, start)}${character}${responseText.slice(end)}`;
    setResponseText(next);
    window.requestAnimationFrame(() => {
      input.focus();
      input.selectionStart = start + character.length;
      input.selectionEnd = start + character.length;
    });
  }

  return (
    <article className="question-card">
      <div className="question-meta">
        <span className="badge">{skillLabels[question.skillArea]}</span>
        <span className="badge muted-badge">Difficulty {question.difficulty}</span>
      </div>
      {question.audioScript ? <AudioPrompt script={question.audioScript} submitted={submitted} /> : null}
      {question.passageText ? <p className="passage">{question.passageText}</p> : null}
      <h2>{question.promptText}</h2>
      {isObjective && question.choices ? (
        <ChoiceList
          choices={question.choices}
          selected={selectedChoiceId}
          correctAnswer={question.correctAnswer}
          submitted={submitted}
          onSelect={setSelectedChoiceId}
        />
      ) : (
        <section className="constructed-response">
          {question.skillArea === 'oral' ? (
            <div className="timer-row">
              <Clock size={18} />
              <strong>{timerLabel}</strong>
              <button className="secondary-button compact" type="button" onClick={() => setTimerRunning((value) => !value)} disabled={submitted}>
                {timerRunning ? 'Pause' : 'Start timer'}
              </button>
            </div>
          ) : null}
          <label htmlFor={`response-${question.id}`}>{question.skillArea === 'oral' ? 'Optional transcript' : 'Written response'}</label>
          <AccentToolbar onInsert={insertAccent} />
          <textarea
            ref={textareaRef}
            id={`response-${question.id}`}
            rows={8}
            value={responseText}
            onChange={(event) => setResponseText(event.target.value)}
            disabled={submitted}
          />
          {question.rubric ? <RubricPanel rubric={question.rubric} scores={rubricScores} disabled={submitted} onChange={setRubricScores} /> : null}
        </section>
      )}
      {!submitted ? (
        <button
          className="primary-button"
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              selectedChoiceId: selectedChoiceId || undefined,
              responseText: responseText.trim() || undefined,
              rubricScores: isObjective ? undefined : rubricScores,
              elapsedSeconds: seconds,
            })
          }
        >
          Submit answer
        </button>
      ) : (
        <section className={`explanation ${isObjective ? (isCorrect ? 'correct' : 'wrong') : ''}`}>
          {isObjective ? <strong>{isCorrect ? 'Correct' : 'Review this answer'}</strong> : <strong>Practice feedback</strong>}
          <p>{question.explanationText}</p>
          {attempt?.heuristicFeedback ? (
            <ul>
              {attempt.heuristicFeedback.comments.map((comment) => (
                <li key={comment}>{comment}</li>
              ))}
            </ul>
          ) : null}
        </section>
      )}
    </article>
  );
}
