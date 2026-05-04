import { CpuInfo, MemoryInfo, GpuInfo } from '../collectors/types';

function usageTable(rows: [string, string][]): string {
  let content = '| Name | Usage |\n|:---|---:|\n';
  for (const [name, usage] of rows) {
    content += `| ${name} | ${usage} |\n`;
  }
  return content;
}

function cpuSpecsTable(cpu: CpuInfo): string {
  return `| Name | Cores | Speed |\n|:---|---:|---:|\n| ${cpu.model} | ${cpu.cores.length} | ${cpu.speedMHz} MHz |\n`;
}

function formatGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export function buildCpuTooltip(cpu: CpuInfo): string {
  const coreUsageRows: [string, string][] = [];

  for (const [i, usage] of cpu.cores.entries()) {
    coreUsageRows.push([`Core ${i + 1}`, `${usage.toFixed(1)}%`]);
  }
  coreUsageRows.push(['--------', '--------']);
  coreUsageRows.push(['CPU (overall)', `${cpu.overall.toFixed(1)}%`]);

  return `${cpuSpecsTable(cpu)}\n${usageTable(coreUsageRows)}`;
}

export function buildMemoryTooltip(mem: MemoryInfo): string {
  return `| Used | Free | Total |\n|---:|---:|---:|\n| ${formatGB(mem.usedBytes)} GB | ${formatGB(mem.freeBytes)} GB | ${formatGB(mem.totalBytes)} GB |\n`;
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
  return gpu.temperatureC !== null ? `${gpu.temperatureC}°C` : '';
}

export function buildGpuTooltip(gpu: GpuInfo[]): string {
  const rows: [string, string, string, string][] = gpu.map((g) => [
    g.name,
    formatGpuUsage(g),
    formatGpuVram(g),
    formatGpuTemperature(g),
  ]);

  let content = '| Name | Usage | VRAM | Temp |\n|:---|---:|---:|---:|\n';
  for (const [name, usage, vram, temperature] of rows) {
    content += `| ${name} | ${usage} | ${vram} | ${temperature} |\n`;
  }
  return content;
}
