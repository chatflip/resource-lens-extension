import { CpuInfo, MemoryInfo, GpuInfo } from '../collectors/types';

function table(rows: [string, string][]): string {
  let content = '| | |\n|---|---|\n';
  for (const [k, v] of rows) content += `| **${k}** | ${v} |\n`;
  return content;
}

function formatGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export function buildCpuTooltip(cpu: CpuInfo): string {
  return table([
    ['Model', cpu.model],
    ['Cores', String(cpu.cores.length)],
    ['Speed', `${cpu.speedMHz} MHz`],
  ]);
}

export function buildMemoryTooltip(mem: MemoryInfo): string {
  return table([
    ['Total', `${formatGB(mem.totalBytes)} GB`],
    ['Used', `${formatGB(mem.usedBytes)} GB`],
    ['Free', `${formatGB(mem.freeBytes)} GB`],
  ]);
}

function formatGpuLine(gpu: GpuInfo): string {
  const parts = [gpu.name];
  if (gpu.coreUsage !== null) {
    parts.push(`${gpu.coreUsage.toFixed(1)}%`);
  }
  if (gpu.vramTotalMB !== null && gpu.vramUsedMB !== null) {
    parts.push(
      `${(gpu.vramUsedMB / 1024).toFixed(1)}/${(gpu.vramTotalMB / 1024).toFixed(1)} GB`,
    );
  } else if (gpu.vramUsedMB !== null) {
    parts.push(`${(gpu.vramUsedMB / 1024).toFixed(1)} GB`);
  }
  if (gpu.temperatureC !== null) {
    parts.push(`${gpu.temperatureC}\u00B0C`);
  }
  return parts.join(' ');
}

export function buildGpuTooltip(gpu: GpuInfo[]): string {
  return gpu.map(formatGpuLine).join('\n');
}
