export interface CpuCoreInfo {
  /** Usage percentage for this core (0-100) */
  usage: number;
}

export interface CpuInfo {
  /** Overall CPU usage percentage (0-100) */
  overall: number;
  /** Per-core usage */
  cores: CpuCoreInfo[];
  /** CPU model name */
  model: string;
  /** CPU speed in MHz */
  speedMHz: number;
}

export interface MemoryInfo {
  /** Total memory in bytes */
  totalBytes: number;
  /** Used memory in bytes */
  usedBytes: number;
  /** Free memory in bytes */
  freeBytes: number;
  /** Usage percentage (0-100) */
  usagePercent: number;
}

export interface GpuInfo {
  /** GPU name/model */
  name: string;
  /** GPU vendor */
  vendor: string;
  /** Core/GPU utilization percentage (0-100), null if unavailable */
  coreUsage: number | null;
  /** Total VRAM in MB, null if unavailable */
  vramTotalMB: number | null;
  /** Used VRAM in MB, null if unavailable */
  vramUsedMB: number | null;
  /** Temperature in Celsius, null if unavailable */
  temperatureC: number | null;
}
