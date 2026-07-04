import type { Rubric } from '../content/questionTypes';
import type { RubricScores } from '../engine/scoring';

export function RubricPanel({
  rubric,
  scores,
  disabled = false,
  onChange,
}: {
  rubric: Rubric;
  scores: Partial<RubricScores>;
  disabled?: boolean;
  onChange: (scores: Partial<RubricScores>) => void;
}): JSX.Element {
  return (
    <section className="rubric-panel" aria-label="Practice rubric">
      <h3>Practice rubric</h3>
      {rubric.categories.map((category) => (
        <label key={category.name} className="rubric-row">
          <span>
            <strong>{category.name}</strong>
            <small>{category.description}</small>
          </span>
          <select
            value={scores[category.name] ?? 0}
            disabled={disabled}
            onChange={(event) => onChange({ ...scores, [category.name]: Number(event.target.value) })}
          >
            {[0, 1, 2, 3, 4].map((score) => (
              <option key={score} value={score}>
                {score}
              </option>
            ))}
          </select>
        </label>
      ))}
      <p className="muted">These scores are self-assessment practice only, not official MTEL scoring.</p>
    </section>
  );
}
