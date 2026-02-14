import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { CpuInfo } from './types';

type MockCpu = {
  model: string;
  speed: number;
  times: { user: number; nice: number; sys: number; idle: number; irq: number };
};

function makeCpuData(user: number, idle: number): MockCpu[] {
  return [
    {
      model: 'Intel Core i7',
      speed: 2400,
      times: { user, nice: 0, sys: 0, idle, irq: 0 },
    },
  ];
}

describe('collectCpu', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('first call returns 0% (no previous state)', async () => {
    vi.doMock('os', () => ({ cpus: vi.fn(() => makeCpuData(200, 800)) }));

    const { collectCpu } = await import('./cpuCollector');
    const result: CpuInfo = collectCpu();

    expect(result.overall).toBe(0);
    expect(result.cores[0].usage).toBe(0);
    expect(result.model).toBe('Intel Core i7');
    expect(result.speedMHz).toBe(2400);
    expect(result.cores).toHaveLength(1);
  });

  it('second call computes 50% usage from delta', async () => {
    // t0: user=200, idle=800, total=1000
    const mockCpus = vi.fn(() => makeCpuData(200, 800));
    vi.doMock('os', () => ({ cpus: mockCpus }));

    const { collectCpu } = await import('./cpuCollector');
    collectCpu(); // first call — sets previousTicks to t0

    // t1: user=700, idle=1300, total=2000
    // delta: total=1000, idle=500, active=500 → 50%
    mockCpus.mockReturnValue(makeCpuData(700, 1300));

    const result = collectCpu();

    expect(result.cores[0].usage).toBe(50.0);
    expect(result.overall).toBe(50.0);
  });

  it('returns 0% when totalDelta is 0 (no change between calls)', async () => {
    const mockCpus = vi.fn(() => makeCpuData(100, 900));
    vi.doMock('os', () => ({ cpus: mockCpus }));

    const { collectCpu } = await import('./cpuCollector');
    collectCpu(); // first call

    // Same values returned — totalDelta = 0 → usage = 0
    const result = collectCpu();

    expect(result.cores[0].usage).toBe(0);
    expect(result.overall).toBe(0);
  });

  it('averages overall across multiple cores', async () => {
    const mockCpus = vi.fn(() => [
      {
        model: 'Intel Core i7',
        speed: 2400,
        times: { user: 100, nice: 0, sys: 0, idle: 900, irq: 0 },
      },
      {
        model: 'Intel Core i7',
        speed: 2400,
        times: { user: 500, nice: 0, sys: 0, idle: 500, irq: 0 },
      },
    ]);
    vi.doMock('os', () => ({ cpus: mockCpus }));

    const { collectCpu } = await import('./cpuCollector');
    collectCpu(); // first call

    mockCpus.mockReturnValue([
      {
        model: 'Intel Core i7',
        speed: 2400,
        times: { user: 200, nice: 0, sys: 0, idle: 1800, irq: 0 },
      },
      {
        model: 'Intel Core i7',
        speed: 2400,
        times: { user: 600, nice: 0, sys: 0, idle: 1400, irq: 0 },
      },
    ]);
    // core0: delta_active=100, delta_total=1000 → 10%
    // core1: delta_active=100, delta_total=1000 → 10%
    // overall: avg(10, 10) = 10%
    const result = collectCpu();

    expect(result.cores).toHaveLength(2);
    expect(result.cores[0].usage).toBe(10.0);
    expect(result.cores[1].usage).toBe(10.0);
    expect(result.overall).toBe(10.0);
  });
});
