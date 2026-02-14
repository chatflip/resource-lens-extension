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
  }

  private updateItem(
    item: vscode.StatusBarItem,
    key: keyof typeof this.lastTexts,
    text: string | null,
    tooltip: vscode.MarkdownString | null,
  ): void {
    if (text !== null && tooltip !== null) {
      if (text !== this.lastTexts[key]) {
        item.text = text;
        item.tooltip = tooltip;
        this.lastTexts[key] = text;
      }
      item.show();
    } else {
      this.lastTexts[key] = '';
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
        ? `CPU ${cpu.overall.toFixed(1).padStart(4)}%`
        : null,
      cpu ? buildCpuTooltip(cpu) : null,
    );

    this.updateItem(
      this.memItem,
      'mem',
      mem && config.get<boolean>('showMemory', true)
        ? `RAM ${(mem.usedBytes / 1024 / 1024 / 1024).toFixed(1)}/${(mem.totalBytes / 1024 / 1024 / 1024).toFixed(1)} GB`
        : null,
      mem ? buildMemoryTooltip(mem) : null,
    );

    let gpuText: string | null = null;
    if (gpu && config.get<boolean>('showGpu', true)) {
      if (gpu.vramUsedMB !== null && gpu.vramTotalMB !== null) {
        gpuText = `VRAM ${(gpu.vramUsedMB / 1024).toFixed(1)}/${(gpu.vramTotalMB / 1024).toFixed(1)} GB`;
      } else if (gpu.vramUsedMB !== null) {
        gpuText = `VRAM ${(gpu.vramUsedMB / 1024).toFixed(1)} GB`;
      } else {
        gpuText = `VRAM N/A`;
      }
    }
    this.updateItem(
      this.gpuItem,
      'gpu',
      gpuText,
      gpu ? buildGpuTooltip(gpu) : null,
    );
  }

  dispose(): void {
    this.cpuItem.dispose();
    this.memItem.dispose();
    this.gpuItem.dispose();
  }
}
