import { describe, expect, it } from 'vitest';
import {
  buildCpuTooltip,
  buildGpuTooltip,
  buildMemoryTooltip,
} from './tooltips';

describe('buildCpuTooltip', () => {
  it('renders CPU rows with readable headers', () => {
    const tooltip = buildCpuTooltip({
      model: 'Apple M3',
      cores: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      overall: 25,
      speedMHz: 3200,
    });

    expect(tooltip).toContain('| Name | Usage | \\| | Name | Usage |');
    expect(tooltip).toContain('| Core 1 | 10.0% | \\| | Core 9 | 90.0% |');
    expect(tooltip).toContain('| Core 2 | 20.0% | \\| | Core 10 | 100.0% |');
    expect(tooltip).toContain('| Core 8 | 80.0% | \\| |  |  |');
    expect(tooltip).toContain('| ---- | ---- |');
    expect(tooltip).toContain('| Average | 25.0% |');
    expect(tooltip.indexOf('| Core 8 | 80.0% | \\| |  |  |')).toBeLessThan(
      tooltip.indexOf('| Average | 25.0% |'),
    );
    expect(tooltip.indexOf('| Name | Usage | \\| | Name | Usage |')).toBe(
      tooltip.lastIndexOf('| Name | Usage | \\| | Name | Usage |'),
    );
    expect(tooltip).toContain('| Name | Cores | Speed |');
    expect(tooltip).toContain('|:---|---:|---:|');
    expect(tooltip).toContain('| Apple M3 | 10 | 3200 MHz |');
    expect(tooltip.indexOf('| Name | Cores | Speed |')).toBeLessThan(
      tooltip.indexOf('| Name | Usage | \\| | Name | Usage |'),
    );
  });
});

describe('buildMemoryTooltip', () => {
  it('renders memory rows with readable headers', () => {
    const gib = 1024 * 1024 * 1024;
    const tooltip = buildMemoryTooltip({
      totalBytes: 16 * gib,
      usedBytes: 7.5 * gib,
      freeBytes: 8.5 * gib,
    });

    expect(tooltip).toContain('| Used | Free | Total |');
    expect(tooltip).toContain('|---:|---:|---:|');
    expect(tooltip).toContain('| 7.5 GB | 8.5 GB | 16.0 GB |');
  });
});

describe('buildGpuTooltip', () => {
  it('renders multi-GPU rows with readable headers', () => {
    const tooltip = buildGpuTooltip([
      {
        name: 'NVIDIA RTX 4090',
        vendor: 'NVIDIA',
        coreUsage: 42,
        vramUsedMB: 8192,
        vramTotalMB: 24576,
        temperatureC: 65,
      },
      {
        name: 'NVIDIA RTX 3080',
        vendor: 'NVIDIA',
        coreUsage: 5,
        vramUsedMB: 1024,
        vramTotalMB: 10240,
        temperatureC: 58,
      },
    ]);

    expect(tooltip).toContain('| Name | Usage | VRAM | Temp |');
    expect(tooltip).toContain('|:---|---:|---:|---:|');
    expect(tooltip).toContain(
      '| NVIDIA RTX 4090 | 42.0% | 8.0/24.0 GB | 65°C |',
    );
    expect(tooltip).toContain(
      '| NVIDIA RTX 3080 | 5.0% | 1.0/10.0 GB | 58°C |',
    );
    expect(tooltip).toContain('| VRAM (total) |  | 9.0/34.0 GB |  |');
  });

  it('omits total VRAM row for a single GPU', () => {
    const tooltip = buildGpuTooltip([
      {
        name: 'NVIDIA RTX 4090',
        vendor: 'NVIDIA',
        coreUsage: 42,
        vramUsedMB: 8192,
        vramTotalMB: 24576,
        temperatureC: 65,
      },
    ]);

    expect(tooltip).not.toContain('VRAM (total)');
  });
});
