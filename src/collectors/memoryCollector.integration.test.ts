import { describe, it, expect } from 'vitest';
import { collectMemory } from './memoryCollector';

describe('collectMemory integration', () => {
  it('returns valid memory data from real OS', () => {
    const result = collectMemory();

    expect(result.totalBytes).toBeGreaterThan(0);
    expect(result.usedBytes).toBeGreaterThan(0);
    expect(result.freeBytes).toBeGreaterThanOrEqual(0);
    expect(result.usedBytes + result.freeBytes).toBe(result.totalBytes);
  });
});
