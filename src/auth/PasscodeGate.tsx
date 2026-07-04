import { LockKeyhole } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { unlockSession } from './session';
import { verifyPasscode } from './passcode';

interface Props {
  onUnlock: () => void;
}

export function PasscodeGate({ onUnlock }: Props): JSX.Element {
  const [passcode, setPasscode] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const cooldownSeconds = useMemo(() => Math.max(0, Math.ceil((cooldownUntil - now) / 1000)), [cooldownUntil, now]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (cooldownSeconds > 0 || checking) return;
    setChecking(true);
    setError('');
    const ok = await verifyPasscode(passcode);
    setChecking(false);
    if (ok) {
      unlockSession();
      onUnlock();
      return;
    }
    const nextFailures = failedAttempts + 1;
    setFailedAttempts(nextFailures);
    if (nextFailures >= 5) {
      setCooldownUntil(Date.now() + 30_000);
      setFailedAttempts(0);
    }
    setError('That passcode did not unlock the study app.');
  }

  return (
    <main className="gate-page">
      <section className="gate-panel" aria-labelledby="gate-title">
        <div className="gate-icon" aria-hidden="true">
          <LockKeyhole size={30} />
        </div>
        <p className="eyebrow">Spanish MTEL Coach</p>
        <h1 id="gate-title">Enter the study passcode</h1>
        <p className="muted">
          This is a local study app gate for casual access control. The cooldown and passcode check happen in the browser and are not
          server-grade authentication.
        </p>
        <form onSubmit={(event) => void submit(event)} className="gate-form">
          <label htmlFor="passcode">Passcode</label>
          <input
            id="passcode"
            name="passcode"
            type="password"
            autoComplete="current-password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            disabled={cooldownSeconds > 0}
            required
          />
          {error ? <p className="form-error">{error}</p> : null}
          {cooldownSeconds > 0 ? <p className="form-error">Try again in {cooldownSeconds} seconds. This client-side delay is only a casual speed bump.</p> : null}
          <button className="primary-button" type="submit" disabled={checking || cooldownSeconds > 0}>
            {checking ? 'Checking...' : 'Unlock'}
          </button>
        </form>
      </section>
    </main>
  );
}
