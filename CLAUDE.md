# Resource Lens - VS Code Extension

## 概要

システムリソース（CPU、メモリ、GPU）の使用率をVS Codeのステータスバーにリアルタイム表示する拡張機能。

## 設計方針

- **最小表示・最小情報**: ステータスバーもツールチップも、できる限り小さく・少なく。迷ったら省く側に倒す。
  - ステータスバー: アイコン・ラベルなし、数値のみ
  - ツールチップ: 一目で理解できる最小限の項目のみ。統計や詳細な履歴は載せない

## 技術スタック

- TypeScript + esbuild (バンドル)
- VS Code Extension API
- ランタイム依存なし（devDependenciesのみ）

## ビルド・開発

- パッケージマネージャ: pnpm
- ビルド・パッケージ化等のフローは **make を通して実行する**（`pnpm` / `npm` を直接使わない）
  - `make build` / `make watch` / `make package` / `make clean`
- `F5`でExtension Development Host起動

## アーキテクチャ

```
extension.ts (エントリ: activate/deactivate + setIntervalループ)
├── StatusBarManager (ステータスバー3アイテム管理)
│   ├── cpuItem:  xx.x%
│   ├── memItem: xx.x/xx.x GB
│   └── gpuItem: xx.x/xx.x GB (検出時のみ表示)
├── CpuCollector (os.cpus()差分計算、ステートフル)
├── collectMemory() (os.totalmem/freemem、ステートレス)
└── GpuCollector (nvidia-smiで検出)
```

## ステータスバー表示形式（統一ルール）

| アイテム | 形式              | 例                        |
| -------- | ----------------- | ------------------------- |
| CPU      | `CPU xx.x%`       | `CPU  9.5%` / `CPU 45.3%` |
| RAM      | `RAM x.x/x.x GB`  | `RAM 7.2/16.0 GB`         |
| VRAM     | `VRAM x.x/x.x GB` | `VRAM 4.2/8.0 GB`         |

- **アイコンなし**（テキストラベル+数値）
- **CPU**: `toFixed(1).padStart(4)` で幅を揃える（小数点以下1桁、整数部が1桁のときスペース補填）
- **RAM/VRAM**: `使用量/総量 GB`（小数点以下1桁）。総量不明時は `x.x GB` のみ
- **フリッカー抑制**: テキストが前回と同じ場合はステータスバーアイテムを更新しない

## ツールチップ形式

- ヘッダー（CPU/RAM/VRAM等）は表示しない
- **CPU**: Model / Cores / Speed（静的情報のみ。Overall%は表示しない）
- **RAM**: Total / Used / Free
- **VRAM**: Name / Core Usage / VRAM詳細 / 温度（Vendorは表示しない）

## 主要な仕様

- **更新間隔**: ユーザー設定可能、デフォルト1秒（最小500ms）
- **対応OS**: macOS, Windows, Linux
- **ホバー**: MarkdownStringによるリッチツールチップ（テーブル+バーチャート）
- **GPU**: 検出できた場合のみ表示、なければ非表示
- **設定変更**: onDidChangeConfigurationでリアルタイム反映

## 設定項目 (contributes.configuration)

- `resourceLens.updateIntervalMs` (number, default: 1000, min: 500)
- `resourceLens.showCpu` (boolean, default: true)
- `resourceLens.showMemory` (boolean, default: true)
- `resourceLens.showGpu` (boolean, default: true)

## GPU検出

- **NVIDIA のみ対応**
- `nvidia-smi` で検出・取得（VRAM/温度/使用率）
- 検出失敗時は GPU 表示を非表示

## セキュリティ

- `exec`ではなく`execFile`を使用（シェルインジェクション防止）
- コマンドタイムアウト: デフォルト3秒

## GitHub Actions

- `uses` はタグ指定ではなく **commit hash 指定** にする（サプライチェーン攻撃対策）
- どのバージョンか分かるよう、行末にコメントでタグを記載する
  - 例: `uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2`

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
