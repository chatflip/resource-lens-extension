# Resource Lens - VS Code Extension

## 概要
システムリソース（CPU、メモリ、GPU）の使用率をVS Codeのステータスバーにリアルタイム表示する拡張機能。

## 技術スタック
- TypeScript + esbuild (バンドル)
- VS Code Extension API
- ランタイム依存なし（devDependenciesのみ）

## ビルド・開発
- パッケージマネージャ: pnpm
- `pnpm run build` / `pnpm run watch`
- `F5`でExtension Development Host起動

## アーキテクチャ
```
extension.ts (エントリ: activate/deactivate + setIntervalループ)
├── StatusBarManager (ステータスバー3アイテム管理)
│   ├── cpuItem: $(pulse) CPU: xx%
│   ├── memItem: $(database) MEM: xx%
│   └── gpuItem: $(circuit-board) GPU: xx% (検出時のみ表示)
├── CpuCollector (os.cpus()差分計算、ステートフル)
├── collectMemory() (os.totalmem/freemem、ステートレス)
└── GpuCollector (NVIDIA→Apple→AMD順で検出)
```

## 主要な仕様
- **更新間隔**: ユーザー設定可能、デフォルト1秒（最小500ms）
- **対応OS**: macOS, Windows, Linux
- **表示形式**: `$(icon) ラベル: 数値%`
- **ホバー**: MarkdownStringによるリッチツールチップ（テーブル+バーチャート）
- **GPU**: 検出できた場合のみ表示、なければ非表示
- **設定変更**: onDidChangeConfigurationでリアルタイム反映

## 設定項目 (contributes.configuration)
- `resourceLens.updateInterval` (number, default: 1000, min: 500)
- `resourceLens.showCpu` (boolean, default: true)
- `resourceLens.showMemory` (boolean, default: true)
- `resourceLens.showGpu` (boolean, default: true)

## GPU検出 (優先順位)
1. NVIDIA: `nvidia-smi` (VRAM/温度/使用率取得可)
2. macOS: `system_profiler SPDisplaysDataType` + `ioreg -c IOAccelerator`
3. AMD: `rocm-smi` (VRAM/温度/使用率取得可)

## セキュリティ
- `exec`ではなく`execFile`を使用（シェルインジェクション防止）
- コマンドタイムアウト: デフォルト3秒

## ファイル構成
```
src/
├── extension.ts
├── statusBar.ts
├── collectors/
│   ├── types.ts
│   ├── cpuCollector.ts
│   ├── memoryCollector.ts
│   └── gpuCollector.ts
├── tooltips/
│   ├── cpuTooltip.ts
│   ├── memoryTooltip.ts
│   └── gpuTooltip.ts
└── utils/
    └── exec.ts
```
