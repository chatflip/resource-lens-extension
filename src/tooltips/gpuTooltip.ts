import * as vscode from "vscode";
import { GpuInfo } from "../collectors/types";

export function buildGpuTooltip(gpu: GpuInfo): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;

  md.appendMarkdown(`### GPU\n\n`);
  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Name** | ${gpu.name} |\n`);
  md.appendMarkdown(`| **Vendor** | ${gpu.vendor} |\n`);

  if (gpu.coreUsage !== null) {
    md.appendMarkdown(`| **Core Usage** | ${gpu.coreUsage.toFixed(1)}% |\n`);
  }

  if (gpu.vramTotalMB !== null && gpu.vramUsedMB !== null) {
    md.appendMarkdown(`| **VRAM** | ${(gpu.vramUsedMB / 1024).toFixed(1)}/${(gpu.vramTotalMB / 1024).toFixed(1)} GB |\n`);
  } else if (gpu.vramUsedMB !== null) {
    md.appendMarkdown(`| **VRAM Used** | ${(gpu.vramUsedMB / 1024).toFixed(1)} GB |\n`);
  }

  if (gpu.temperatureC !== null) {
    md.appendMarkdown(`| **Temperature** | ${gpu.temperatureC}°C |\n`);
  }

  return md;
}
