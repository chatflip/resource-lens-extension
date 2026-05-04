import { GpuInfo } from './types';
import { execFileAsync } from '../utils/exec';

let detected: boolean | undefined;
let lastGpuInfo: GpuInfo[] | null = null;

function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function parseNvidiaLine(line: string): GpuInfo {
  const parts = line.split(',').map((s) => s.trim());
  const metricParts = parts.slice(-4);
  const nameParts = parts.slice(0, -4);

  return {
    name: nameParts.join(', ') || 'NVIDIA GPU',
    vendor: 'NVIDIA',
    vramTotalMB: toNumberOrNull(metricParts[0]),
    vramUsedMB: toNumberOrNull(metricParts[1]),
    temperatureC: toNumberOrNull(metricParts[2]),
    coreUsage: toNumberOrNull(metricParts[3]),
  };
}

async function collectNvidia(): Promise<GpuInfo[]> {
  const output = await execFileAsync('nvidia-smi', [
    '--query-gpu=name,memory.total,memory.used,temperature.gpu,utilization.gpu',
    '--format=csv,noheader,nounits',
  ]);

  return output
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map(parseNvidiaLine);
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
    detected = name.trim() !== '';
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
export async function collectGpu(): Promise<GpuInfo[] | null> {
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
