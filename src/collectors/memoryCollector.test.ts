import { vi, describe, it, expect } from 'vitest';

vi.mock('os', () => ({
  totalmem: vi.fn(),
  freemem: vi.fn(),
}));

import * as os from 'os';
import { collectMemory } from './memoryCollector';

describe('collectMemory', () => {
  it('returns correct values for 75% usage (6GB/8GB)', () => {
    vi.mocked(os.totalmem).mockReturnValue(8 * 1024 ** 3);
    vi.mocked(os.freemem).mockReturnValue(2 * 1024 ** 3);

    const result = collectMemory();

    expect(result.totalBytes).toBe(8 * 1024 ** 3);
    expect(result.freeBytes).toBe(2 * 1024 ** 3);
    expect(result.usedBytes).toBe(6 * 1024 ** 3);
    expect(result.usagePercent).toBe(75.0);
  });

  it('rounds usage to 1 decimal place', () => {
    // 1000/3000 used = 33.333...% → 33.3%
    vi.mocked(os.totalmem).mockReturnValue(3000);
    vi.mocked(os.freemem).mockReturnValue(2000);

    const result = collectMemory();

    expect(result.usagePercent).toBe(33.3);
  });

  it('returns 100% when all memory is used', () => {
    vi.mocked(os.totalmem).mockReturnValue(1000);
    vi.mocked(os.freemem).mockReturnValue(0);

    const result = collectMemory();

    expect(result.usagePercent).toBe(100.0);
    expect(result.usedBytes).toBe(1000);
    expect(result.freeBytes).toBe(0);
  });

  it('returns 0% when no memory is used', () => {
    vi.mocked(os.totalmem).mockReturnValue(1000);
    vi.mocked(os.freemem).mockReturnValue(1000);

    const result = collectMemory();

    expect(result.usagePercent).toBe(0.0);
    expect(result.usedBytes).toBe(0);
  });
});
