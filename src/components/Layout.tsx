import { Outlet } from 'react-router-dom';
import { Nav } from './Nav';

export function Layout({ onLock }: { onLock: () => void }): JSX.Element {
  return (
    <div className="app-shell">
      <Nav onLock={onLock} />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
