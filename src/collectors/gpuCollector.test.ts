import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('detectGpu', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns true when nvidia-smi is available', async () => {
    const mockExec = vi.fn().mockResolvedValue('NVIDIA RTX 3080');
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { detectGpu } = await import('./gpuCollector');
    const result = await detectGpu();

    expect(result).toBe(true);
    expect(mockExec).toHaveBeenCalledWith(
      'nvidia-smi',
      ['--query-gpu=name', '--format=csv,noheader'],
      2000,
    );
  });

  it('returns false when nvidia-smi is not available', async () => {
    const mockExec = vi.fn().mockRejectedValue(new Error('command not found'));
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { detectGpu } = await import('./gpuCollector');
    const result = await detectGpu();

    expect(result).toBe(false);
  });
});

describe('collectGpu', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns null when GPU not detected', async () => {
    const mockExec = vi.fn().mockRejectedValue(new Error('not found'));
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { collectGpu } = await import('./gpuCollector');
    const result = await collectGpu();

    expect(result).toBeNull();
  });

  it('parses nvidia-smi output correctly', async () => {
    const mockExec = vi
      .fn()
      .mockResolvedValueOnce('NVIDIA RTX 3080') // detectGpu
      .mockResolvedValueOnce('10240, 4096, 65, 42'); // collectNvidia
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { collectGpu } = await import('./gpuCollector');
    const result = await collectGpu();

    expect(result).not.toBeNull();
    expect(result!.name).toBe('NVIDIA RTX 3080');
    expect(result!.vendor).toBe('NVIDIA');
    expect(result!.vramTotalMB).toBe(10240);
    expect(result!.vramUsedMB).toBe(4096);
    expect(result!.temperatureC).toBe(65);
    expect(result!.coreUsage).toBe(42);
  });

  it('returns last successful reading when collection fails', async () => {
    const mockExec = vi
      .fn()
      .mockResolvedValueOnce('NVIDIA RTX 3080') // detectGpu
      .mockResolvedValueOnce('10240, 4096, 65, 42') // first collect succeeds
      .mockRejectedValueOnce(new Error('nvidia-smi timeout')); // second collect fails
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { collectGpu } = await import('./gpuCollector');
    const first = await collectGpu();
    expect(first!.name).toBe('NVIDIA RTX 3080');

    const second = await collectGpu();
    expect(second).not.toBeNull();
    expect(second!.name).toBe('NVIDIA RTX 3080'); // returns cached value
  });

  it('returns null when first collection fails with no previous reading', async () => {
    const mockExec = vi
      .fn()
      .mockResolvedValueOnce('NVIDIA RTX 3080') // detectGpu succeeds
      .mockRejectedValueOnce(new Error('timeout')); // collect fails
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { collectGpu } = await import('./gpuCollector');
    const result = await collectGpu();

    expect(result).toBeNull(); // lastGpuInfo starts as null
  });

  it('auto-detects GPU when called without prior detectGpu()', async () => {
    const mockExec = vi
      .fn()
      .mockResolvedValueOnce('NVIDIA RTX 3080') // auto-detect
      .mockResolvedValueOnce('10240, 4096, 65, 42'); // collect
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { collectGpu } = await import('./gpuCollector');
    const result = await collectGpu();

    expect(result).not.toBeNull();
    expect(mockExec).toHaveBeenCalledTimes(2); // detectGpu + collectNvidia
  });

  it('does not treat 0 as null for numeric fields', async () => {
    const mockExec = vi
      .fn()
      .mockResolvedValueOnce('NVIDIA RTX 3080') // detectGpu
      .mockResolvedValueOnce('10240, 0, 0, 0'); // collectNvidia
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { collectGpu } = await import('./gpuCollector');
    const result = await collectGpu();

    expect(result).not.toBeNull();
    expect(result!.vramUsedMB).toBe(0);
    expect(result!.temperatureC).toBe(0);
    expect(result!.coreUsage).toBe(0);
  });

  it('parses correctly when GPU name contains a comma', async () => {
    const mockExec = vi
      .fn()
      .mockResolvedValueOnce('NVIDIA GeForce RTX 3080, Founders Edition') // detectGpu
      .mockResolvedValueOnce('10240, 4096, 65, 42'); // collectNvidia
    vi.doMock('../utils/exec', () => ({ execFileAsync: mockExec }));

    const { collectGpu } = await import('./gpuCollector');
    const result = await collectGpu();

    expect(result).not.toBeNull();
    expect(result!.name).toBe('NVIDIA GeForce RTX 3080, Founders Edition');
    expect(result!.vramTotalMB).toBe(10240);
    expect(result!.vramUsedMB).toBe(4096);
    expect(result!.temperatureC).toBe(65);
    expect(result!.coreUsage).toBe(42);
  });
});
