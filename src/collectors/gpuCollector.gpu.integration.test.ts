// Requires mock-nvidia-smi to be installed in PATH.
// Run via: make test-docker (gpu-mock-test service)
import { describe, it, expect, beforeAll } from 'vitest';
import { detectGpu, collectGpu } from './gpuCollector';

describe('GPU integration (requires nvidia-smi in PATH)', () => {
  let gpuAvailable: boolean;

  beforeAll(async () => {
    gpuAvailable = await detectGpu();
  });

  it('detects GPU via nvidia-smi', () => {
    expect(gpuAvailable).toBe(true);
  });

  it('collectGpu returns non-null result', async () => {
    const result = await collectGpu();
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
  });

  it('returns NVIDIA as vendor', async () => {
    const result = await collectGpu();
    expect(result![0].vendor).toBe('NVIDIA');
  });

  it('returns a non-empty GPU name', async () => {
    const result = await collectGpu();
    expect(result![0].name).toBeTruthy();
  });

  it('VRAM values are in valid ranges', async () => {
    const result = await collectGpu();
    const gpu = result![0];
    if (gpu.vramTotalMB !== null) {
      expect(gpu.vramTotalMB).toBeGreaterThan(0);
    }
    if (gpu.vramUsedMB !== null) {
      expect(gpu.vramUsedMB).toBeGreaterThanOrEqual(0);
      if (gpu.vramTotalMB !== null) {
        expect(gpu.vramUsedMB).toBeLessThanOrEqual(gpu.vramTotalMB);
      }
    }
  });

  it('temperature is in plausible range (0-120°C)', async () => {
    const result = await collectGpu();
    const gpu = result![0];
    if (gpu.temperatureC !== null) {
      expect(gpu.temperatureC).toBeGreaterThan(0);
      expect(gpu.temperatureC).toBeLessThan(120);
    }
  });

  it('core usage is in range 0-100%', async () => {
    const result = await collectGpu();
    const gpu = result![0];
    if (gpu.coreUsage !== null) {
      expect(gpu.coreUsage).toBeGreaterThanOrEqual(0);
      expect(gpu.coreUsage).toBeLessThanOrEqual(100);
    }
  });
});
