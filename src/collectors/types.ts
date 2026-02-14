export interface CpuInfo {
  overall: number;
  cores: number[];
  model: string;
  speedMHz: number;
}

export interface MemoryInfo {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
}

export interface GpuInfo {
  name: string;
  vendor: string;
  coreUsage: number | null;
  vramTotalMB: number | null;
  vramUsedMB: number | null;
  temperatureC: number | null;
}
