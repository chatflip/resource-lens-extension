import * as vscode from "vscode";
import { GpuInfo } from "../collectors/types";

function bar(percent: number, length: number = 10): string {
  const filled = Math.round((percent / 100) * length);
  return "█".repeat(filled) + "░".repeat(length - filled);
}

export function buildGpuTooltip(gpu: GpuInfo): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;

  md.appendMarkdown(`### $(circuit-board) GPU\n\n`);
  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Name** | ${gpu.name} |\n`);
  md.appendMarkdown(`| **Vendor** | ${gpu.vendor} |\n`);

  if (gpu.coreUsage !== null) {
    md.appendMarkdown(`| **Core Usage** | ${bar(gpu.coreUsage)} ${gpu.coreUsage}% |\n`);
  }

  if (gpu.vramTotalMB !== null && gpu.vramUsedMB !== null) {
    const vramPercent = Math.round((gpu.vramUsedMB / gpu.vramTotalMB) * 1000) / 10;
    md.appendMarkdown(`| **VRAM Total** | ${gpu.vramTotalMB} MB |\n`);
    md.appendMarkdown(`| **VRAM Used** | ${gpu.vramUsedMB} MB |\n`);
    md.appendMarkdown(`| **VRAM** | ${bar(vramPercent)} ${vramPercent}% |\n`);
  } else if (gpu.vramUsedMB !== null) {
    md.appendMarkdown(`| **VRAM Used** | ${gpu.vramUsedMB} MB |\n`);
  }

  if (gpu.temperatureC !== null) {
    md.appendMarkdown(`| **Temperature** | ${gpu.temperatureC}°C |\n`);
  }

  return md;
}
