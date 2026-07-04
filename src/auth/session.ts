const SESSION_KEY = 'spanish-mtel-coach-unlocked';

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'yes';
}

export function unlockSession(): void {
  sessionStorage.setItem(SESSION_KEY, 'yes');
}

export function lockSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
