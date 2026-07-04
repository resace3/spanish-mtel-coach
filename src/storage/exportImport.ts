import { getExportData, mergeImportData, putSettings, replaceAllData } from './db';
import { exportDataSchema, type ExportData } from './schema';

interface EncryptedExport {
  encrypted: true;
  version: 1;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  data: string;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function deriveBackupKey(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export function validateImportText(text: string): ExportData {
  const parsed = JSON.parse(text) as unknown;
  return exportDataSchema.parse(parsed);
}

export async function exportProgress(passphrase?: string): Promise<string> {
  const data = await getExportData();
  const json = JSON.stringify(data, null, 2);
  await putSettings({ ...(data.settings ?? { id: 'settings' }), lastExportAt: new Date().toISOString() });
  if (!passphrase) return json;

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 210000;
  const key = await deriveBackupKey(passphrase, salt, iterations);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(json));
  const payload: EncryptedExport = {
    encrypted: true,
    version: 1,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA-256',
    iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  };
  return JSON.stringify(payload, null, 2);
}

export async function decryptExportText(text: string, passphrase: string): Promise<string> {
  const payload = JSON.parse(text) as EncryptedExport;
  if (!payload.encrypted) return text;
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const encrypted = base64ToBytes(payload.data);
  const key = await deriveBackupKey(passphrase, salt, payload.iterations);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return new TextDecoder().decode(plain);
}

export async function importProgress(text: string, mode: 'replace' | 'merge', passphrase?: string): Promise<ExportData> {
  const plain = passphrase ? await decryptExportText(text, passphrase) : text;
  const data = validateImportText(plain);
  if (mode === 'replace') await replaceAllData(data);
  else await mergeImportData(data);
  return data;
}

export function makeDownload(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
