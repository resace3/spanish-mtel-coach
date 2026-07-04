import { useEffect, useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { PasscodeGate } from './auth/PasscodeGate';
import { isSessionUnlocked, lockSession } from './auth/session';
import { getChicagoDateKey } from './engine/dateChicago';
import { AppRoutes } from './routes';
import { recordLoginDate } from './storage/db';

export default function App(): JSX.Element {
  const [unlocked, setUnlocked] = useState(() => isSessionUnlocked());

  useEffect(() => {
    if (unlocked) void recordLoginDate(getChicagoDateKey());
  }, [unlocked]);

  if (!unlocked) return <PasscodeGate onUnlock={() => setUnlocked(true)} />;

  return (
    <HashRouter>
      <AppRoutes
        onLock={() => {
          lockSession();
          setUnlocked(false);
        }}
      />
    </HashRouter>
  );
}
