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
  });

  it('returns 0 used when all memory is free', () => {
    vi.mocked(os.totalmem).mockReturnValue(1000);
    vi.mocked(os.freemem).mockReturnValue(1000);

    const result = collectMemory();

    expect(result.usedBytes).toBe(0);
  });

  it('returns all memory used when free is 0', () => {
    vi.mocked(os.totalmem).mockReturnValue(1000);
    vi.mocked(os.freemem).mockReturnValue(0);

    const result = collectMemory();

    expect(result.usedBytes).toBe(1000);
    expect(result.freeBytes).toBe(0);
  });
});
