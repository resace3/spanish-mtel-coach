import { describe, expect, it } from 'vitest';
import { addChicagoDays, daysBetweenChicagoKeys, getChicagoDateKey } from '../engine/dateChicago';

describe('dateChicago', () => {
  it('uses America/Chicago calendar dates', () => {
    expect(getChicagoDateKey(new Date('2026-07-04T04:30:00.000Z'))).toBe('2026-07-03');
    expect(getChicagoDateKey(new Date('2026-07-04T06:00:00.000Z'))).toBe('2026-07-04');
  });

  it('adds dates across daylight saving boundaries', () => {
    expect(addChicagoDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addChicagoDays('2026-11-01', 1)).toBe('2026-11-02');
  });

  it('calculates day differences by date key', () => {
    expect(daysBetweenChicagoKeys('2026-07-01', '2026-07-04')).toBe(3);
  });
});
