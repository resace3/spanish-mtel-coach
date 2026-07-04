import type { StreakState } from '../engine/streaks';

export function StreakCalendar({ days }: { days: StreakState['last7Days'] }): JSX.Element {
  return (
    <div className="streak-calendar" aria-label="Last 7 days activity">
      {days.map((day) => (
        <div key={day.dateKey} className={`day-dot ${day.completed ? 'completed' : day.active ? 'active' : day.login ? 'login' : ''}`}>
          <span>{day.dateKey.slice(5)}</span>
          <small>{day.completed ? 'Done' : day.active ? 'Active' : day.login ? 'Open' : 'Idle'}</small>
        </div>
      ))}
    </div>
  );
}
