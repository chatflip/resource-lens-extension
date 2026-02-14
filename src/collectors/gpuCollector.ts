import { GpuInfo } from "./types";
import { execFileAsync } from "../utils/exec";

type GpuBackend = "nvidia" | "apple" | "amd" | null;

let detectedBackend: GpuBackend | undefined;
let lastGpuInfo: GpuInfo | null = null;

/**
 * Detect which GPU backend is available.
 * Checks in order: NVIDIA (nvidia-smi) → macOS (system_profiler) → AMD (rocm-smi).
 */
async function detectBackend(): Promise<GpuBackend> {
  // NVIDIA
  try {
    await execFileAsync("nvidia-smi", ["--query-gpu=name", "--format=csv,noheader"], 2000);
    return "nvidia";
  } catch {
    // not available
  }

  // macOS (Apple Silicon / integrated GPU)
  if (process.platform === "darwin") {
    try {
      await execFileAsync("system_profiler", ["SPDisplaysDataType", "-json"], 2000);
      return "apple";
    } catch {
      // not available
    }
  }

  // AMD ROCm
  try {
    await execFileAsync("rocm-smi", ["--showid"], 2000);
    return "amd";
  } catch {
    // not available
  }

  return null;
}

async function collectNvidia(): Promise<GpuInfo> {
  const output = await execFileAsync("nvidia-smi", [
    "--query-gpu=name,memory.total,memory.used,temperature.gpu,utilization.gpu",
    "--format=csv,noheader,nounits",
  ]);

  const parts = output.trim().split(",").map((s) => s.trim());
  // name, memory.total (MB), memory.used (MB), temperature (C), utilization (%)
  return {
    name: parts[0] ?? "NVIDIA GPU",
    vendor: "NVIDIA",
    vramTotalMB: parseFloat(parts[1]) || null,
    vramUsedMB: parseFloat(parts[2]) || null,
    temperatureC: parseFloat(parts[3]) || null,
    coreUsage: parseFloat(parts[4]) ?? null,
  };
}

async function collectApple(): Promise<GpuInfo> {
  // Get GPU name from system_profiler
  const profilerOutput = await execFileAsync(
    "system_profiler",
    ["SPDisplaysDataType", "-json"],
  );

  let gpuName = "Apple GPU";
  try {
    const data = JSON.parse(profilerOutput);
    const displays = data.SPDisplaysDataType;
    if (displays && displays.length > 0) {
      gpuName = displays[0].sppci_model ?? displays[0]._name ?? "Apple GPU";
    }
  } catch {
    // ignore parse errors
  }

  // Try to get GPU memory usage from ioreg
  let vramUsedMB: number | null = null;
  let vramTotalMB: number | null = null;
  try {
    const ioregOutput = await execFileAsync("ioreg", [
      "-r", "-d", "1", "-w", "0", "-c", "IOAccelerator",
    ]);

    // Parse PerformanceStatistics for VRAM info
    const usedMatch = ioregOutput.match(/"vramUsedBytes"\s*=\s*(\d+)/);
    const freeMatch = ioregOutput.match(/"vramFreeBytes"\s*=\s*(\d+)/);

    if (usedMatch) {
      vramUsedMB = Math.round(parseInt(usedMatch[1], 10) / 1024 / 1024);
    }
    if (usedMatch && freeMatch) {
      const usedBytes = parseInt(usedMatch[1], 10);
      const freeBytes = parseInt(freeMatch[1], 10);
      vramTotalMB = Math.round((usedBytes + freeBytes) / 1024 / 1024);
    }
  } catch {
    // ioreg may not have GPU info on all Macs
  }

  return {
    name: gpuName,
    vendor: "Apple",
    coreUsage: null,
    vramTotalMB,
    vramUsedMB,
    temperatureC: null,
  };
}

async function collectAmd(): Promise<GpuInfo> {
  let gpuName = "AMD GPU";

  // Get GPU name
  try {
    const idOutput = await execFileAsync("rocm-smi", ["--showproductname"]);
    const nameMatch = idOutput.match(/Card Series:\s*(.+)/i);
    if (nameMatch) {
      gpuName = nameMatch[1].trim();
    }
  } catch {
    // ignore
  }

  // Get VRAM
  let vramTotalMB: number | null = null;
  let vramUsedMB: number | null = null;
  try {
    const memOutput = await execFileAsync("rocm-smi", ["--showmeminfo", "vram", "--csv"]);
    const lines = memOutput.trim().split("\n");
    if (lines.length >= 2) {
      const values = lines[1].split(",");
      if (values.length >= 2) {
        // Values are in bytes
        vramUsedMB = Math.round(parseInt(values[0], 10) / 1024 / 1024);
        vramTotalMB = Math.round(parseInt(values[1], 10) / 1024 / 1024);
      }
    }
  } catch {
    // ignore
  }

  // Get temperature and utilization
  let temperatureC: number | null = null;
  let coreUsage: number | null = null;
  try {
    const tempOutput = await execFileAsync("rocm-smi", ["-t", "--csv"]);
    const tempLines = tempOutput.trim().split("\n");
    if (tempLines.length >= 2) {
      const val = parseFloat(tempLines[1].split(",")[1]);
      if (!isNaN(val)) { temperatureC = val; }
    }
  } catch {
    // ignore
  }

  try {
    const useOutput = await execFileAsync("rocm-smi", ["-u", "--csv"]);
    const useLines = useOutput.trim().split("\n");
    if (useLines.length >= 2) {
      const val = parseFloat(useLines[1].split(",")[1]);
      if (!isNaN(val)) { coreUsage = val; }
    }
  } catch {
    // ignore
  }

  return {
    name: gpuName,
    vendor: "AMD",
    coreUsage,
    vramTotalMB,
    vramUsedMB,
    temperatureC,
  };
}

/**
 * Detect GPU availability. Returns true if a GPU backend was found.
 */
export async function detectGpu(): Promise<boolean> {
  detectedBackend = await detectBackend();
  return detectedBackend !== null;
}

/**
 * Collect GPU info using the detected backend.
 * Returns null if no GPU is available.
 * On error, returns the last successful reading.
 */
export async function collectGpu(): Promise<GpuInfo | null> {
  if (detectedBackend === undefined) {
    await detectGpu();
  }

  if (detectedBackend === null) {
    return null;
  }

  try {
    let info: GpuInfo;
    switch (detectedBackend) {
      case "nvidia":
        info = await collectNvidia();
        break;
      case "apple":
        info = await collectApple();
        break;
      case "amd":
        info = await collectAmd();
        break;
    }
    lastGpuInfo = info;
    return info;
  } catch {
    // On error, return last known value
    return lastGpuInfo;
  }
}
