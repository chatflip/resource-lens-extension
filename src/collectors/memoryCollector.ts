import * as os from "os";
import { MemoryInfo } from "./types";

export function collectMemory(): MemoryInfo {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = totalBytes - freeBytes;
  const usagePercent = Math.round((usedBytes / totalBytes) * 1000) / 10;

  return {
    totalBytes,
    usedBytes,
    freeBytes,
    usagePercent,
  };
}
