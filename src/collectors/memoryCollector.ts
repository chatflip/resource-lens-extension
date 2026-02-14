import * as os from 'os';
import { MemoryInfo } from './types';

export function collectMemory(): MemoryInfo {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = totalBytes - freeBytes;

  return { totalBytes, usedBytes, freeBytes };
}
