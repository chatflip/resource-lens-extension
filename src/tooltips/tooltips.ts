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

export function buildGpuTooltip(gpu: GpuInfo): string {
  const rows: [string, string][] = [['Name', gpu.name]];
  if (gpu.coreUsage !== null) {
    rows.push(['Core Usage', `${gpu.coreUsage.toFixed(1)}%`]);
  }
  if (gpu.vramTotalMB !== null && gpu.vramUsedMB !== null) {
    rows.push([
      'VRAM',
      `${(gpu.vramUsedMB / 1024).toFixed(1)}/${(gpu.vramTotalMB / 1024).toFixed(1)} GB`,
    ]);
  } else if (gpu.vramUsedMB !== null) {
    rows.push(['VRAM Used', `${(gpu.vramUsedMB / 1024).toFixed(1)} GB`]);
  }
  if (gpu.temperatureC !== null) {
    rows.push(['Temperature', `${gpu.temperatureC}\u00B0C`]);
  }
  return table(rows);
}
