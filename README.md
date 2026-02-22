# Resource Lens

[![CI](https://github.com/chatflip/resource-lens-extension/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/chatflip/resource-lens-extension/actions/workflows/ci.yml?query=branch%3Amain)
[![License](https://img.shields.io/github/license/chatflip/resource-lens-extension)](LICENSE.txt)

Shows CPU, memory, and GPU usage in the VS Code status bar.

![status bar example](https://raw.githubusercontent.com/chatflip/resource-lens-extension/main/images/statusbar.png)

Hover over any item for a tooltip with CPU model, memory breakdown, and GPU
temperature.

## GPU support

Only NVIDIA GPUs are supported, via `nvidia-smi`. If `nvidia-smi` isn't
found, the GPU item is hidden automatically.

Tested on Docker (Linux) with an RTX 2080 Ti.

## Install

Search for **Resource Lens** in the Extensions panel.

## Settings

```jsonc
{
  // Update interval in ms (minimum 500)
  "resourceLens.updateIntervalMs": 1000,

  "resourceLens.showCpu": true,
  "resourceLens.showMemory": true,
  "resourceLens.showGpu": true,
}
```

To reduce update frequency:

```jsonc
{ "resourceLens.updateIntervalMs": 5000 }
```

To show CPU only:

```jsonc
{
  "resourceLens.showMemory": false,
  "resourceLens.showGpu": false,
}
```

## Known issues

- Tooltips may dismiss briefly while values update. This is a
  [VS Code limitation](https://github.com/microsoft/vscode/issues/128887) and
  not specific to this extension.

## License

[Apache-2.0](LICENSE.txt)
