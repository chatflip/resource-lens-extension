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

function formatGpuUsage(gpu: GpuInfo): string {
  return gpu.coreUsage !== null ? `${gpu.coreUsage.toFixed(1)}%` : '';
}

function formatGpuVram(gpu: GpuInfo): string {
  if (gpu.vramTotalMB !== null && gpu.vramUsedMB !== null) {
    return `${(gpu.vramUsedMB / 1024).toFixed(1)}/${(gpu.vramTotalMB / 1024).toFixed(1)} GB`;
  }
  if (gpu.vramUsedMB !== null) {
    return `${(gpu.vramUsedMB / 1024).toFixed(1)} GB`;
  }
  return '';
}

function formatGpuTemperature(gpu: GpuInfo): string {
  return gpu.temperatureC !== null ? `${gpu.temperatureC}\u00B0C` : '';
}

export function buildGpuTooltip(gpu: GpuInfo[]): string {
  const rows: [string, string, string, string][] = gpu.map((g) => [
    g.name,
    formatGpuUsage(g),
    formatGpuVram(g),
    formatGpuTemperature(g),
  ]);

  let content = '| Name | Usage | VRAM | Temperature |\n|---|---:|---:|---:|\n';
  for (const [name, usage, vram, temperature] of rows) {
    content += `| ${name} | ${usage} | ${vram} | ${temperature} |\n`;
  }
  return content;
}
