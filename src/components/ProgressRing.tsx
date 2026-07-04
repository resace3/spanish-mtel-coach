export function ProgressRing({ value, label }: { value: number; label: string }): JSX.Element {
  const normalized = Math.max(0, Math.min(1, value));
  const circumference = 2 * Math.PI * 28;
  return (
    <div className="progress-ring" aria-label={label}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="28" className="ring-track" />
        <circle
          cx="32"
          cy="32"
          r="28"
          className="ring-value"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - normalized)}
        />
      </svg>
      <span>{Math.round(normalized * 100)}%</span>
    </div>
  );
}
