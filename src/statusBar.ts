import * as vscode from "vscode";
import { CpuInfo, MemoryInfo, GpuInfo } from "./collectors/types";
import { buildCpuTooltip } from "./tooltips/cpuTooltip";
import { buildMemoryTooltip } from "./tooltips/memoryTooltip";
import { buildGpuTooltip } from "./tooltips/gpuTooltip";

export class StatusBarManager {
  private cpuItem: vscode.StatusBarItem;
  private memItem: vscode.StatusBarItem;
  private gpuItem: vscode.StatusBarItem;

  // Cache last displayed text to avoid re-rendering when value hasn't changed
  private lastCpuText = "";
  private lastMemText = "";
  private lastGpuText = "";

  constructor() {
    // Higher priority = further left
    this.cpuItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100);
    this.memItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -101);
    this.gpuItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -102);
  }

  update(cpu: CpuInfo | null, mem: MemoryInfo | null, gpu: GpuInfo | null): void {
    const config = vscode.workspace.getConfiguration("resourceLens");

    // CPU
    if (cpu && config.get<boolean>("showCpu", true)) {
      const text = `${cpu.overall.toFixed(1).padStart(4)}%`;
      if (text !== this.lastCpuText) {
        this.cpuItem.text = text;
        this.cpuItem.tooltip = buildCpuTooltip(cpu);
        this.lastCpuText = text;
      }
      this.cpuItem.show();
    } else {
      this.lastCpuText = "";
      this.cpuItem.hide();
    }

    // RAM (used/total GB)
    if (mem && config.get<boolean>("showMemory", true)) {
      const usedGB = mem.usedBytes / 1024 / 1024 / 1024;
      const totalGB = mem.totalBytes / 1024 / 1024 / 1024;
      const text = `${usedGB.toFixed(1)}/${totalGB.toFixed(1)} GB`;
      if (text !== this.lastMemText) {
        this.memItem.text = text;
        this.memItem.tooltip = buildMemoryTooltip(mem);
        this.lastMemText = text;
      }
      this.memItem.show();
    } else {
      this.lastMemText = "";
      this.memItem.hide();
    }

    // VRAM (used/total GB)
    if (gpu && config.get<boolean>("showGpu", true)) {
      let text: string;
      if (gpu.vramUsedMB !== null && gpu.vramTotalMB !== null) {
        const usedGB = gpu.vramUsedMB / 1024;
        const totalGB = gpu.vramTotalMB / 1024;
        text = `${usedGB.toFixed(1)}/${totalGB.toFixed(1)} GB`;
      } else if (gpu.vramUsedMB !== null) {
        text = `${(gpu.vramUsedMB / 1024).toFixed(1)} GB`;
      } else {
        text = `N/A`;
      }
      if (text !== this.lastGpuText) {
        this.gpuItem.text = text;
        this.gpuItem.tooltip = buildGpuTooltip(gpu);
        this.lastGpuText = text;
      }
      this.gpuItem.show();
    } else {
      this.lastGpuText = "";
      this.gpuItem.hide();
    }
  }

  dispose(): void {
    this.cpuItem.dispose();
    this.memItem.dispose();
    this.gpuItem.dispose();
  }
}
