import * as vscode from 'vscode';
import { CpuInfo, MemoryInfo, GpuInfo } from './collectors/types';
import {
  buildCpuTooltip,
  buildMemoryTooltip,
  buildGpuTooltip,
} from './tooltips/tooltips';

export class StatusBarManager {
  private cpuItem: vscode.StatusBarItem;
  private memItem: vscode.StatusBarItem;
  private gpuItem: vscode.StatusBarItem;
  private cpuTooltip: vscode.MarkdownString;
  private memTooltip: vscode.MarkdownString;
  private gpuTooltip: vscode.MarkdownString;
  private lastTexts = { cpu: '', mem: '', gpu: '' };

  constructor() {
    this.cpuItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -100,
    );
    this.memItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -101,
    );
    this.gpuItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -102,
    );
    this.cpuTooltip = new vscode.MarkdownString();
    this.memTooltip = new vscode.MarkdownString();
    this.gpuTooltip = new vscode.MarkdownString();
    this.cpuItem.tooltip = this.cpuTooltip;
    this.memItem.tooltip = this.memTooltip;
    this.gpuItem.tooltip = this.gpuTooltip;
  }

  private updateItem(
    item: vscode.StatusBarItem,
    key: keyof typeof this.lastTexts,
    text: string | null,
    tooltipContent: string | null,
    tooltipObj: vscode.MarkdownString,
  ): void {
    if (text !== null && tooltipContent !== null) {
      if (text !== this.lastTexts[key]) {
        item.text = text;
        this.lastTexts[key] = text;
      }
      tooltipObj.value = tooltipContent;
      item.show();
    } else {
      this.lastTexts[key] = '';
      tooltipObj.value = '';
      item.hide();
    }
  }

  update(
    cpu: CpuInfo | null,
    mem: MemoryInfo | null,
    gpu: GpuInfo | null,
  ): void {
    const config = vscode.workspace.getConfiguration('resourceLens');

    this.updateItem(
      this.cpuItem,
      'cpu',
      cpu && config.get<boolean>('showCpu', true)
        ? `$(chip) ${cpu.overall.toFixed(1).padStart(4)}%`
        : null,
      cpu ? buildCpuTooltip(cpu) : null,
      this.cpuTooltip,
    );

    this.updateItem(
      this.memItem,
      'mem',
      mem && config.get<boolean>('showMemory', true)
        ? `$(server) ${(mem.usedBytes / 1024 / 1024 / 1024).toFixed(1)}/${(mem.totalBytes / 1024 / 1024 / 1024).toFixed(1)} GB`
        : null,
      mem ? buildMemoryTooltip(mem) : null,
      this.memTooltip,
    );

    let gpuText: string | null = null;
    if (gpu && config.get<boolean>('showGpu', true)) {
      if (gpu.vramUsedMB !== null && gpu.vramTotalMB !== null) {
        gpuText = `$(graph-line) ${(gpu.vramUsedMB / 1024).toFixed(1)}/${(gpu.vramTotalMB / 1024).toFixed(1)} GB`;
      } else if (gpu.vramUsedMB !== null) {
        gpuText = `$(graph-line) ${(gpu.vramUsedMB / 1024).toFixed(1)} GB`;
      } else {
        gpuText = `$(graph-line) N/A`;
      }
    }
    this.updateItem(
      this.gpuItem,
      'gpu',
      gpuText,
      gpu ? buildGpuTooltip(gpu) : null,
      this.gpuTooltip,
    );
  }

  dispose(): void {
    this.cpuItem.dispose();
    this.memItem.dispose();
    this.gpuItem.dispose();
  }
}
