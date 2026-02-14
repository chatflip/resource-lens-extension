import * as vscode from 'vscode';
import { CpuInfo, MemoryInfo, GpuInfo } from '../collectors/types';

function table(rows: [string, string][]): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;
  md.appendMarkdown('| | |\n|---|---|\n');
  for (const [k, v] of rows) md.appendMarkdown(`| **${k}** | ${v} |\n`);
  return md;
}

function formatGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export function buildCpuTooltip(cpu: CpuInfo): vscode.MarkdownString {
  return table([
    ['Model', cpu.model],
    ['Cores', String(cpu.cores.length)],
    ['Speed', `${cpu.speedMHz} MHz`],
  ]);
}

export function buildMemoryTooltip(mem: MemoryInfo): vscode.MarkdownString {
  return table([
    ['Total', `${formatGB(mem.totalBytes)} GB`],
    ['Used', `${formatGB(mem.usedBytes)} GB`],
    ['Free', `${formatGB(mem.freeBytes)} GB`],
  ]);
}

export function buildGpuTooltip(gpu: GpuInfo): vscode.MarkdownString {
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
