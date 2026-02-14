import * as vscode from "vscode";
import { CpuInfo } from "../collectors/types";

function bar(percent: number, length: number = 10): string {
  const filled = Math.round((percent / 100) * length);
  return "█".repeat(filled) + "░".repeat(length - filled);
}

export function buildCpuTooltip(cpu: CpuInfo): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;

  md.appendMarkdown(`### $(pulse) CPU\n\n`);
  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Model** | ${cpu.model} |\n`);
  md.appendMarkdown(`| **Cores** | ${cpu.cores.length} |\n`);
  md.appendMarkdown(`| **Speed** | ${cpu.speedMHz} MHz |\n`);
  md.appendMarkdown(`| **Overall** | ${bar(cpu.overall)} ${cpu.overall}% |\n\n`);

  md.appendMarkdown(`**Per-Core Usage**\n\n`);
  cpu.cores.forEach((core, i) => {
    md.appendMarkdown(`Core ${i}: \`${bar(core.usage, 8)}\` ${core.usage.toFixed(1)}%\n\n`);
  });

  return md;
}
