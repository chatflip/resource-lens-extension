import { describe, it, expect } from 'vitest';
import { collectCpu } from './cpuCollector';

describe('collectCpu integration', () => {
  it('first call returns 0% (no previous state)', () => {
    const result = collectCpu();

    expect(result.overall).toBe(0);
    expect(result.cores.length).toBeGreaterThan(0);
    expect(result.cores.every((c) => c.usage === 0)).toBe(true);
  });

  it('second call returns values in valid range 0-100%', () => {
    const result = collectCpu();

    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    result.cores.forEach((core) => {
      expect(core.usage).toBeGreaterThanOrEqual(0);
      expect(core.usage).toBeLessThanOrEqual(100);
    });
  });

  it('returns non-empty CPU model and positive speed', () => {
    const result = collectCpu();

    expect(result.model).toBeTruthy();
    expect(result.speedMHz).toBeGreaterThan(0);
  });
});
