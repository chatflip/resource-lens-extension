import { describe, expect, it } from 'vitest';
import { buildGpuTooltip } from './tooltips';

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
  });
});
