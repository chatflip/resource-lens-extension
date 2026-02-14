import * as os from 'os';
import { CpuInfo } from './types';

interface CpuTick {
  idle: number;
  total: number;
}

let previousTicks: CpuTick[] | null = null;

function snapshot(): CpuTick[] {
  return os.cpus().map((cpu) => {
    const { user, nice, sys, idle, irq } = cpu.times;
    const total = user + nice + sys + idle + irq;
    return { idle, total };
  });
}

export function collectCpu(): CpuInfo {
  const cpus = os.cpus();
  const currentTicks = snapshot();

  let cores: { usage: number }[];

  if (previousTicks && previousTicks.length === currentTicks.length) {
    cores = currentTicks.map((cur, i) => {
      const prev = previousTicks![i];
      const idleDelta = cur.idle - prev.idle;
      const totalDelta = cur.total - prev.total;
      const usage =
        totalDelta === 0 ? 0 : ((totalDelta - idleDelta) / totalDelta) * 100;
      return { usage: Math.round(usage * 10) / 10 };
    });
  } else {
    // First call: no delta available, report 0
    cores = currentTicks.map(() => ({ usage: 0 }));
  }

  previousTicks = currentTicks;

  const overall =
    cores.length === 0
      ? 0
      : Math.round(
          (cores.reduce((sum, c) => sum + c.usage, 0) / cores.length) * 10,
        ) / 10;

  return {
    overall,
    cores,
    model: cpus[0]?.model ?? 'Unknown',
    speedMHz: cpus[0]?.speed ?? 0,
  };
}
