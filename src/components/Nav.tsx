import { CalendarCheck, Dumbbell, History, Home, Info, Lock, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function Nav({ onLock }: { onLock: () => void }): JSX.Element {
  const links = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/daily', label: 'Daily', icon: CalendarCheck },
    { to: '/practice', label: 'Practice', icon: Dumbbell },
    { to: '/review', label: 'Review', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/about', label: 'About', icon: Info },
  ];
  return (
    <nav className="nav-shell" aria-label="Primary">
      <div className="brand-mark">
        <span aria-hidden="true">MTEL</span>
      </div>
      <div className="nav-links">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} title={label} aria-label={label}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      <button className="icon-text-button" type="button" onClick={onLock}>
        <Lock size={18} />
        <span>Lock</span>
      </button>
    </nav>
  );
}
