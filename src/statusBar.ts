import * as vscode from "vscode";
import { CpuInfo, MemoryInfo, GpuInfo } from "./collectors/types";
import { buildCpuTooltip } from "./tooltips/cpuTooltip";
import { buildMemoryTooltip } from "./tooltips/memoryTooltip";
import { buildGpuTooltip } from "./tooltips/gpuTooltip";

export class StatusBarManager {
  private cpuItem: vscode.StatusBarItem;
  private memItem: vscode.StatusBarItem;
  private gpuItem: vscode.StatusBarItem;

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
      this.cpuItem.text = `$(pulse) CPU: ${cpu.overall}%`;
      this.cpuItem.tooltip = buildCpuTooltip(cpu);
      this.cpuItem.show();
    } else {
      this.cpuItem.hide();
    }

    // Memory
    if (mem && config.get<boolean>("showMemory", true)) {
      this.memItem.text = `$(database) MEM: ${mem.usagePercent}%`;
      this.memItem.tooltip = buildMemoryTooltip(mem);
      this.memItem.show();
    } else {
      this.memItem.hide();
    }

    // GPU
    if (gpu && config.get<boolean>("showGpu", true)) {
      const displayValue = gpu.coreUsage !== null
        ? `${gpu.coreUsage}%`
        : gpu.vramUsedMB !== null && gpu.vramTotalMB !== null
          ? `${Math.round((gpu.vramUsedMB / gpu.vramTotalMB) * 100)}%`
          : "N/A";
      this.gpuItem.text = `$(circuit-board) GPU: ${displayValue}`;
      this.gpuItem.tooltip = buildGpuTooltip(gpu);
      this.gpuItem.show();
    } else {
      this.gpuItem.hide();
    }
  }

  dispose(): void {
    this.cpuItem.dispose();
    this.memItem.dispose();
    this.gpuItem.dispose();
  }
}
