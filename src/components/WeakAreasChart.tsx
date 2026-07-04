export function WeakAreasChart({ areas }: { areas: Array<{ label: string; score: number }> }): JSX.Element {
  const max = Math.max(1, ...areas.map((area) => area.score));
  return (
    <div className="weak-chart">
      {areas.map((area) => (
        <div key={area.label} className="weak-row">
          <span>{area.label}</span>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${Math.max(8, (area.score / max) * 100)}%` }} />
          </div>
          <strong>{area.score.toFixed(1)}</strong>
        </div>
      ))}
    </div>
  );
}
