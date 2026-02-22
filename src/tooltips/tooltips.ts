import { CpuInfo, MemoryInfo, GpuInfo } from '../collectors/types';

function table(rows: [string, string][]): string {
  let content = '| | |\n|---|---|\n';
  for (const [k, v] of rows) content += `| **${k}** | ${v} |\n`;
  return content;
}

function formatGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(1).padStart(5);
}

function code(s: string): string {
  return `\`${s}\``;
}

export function buildCpuTooltip(cpu: CpuInfo): string {
  return table([
    ['Model', cpu.model],
    ['Cores', String(cpu.cores.length)],
    ['Speed', code(String(cpu.speedMHz).padStart(4) + ' MHz')],
  ]);
}

export function buildMemoryTooltip(mem: MemoryInfo): string {
  return table([
    ['Total', code(`${formatGB(mem.totalBytes)} GB`)],
    ['Used', code(`${formatGB(mem.usedBytes)} GB`)],
    ['Free', code(`${formatGB(mem.freeBytes)} GB`)],
  ]);
}

export function buildGpuTooltip(gpu: GpuInfo): string {
  const rows: [string, string][] = [['Name', gpu.name]];
  if (gpu.coreUsage !== null) {
    rows.push(['Core Usage', code(gpu.coreUsage.toFixed(1).padStart(5) + '%')]);
  }
  if (gpu.vramTotalMB !== null && gpu.vramUsedMB !== null) {
    rows.push([
      'VRAM',
      code(
        `${(gpu.vramUsedMB / 1024).toFixed(1).padStart(5)}/${(gpu.vramTotalMB / 1024).toFixed(1).padStart(5)} GB`,
      ),
    ]);
  } else if (gpu.vramUsedMB !== null) {
    rows.push([
      'VRAM Used',
      code(`${(gpu.vramUsedMB / 1024).toFixed(1).padStart(5)} GB`),
    ]);
  }
  if (gpu.temperatureC !== null) {
    rows.push([
      'Temperature',
      code(String(gpu.temperatureC).padStart(3) + '\u00B0C'),
    ]);
  }
  return table(rows);
}
