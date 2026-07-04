const chicagoFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function getChicagoDateKey(date = new Date()): string {
  const parts = chicagoFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  if (!year || !month || !day) throw new Error('Unable to format America/Chicago date.');
  return `${year}-${month}-${day}`;
}

export function dateKeyToUtcNoon(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function addChicagoDays(dateKey: string, days: number): string {
  const date = dateKeyToUtcNoon(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return getChicagoDateKey(date);
}

export function daysBetweenChicagoKeys(startKey: string, endKey: string): number {
  const start = dateKeyToUtcNoon(startKey).getTime();
  const end = dateKeyToUtcNoon(endKey).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function lastNDatesChicago(count: number, endKey = getChicagoDateKey()): string[] {
  return Array.from({ length: count }, (_, index) => addChicagoDays(endKey, index - count + 1));
}
