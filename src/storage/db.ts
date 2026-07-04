import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, stores } from './migrations';
import type {
  AttemptRecord,
  DailyCompletionRecord,
  DailySetRecord,
  ExportData,
  ExtraPracticeSessionRecord,
  UserSettings,
} from './schema';

interface SpanishMtelDb extends DBSchema {
  settings: {
    key: string;
    value: UserSettings;
  };
  attempts: {
    key: string;
    value: AttemptRecord;
    indexes: { 'by-date': string; 'by-question': string; 'by-skill': string };
  };
  dailySets: {
    key: string;
    value: DailySetRecord;
  };
  completions: {
    key: string;
    value: DailyCompletionRecord;
  };
  extraSessions: {
    key: string;
    value: ExtraPracticeSessionRecord;
  };
  meta: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<SpanishMtelDb>> | undefined;

export function openSpanishMtelDb(): Promise<IDBPDatabase<SpanishMtelDb>> {
  dbPromise ??= openDB<SpanishMtelDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(stores.settings)) db.createObjectStore(stores.settings, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(stores.attempts)) {
        const attempts = db.createObjectStore(stores.attempts, { keyPath: 'id' });
        attempts.createIndex('by-date', 'dateKey');
        attempts.createIndex('by-question', 'questionId');
        attempts.createIndex('by-skill', 'skillArea');
      }
      if (!db.objectStoreNames.contains(stores.dailySets)) db.createObjectStore(stores.dailySets, { keyPath: 'dateKey' });
      if (!db.objectStoreNames.contains(stores.completions)) db.createObjectStore(stores.completions, { keyPath: 'dateKey' });
      if (!db.objectStoreNames.contains(stores.extraSessions)) db.createObjectStore(stores.extraSessions, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(stores.meta)) db.createObjectStore(stores.meta);
    },
  });
  return dbPromise;
}

export async function getSettings(): Promise<UserSettings> {
  const db = await openSpanishMtelDb();
  return (await db.get(stores.settings, 'settings')) ?? { id: 'settings' };
}

export async function putSettings(settings: UserSettings): Promise<void> {
  const db = await openSpanishMtelDb();
  await db.put(stores.settings, settings);
}

export async function getAttempts(): Promise<AttemptRecord[]> {
  const db = await openSpanishMtelDb();
  return db.getAll(stores.attempts);
}

export async function putAttempt(attempt: AttemptRecord): Promise<void> {
  const db = await openSpanishMtelDb();
  await db.put(stores.attempts, attempt);
}

export async function getDailySet(dateKey: string): Promise<DailySetRecord | undefined> {
  const db = await openSpanishMtelDb();
  return db.get(stores.dailySets, dateKey);
}

export async function putDailySet(set: DailySetRecord): Promise<void> {
  const db = await openSpanishMtelDb();
  await db.put(stores.dailySets, set);
}

export async function getDailySets(): Promise<DailySetRecord[]> {
  const db = await openSpanishMtelDb();
  return db.getAll(stores.dailySets);
}

export async function putCompletion(completion: DailyCompletionRecord): Promise<void> {
  const db = await openSpanishMtelDb();
  await db.put(stores.completions, completion);
}

export async function getCompletions(): Promise<DailyCompletionRecord[]> {
  const db = await openSpanishMtelDb();
  return db.getAll(stores.completions);
}

export async function putExtraSession(session: ExtraPracticeSessionRecord): Promise<void> {
  const db = await openSpanishMtelDb();
  await db.put(stores.extraSessions, session);
}

export async function getExtraSessions(): Promise<ExtraPracticeSessionRecord[]> {
  const db = await openSpanishMtelDb();
  return db.getAll(stores.extraSessions);
}

export async function getLoginDates(): Promise<string[]> {
  const db = await openSpanishMtelDb();
  return ((await db.get(stores.meta, 'loginDates')) as string[] | undefined) ?? [];
}

export async function recordLoginDate(dateKey: string): Promise<void> {
  const db = await openSpanishMtelDb();
  const existing = new Set(await getLoginDates());
  existing.add(dateKey);
  await db.put(stores.meta, [...existing].sort(), 'loginDates');
}

export async function getExportData(): Promise<ExportData> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: await getSettings(),
    attempts: await getAttempts(),
    dailySets: await getDailySets(),
    completions: await getCompletions(),
    extraSessions: await getExtraSessions(),
    meta: { app: 'spanish-mtel-coach', storage: 'indexeddb' },
  };
}

export async function replaceAllData(data: ExportData): Promise<void> {
  const db = await openSpanishMtelDb();
  const tx = db.transaction([stores.settings, stores.attempts, stores.dailySets, stores.completions, stores.extraSessions], 'readwrite');
  void tx.objectStore(stores.settings).clear();
  void tx.objectStore(stores.attempts).clear();
  void tx.objectStore(stores.dailySets).clear();
  void tx.objectStore(stores.completions).clear();
  void tx.objectStore(stores.extraSessions).clear();
  if (data.settings) void tx.objectStore(stores.settings).put(data.settings);
  data.attempts.forEach((attempt) => void tx.objectStore(stores.attempts).put(attempt));
  data.dailySets.forEach((set) => void tx.objectStore(stores.dailySets).put(set));
  data.completions.forEach((completion) => void tx.objectStore(stores.completions).put(completion));
  data.extraSessions.forEach((session) => void tx.objectStore(stores.extraSessions).put(session));
  await tx.done;
}

export async function mergeImportData(data: ExportData): Promise<void> {
  const db = await openSpanishMtelDb();
  const tx = db.transaction([stores.settings, stores.attempts, stores.dailySets, stores.completions, stores.extraSessions], 'readwrite');
  if (data.settings) void tx.objectStore(stores.settings).put(data.settings);
  data.attempts.forEach((attempt) => void tx.objectStore(stores.attempts).put(attempt));
  data.dailySets.forEach((set) => void tx.objectStore(stores.dailySets).put(set));
  data.completions.forEach((completion) => void tx.objectStore(stores.completions).put(completion));
  data.extraSessions.forEach((session) => void tx.objectStore(stores.extraSessions).put(session));
  await tx.done;
}

export async function clearAllData(): Promise<void> {
  const db = await openSpanishMtelDb();
  const tx = db.transaction([stores.settings, stores.attempts, stores.dailySets, stores.completions, stores.extraSessions, stores.meta], 'readwrite');
  void tx.objectStore(stores.settings).clear();
  void tx.objectStore(stores.attempts).clear();
  void tx.objectStore(stores.dailySets).clear();
  void tx.objectStore(stores.completions).clear();
  void tx.objectStore(stores.extraSessions).clear();
  void tx.objectStore(stores.meta).clear();
  await tx.done;
}

export function resetDbConnectionForTests(): void {
  dbPromise = undefined;
}
