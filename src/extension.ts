import * as vscode from 'vscode';
import { StatusBarManager } from './statusBar';
import { collectCpu } from './collectors/cpuCollector';
import { collectMemory } from './collectors/memoryCollector';
import { detectGpu, collectGpu } from './collectors/gpuCollector';

let statusBarManager: StatusBarManager | undefined;
let timer: ReturnType<typeof setInterval> | undefined;
let gpuAvailable = false;

async function tick(): Promise<void> {
  const cpu = collectCpu();
  const mem = collectMemory();
  const gpu = gpuAvailable ? await collectGpu() : null;
  statusBarManager?.update(cpu, mem, gpu);
}

function getInterval(): number {
  return Math.max(
    500,
    vscode.workspace
      .getConfiguration('resourceLens')
      .get<number>('updateIntervalMs', 1000),
  );
}

function restartTimer(): void {
  if (timer !== undefined) clearInterval(timer);
  timer = setInterval(tick, getInterval());
}

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  statusBarManager = new StatusBarManager();
  context.subscriptions.push({ dispose: () => statusBarManager?.dispose() });

  const config = vscode.workspace.getConfiguration('resourceLens');
  if (config.get<boolean>('showGpu', true)) {
    gpuAvailable = await detectGpu();
  }

  await tick();
  restartTimer();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration('resourceLens')) {
        if (e.affectsConfiguration('resourceLens.showGpu')) {
          const cfg = vscode.workspace.getConfiguration('resourceLens');
          gpuAvailable = cfg.get<boolean>('showGpu', true)
            ? await detectGpu()
            : false;
        }
        restartTimer();
      }
    }),
  );

  context.subscriptions.push({
    dispose: () => {
      if (timer !== undefined) clearInterval(timer);
    },
  });
}

export function deactivate(): void {
  if (timer !== undefined) {
    clearInterval(timer);
    timer = undefined;
  }
}
