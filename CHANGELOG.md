# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.2] - 2026-02-14

### Added

- Automated release workflow: publish to Marketplace and create GitHub Release on tag push
- GitHub Actions CI: lint, test with coverage, and build on push/PR
- ESLint (flat config + typescript-eslint) and Prettier for code quality
- Extension icon for Marketplace listing
- Keywords and Visualization category for Marketplace discoverability

### Changed

- Add `CPU` / `RAM` / `VRAM` labels to status bar items
- Show VRAM usage instead of GPU core utilization in status bar
- Simplify tooltips: remove headers, bar charts, and GPU vendor row
- Unify CPU display width with `toFixed(1).padStart(4)` to prevent flicker
- Remove per-core usage list from CPU tooltip to avoid overflow
- Merge three tooltip files into single `tooltips.ts` with shared helper
- Remove unused `CpuCoreInfo` interface and `usagePercent` field
- Derive package version from git tag in release workflow (`package.json` stays `0.0.0`)
- Migrate from npm to pnpm
- Pin GitHub Actions `uses` to commit hashes for supply-chain security

### Fixed

- Fix NaN leak in GPU `coreUsage` parsing (replace `??` with `Number.isNaN` check)
- Fix `gpuAvailable` not resetting when `showGpu` is disabled

## [0.0.1] - 2025-01-01

### Added

- Real-time CPU, RAM, and VRAM usage display in the VS Code status bar
- Rich Markdown tooltips with bar charts and detailed stats on hover
- NVIDIA GPU support via `nvidia-smi` (auto-hidden when unavailable)
- Configurable update interval (`resourceLens.updateIntervalMs`, default 1s, min 500ms)
- Per-item visibility toggles (`showCpu`, `showMemory`, `showGpu`)
- Flicker suppression (skip update when text unchanged)
- Docker-based multi-environment test infrastructure (Ubuntu, Alpine, GPU mock)
- Unit and integration tests with vitest
