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
- **すべてのコマンドは make 経由で実行する**（`pnpm` / `npm` を直接叩かない）
- `F5`でExtension Development Host起動

| コマンド            | 内容                     |
| ------------------- | ------------------------ |
| `make build`        | ビルド                   |
| `make watch`        | ウォッチモード           |
| `make package`      | vsix パッケージ生成      |
| `make test`         | ユニットテスト (vitest)  |
| `make lint`         | ESLint                   |
| `make format`       | Prettier で整形          |
| `make format-check` | Prettier 差分チェック    |
| `make clean`        | dist / node_modules 削除 |

## コード品質

- **ESLint**: flat config (`eslint.config.mjs`)、`typescript-eslint` recommended
- **Prettier**: singleQuote, trailingComma (`.prettierrc`)
- **テスト**: vitest + `@vitest/coverage-v8`（設定: `config/vitest.config.ts`）
- **CI**: GitHub Actions（lint → test w/ coverage → build）

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

## ステータスバー表示形式

| アイテム | 形式              | 例                        |
| -------- | ----------------- | ------------------------- |
| CPU      | `CPU xx.x%`       | `CPU  9.5%` / `CPU 45.3%` |
| RAM      | `RAM x.x/x.x GB`  | `RAM 7.2/16.0 GB`         |
| VRAM     | `VRAM x.x/x.x GB` | `VRAM 4.2/8.0 GB`         |

- **CPU**: `toFixed(1).padStart(4)` で幅統一
- **RAM/VRAM**: `使用量/総量 GB`（小数点以下1桁）。総量不明時は `x.x GB` のみ
- **フリッカー抑制**: テキストが前回と同じなら更新しない

## ツールチップ形式

- ヘッダー（CPU/RAM/VRAM等）は表示しない
- **CPU**: Model / Cores / Speed（静的情報のみ）
- **RAM**: Total / Used / Free
- **VRAM**: Name / Core Usage / VRAM詳細 / 温度（Vendorは表示しない）

## 設定項目 (contributes.configuration)

- `resourceLens.updateIntervalMs` (number, default: 1000, min: 500)
- `resourceLens.showCpu` / `showMemory` / `showGpu` (boolean, default: true)

## GPU検出

- NVIDIA のみ対応（`nvidia-smi`）
- 検出失敗時は非表示

## セキュリティ

- `exec`ではなく`execFile`を使用（シェルインジェクション防止）
- コマンドタイムアウト: デフォルト3秒

## リリース手順

以下は人間が行う。Claude はタグ作成・プッシュを実行しないこと。

1. `git tag v<version>`（例: `git tag v0.1.0`）
2. `git push origin v<version>`

タグプッシュで GitHub Actions（`.github/workflows/release.yml`）が自動実行される:

- タグからバージョンを読み取り `package.json` を自動更新してビルド
- lint + test → Marketplace 公開 + GitHub Release 作成
- `package.json` の `version` は `0.0.0` 固定（手動更新不要）
- **Secret**: リポジトリに `VSCE_PAT`（Azure DevOps PAT）の設定が必要

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
