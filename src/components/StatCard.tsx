import type { ReactNode } from 'react';

export function StatCard({ label, value, detail, icon }: { label: string; value: ReactNode; detail?: string; icon?: ReactNode }): JSX.Element {
  return (
    <section className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        {icon ? <span className="stat-icon">{icon}</span> : null}
      </div>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}
