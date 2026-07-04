import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { clearAllData } from '../storage/db';
import { exportProgress, importProgress, makeDownload } from '../storage/exportImport';

export function SettingsPage({ onLock }: { onLock: () => void }): JSX.Element {
  const [encryptExport, setEncryptExport] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [pendingClear, setPendingClear] = useState(false);
  const [pendingImportText, setPendingImportText] = useState('');
  const [status, setStatus] = useState('');

  async function handleExport(): Promise<void> {
    const text = await exportProgress(encryptExport ? passphrase : undefined);
    makeDownload(`spanish-mtel-coach-progress-${new Date().toISOString().slice(0, 10)}.json`, text);
    setStatus('Progress export prepared as a local JSON file.');
  }

  async function handleImport(): Promise<void> {
    await importProgress(pendingImportText, importMode, passphrase || undefined);
    setPendingImportText('');
    setStatus(`Progress imported with ${importMode} mode.`);
  }

  async function confirmClear(): Promise<void> {
    await clearAllData();
    setPendingClear(false);
    setStatus('Local IndexedDB progress has been cleared.');
  }

  return (
    <section className="settings-page">
      <p className="eyebrow">Settings</p>
      <h1>Local data and access</h1>
      {status ? <p className="status-message">{status}</p> : null}
      <div className="settings-grid">
        <section className="panel">
          <h2>Lock app</h2>
          <p>The lock button clears only the current session marker from sessionStorage.</p>
          <button className="secondary-button" type="button" onClick={onLock}>
            Lock now
          </button>
        </section>
        <section className="panel">
          <h2>Export progress</h2>
          <p className="warning-text">Unencrypted exports contain practice answers, scores, and streak history.</p>
          <label className="checkbox-row">
            <input type="checkbox" checked={encryptExport} onChange={(event) => setEncryptExport(event.target.checked)} />
            Encrypt export with a backup passphrase
          </label>
          <label>
            Backup passphrase
            <input
              type="password"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              placeholder={encryptExport ? 'Required for encrypted export' : 'Optional for encrypted import/export'}
            />
          </label>
          <button className="primary-button" type="button" onClick={() => void handleExport()} disabled={encryptExport && passphrase.length < 8}>
            Export progress
          </button>
        </section>
        <section className="panel">
          <h2>Import progress</h2>
          <p>Imports are validated before writing to IndexedDB. Replace mode overwrites local progress after confirmation.</p>
          <label>
            Import mode
            <select value={importMode} onChange={(event) => setImportMode(event.target.value as 'replace' | 'merge')}>
              <option value="merge">Merge</option>
              <option value="replace">Replace</option>
            </select>
          </label>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void file.text().then(setPendingImportText);
            }}
          />
        </section>
        <section className="panel">
          <h2>Storage location</h2>
          <p>Progress is stored only in this browser in IndexedDB. Clearing browser data can delete it unless you export a backup first.</p>
          <p>The app version is 1.0.0.</p>
          <button className="danger-button" type="button" onClick={() => setPendingClear(true)}>
            Clear all local data
          </button>
        </section>
        <section className="panel security-note">
          <h2>Passcode limitation</h2>
          <p>
            This is a public static site. The passcode hash is shipped to the browser, so the gate keeps out casual visitors but is not
            real authentication for sensitive data.
          </p>
        </section>
      </div>
      {pendingClear ? (
        <ConfirmDialog
          title="Clear local data?"
          body="This deletes practice progress from this browser. Export first if you want a backup."
          confirmLabel="Clear local data"
          onCancel={() => setPendingClear(false)}
          onConfirm={() => void confirmClear()}
        />
      ) : null}
      {pendingImportText ? (
        <ConfirmDialog
          title="Import progress?"
          body={`This will ${importMode} local IndexedDB practice data after validating the backup file.`}
          confirmLabel="Import progress"
          onCancel={() => setPendingImportText('')}
          onConfirm={() => void handleImport()}
        />
      ) : null}
    </section>
  );
}
