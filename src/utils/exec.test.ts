import { describe, it, expect } from 'vitest';
import { execFileAsync } from './exec';

describe('execFileAsync', () => {
  it('resolves with stdout on success', async () => {
    const result = await execFileAsync('node', ['--version']);
    expect(result).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('rejects on non-zero exit code', async () => {
    await expect(
      execFileAsync('node', ['-e', 'process.exit(1)']),
    ).rejects.toThrow();
  });

  it('rejects when command exceeds timeout', async () => {
    await expect(
      execFileAsync('node', ['-e', 'setTimeout(()=>{}, 10000)'], 200),
    ).rejects.toThrow();
  }, 3000);
});
