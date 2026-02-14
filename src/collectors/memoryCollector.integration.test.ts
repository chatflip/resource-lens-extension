import { describe, it, expect } from 'vitest';
import { collectMemory } from './memoryCollector';

describe('collectMemory integration', () => {
  it('returns valid memory data from real OS', () => {
    const result = collectMemory();

    expect(result.totalBytes).toBeGreaterThan(0);
    expect(result.usedBytes).toBeGreaterThan(0);
    expect(result.freeBytes).toBeGreaterThanOrEqual(0);
    expect(result.usedBytes + result.freeBytes).toBe(result.totalBytes);
    expect(result.usagePercent).toBeGreaterThan(0);
    expect(result.usagePercent).toBeLessThanOrEqual(100);
  });

  it('usagePercent is consistent with byte values', () => {
    const result = collectMemory();
    const expected = Math.round((result.usedBytes / result.totalBytes) * 1000) / 10;

    expect(result.usagePercent).toBe(expected);
  });
});
