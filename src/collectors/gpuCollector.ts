import { GpuInfo } from './types';
import { execFileAsync } from '../utils/exec';

let detected: boolean | undefined;
let lastGpuInfo: GpuInfo | null = null;
let gpuName: string = 'NVIDIA GPU';

function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

async function collectNvidia(): Promise<GpuInfo> {
  const output = await execFileAsync('nvidia-smi', [
    '--query-gpu=memory.total,memory.used,temperature.gpu,utilization.gpu',
    '--format=csv,noheader,nounits',
  ]);

  const parts = output
    .trim()
    .split(',')
    .map((s) => s.trim());
  // memory.total (MB), memory.used (MB), temperature (C), utilization (%)
  return {
    name: gpuName,
    vendor: 'NVIDIA',
    vramTotalMB: toNumberOrNull(parts[0]),
    vramUsedMB: toNumberOrNull(parts[1]),
    temperatureC: toNumberOrNull(parts[2]),
    coreUsage: toNumberOrNull(parts[3]),
  };
}

/**
 * Detect whether nvidia-smi is available.
 */
export async function detectGpu(): Promise<boolean> {
  try {
    const name = await execFileAsync(
      'nvidia-smi',
      ['--query-gpu=name', '--format=csv,noheader'],
      2000,
    );
    gpuName = name.trim() || 'NVIDIA GPU';
    detected = true;
  } catch {
    detected = false;
  }
  return detected;
}

/**
 * Collect GPU info via nvidia-smi.
 * Returns null if nvidia-smi is unavailable.
 * On error, returns the last successful reading.
 */
export async function collectGpu(): Promise<GpuInfo | null> {
  if (detected === undefined) {
    await detectGpu();
  }

  if (!detected) {
    return null;
  }

  try {
    const info = await collectNvidia();
    lastGpuInfo = info;
    return info;
  } catch {
    return lastGpuInfo;
  }
}
