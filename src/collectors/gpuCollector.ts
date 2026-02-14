import { GpuInfo } from './types';
import { execFileAsync } from '../utils/exec';

let detected: boolean | undefined;
let lastGpuInfo: GpuInfo | null = null;

async function collectNvidia(): Promise<GpuInfo> {
  const output = await execFileAsync('nvidia-smi', [
    '--query-gpu=name,memory.total,memory.used,temperature.gpu,utilization.gpu',
    '--format=csv,noheader,nounits',
  ]);

  const parts = output
    .trim()
    .split(',')
    .map((s) => s.trim());
  // name, memory.total (MB), memory.used (MB), temperature (C), utilization (%)
  return {
    name: parts[0] ?? 'NVIDIA GPU',
    vendor: 'NVIDIA',
    vramTotalMB: parseFloat(parts[1]) || null,
    vramUsedMB: parseFloat(parts[2]) || null,
    temperatureC: parseFloat(parts[3]) || null,
    coreUsage: Number.isNaN(parseFloat(parts[4])) ? null : parseFloat(parts[4]),
  };
}

/**
 * Detect whether nvidia-smi is available.
 */
export async function detectGpu(): Promise<boolean> {
  try {
    await execFileAsync(
      'nvidia-smi',
      ['--query-gpu=name', '--format=csv,noheader'],
      2000,
    );
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
