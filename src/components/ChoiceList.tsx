import type { Choice } from '../content/questionTypes';

export function ChoiceList({
  choices,
  selected,
  correctAnswer,
  submitted,
  onSelect,
}: {
  choices: Choice[];
  selected?: string;
  correctAnswer?: string;
  submitted: boolean;
  onSelect: (choiceId: string) => void;
}): JSX.Element {
  return (
    <fieldset className="choice-list">
      <legend className="sr-only">Answer choices</legend>
      {choices.map((choice) => {
        const isCorrect = submitted && choice.id === correctAnswer;
        const isWrong = submitted && selected === choice.id && choice.id !== correctAnswer;
        return (
          <label key={choice.id} className={`choice ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
            <input
              type="radio"
              name="choice"
              value={choice.id}
              checked={selected === choice.id}
              onChange={() => onSelect(choice.id)}
              disabled={submitted}
            />
            <span className="choice-key">{choice.id}</span>
            <span>{choice.text}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
