import * as vscode from "vscode";
import { CpuInfo } from "../collectors/types";

export function buildCpuTooltip(cpu: CpuInfo): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;

  md.appendMarkdown(`### CPU\n\n`);
  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Model** | ${cpu.model} |\n`);
  md.appendMarkdown(`| **Cores** | ${cpu.cores.length} |\n`);
  md.appendMarkdown(`| **Speed** | ${cpu.speedMHz} MHz |\n`);

  return md;
}
