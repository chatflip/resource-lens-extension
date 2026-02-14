import * as vscode from "vscode";
import { StatusBarManager } from "./statusBar";
import { collectCpu } from "./collectors/cpuCollector";
import { collectMemory } from "./collectors/memoryCollector";
import { detectGpu, collectGpu } from "./collectors/gpuCollector";

let statusBarManager: StatusBarManager | undefined;
let timer: ReturnType<typeof setInterval> | undefined;
let gpuAvailable = false;

async function tick(): Promise<void> {
  const cpu = collectCpu();
  const mem = collectMemory();
  const gpu = gpuAvailable ? await collectGpu() : null;
  statusBarManager?.update(cpu, mem, gpu);
}

function startTimer(intervalMs: number): void {
  stopTimer();
  timer = setInterval(tick, intervalMs);
}

function stopTimer(): void {
  if (timer !== undefined) {
    clearInterval(timer);
    timer = undefined;
  }
}

function getInterval(): number {
  const config = vscode.workspace.getConfiguration("resourceLens");
  const interval = config.get<number>("updateInterval", 1000);
  return Math.max(500, interval);
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  statusBarManager = new StatusBarManager();
  context.subscriptions.push({ dispose: () => statusBarManager?.dispose() });

  // Detect GPU
  const config = vscode.workspace.getConfiguration("resourceLens");
  if (config.get<boolean>("showGpu", true)) {
    gpuAvailable = await detectGpu();
  }

  // Initial tick then start interval
  await tick();
  startTimer(getInterval());

  // React to configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("resourceLens")) {
        // Re-check GPU if the setting changed
        if (e.affectsConfiguration("resourceLens.showGpu")) {
          const cfg = vscode.workspace.getConfiguration("resourceLens");
          if (cfg.get<boolean>("showGpu", true)) {
            gpuAvailable = await detectGpu();
          }
        }

        // Restart timer with potentially new interval
        startTimer(getInterval());
      }
    })
  );

  context.subscriptions.push({ dispose: stopTimer });
}

export function deactivate(): void {
  stopTimer();
}
