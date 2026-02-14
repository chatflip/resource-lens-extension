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
  });

  it('returns NVIDIA as vendor', async () => {
    const result = await collectGpu();
    expect(result!.vendor).toBe('NVIDIA');
  });

  it('returns a non-empty GPU name', async () => {
    const result = await collectGpu();
    expect(result!.name).toBeTruthy();
  });

  it('VRAM values are in valid ranges', async () => {
    const result = await collectGpu();
    if (result!.vramTotalMB !== null) {
      expect(result!.vramTotalMB).toBeGreaterThan(0);
    }
    if (result!.vramUsedMB !== null) {
      expect(result!.vramUsedMB).toBeGreaterThanOrEqual(0);
      if (result!.vramTotalMB !== null) {
        expect(result!.vramUsedMB).toBeLessThanOrEqual(result!.vramTotalMB);
      }
    }
  });

  it('temperature is in plausible range (0-120°C)', async () => {
    const result = await collectGpu();
    if (result!.temperatureC !== null) {
      expect(result!.temperatureC).toBeGreaterThan(0);
      expect(result!.temperatureC).toBeLessThan(120);
    }
  });

  it('core usage is in range 0-100%', async () => {
    const result = await collectGpu();
    if (result!.coreUsage !== null) {
      expect(result!.coreUsage).toBeGreaterThanOrEqual(0);
      expect(result!.coreUsage).toBeLessThanOrEqual(100);
    }
  });
});
