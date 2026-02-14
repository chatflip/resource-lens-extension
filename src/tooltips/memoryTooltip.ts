import * as vscode from 'vscode';
import { MemoryInfo } from '../collectors/types';

function formatGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export function buildMemoryTooltip(mem: MemoryInfo): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = true;

  md.appendMarkdown(`| | |\n|---|---|\n`);
  md.appendMarkdown(`| **Total** | ${formatGB(mem.totalBytes)} GB |\n`);
  md.appendMarkdown(`| **Used** | ${formatGB(mem.usedBytes)} GB |\n`);
  md.appendMarkdown(`| **Free** | ${formatGB(mem.freeBytes)} GB |\n`);

  return md;
}
