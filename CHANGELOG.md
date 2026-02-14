# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
