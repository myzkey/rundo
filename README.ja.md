# rundo

> どのパッケージマネージャーでも、瞬時にスクリプトを選択・実行。

**rundo** は、モノレポ/ワークスペース内のすべての `package.json` ファイルをスキャンし、スクリプトを収集して、ファジー検索で対話的に選択・実行できるCLIツールです。パッケージマネージャー（bun、pnpm、yarn、npm）を自動検出し、正しいディレクトリでスクリプトを実行します。

**[English README](README.md)**

## 機能

- 🔍 **自動検出**: モノレポ内のすべての `package.json` ファイルを再帰的にスキャン
- 🎯 **スマートフィルタリング**: `node_modules` やビルドディレクトリを自動除外
- 🔧 **パッケージマネージャー検出**: bun → pnpm → yarn → npm の順で自動検出
- 🔍 **ファジー検索**: オートコンプリート付きの対話的検索
- 🚀 **即座に実行**: 正しいディレクトリでスクリプトを実行
- 📝 **スマート履歴**: よく使うスクリプトを記憶し、優先表示
- 🗂️ **XDG準拠**: XDG Base Directory Specification に従ったデータ保存

## インストール

### グローバルインストール（推奨）

```bash
# npm を使用
npm install -g rundo

# pnpm を使用
pnpm add -g rundo

# yarn を使用
yarn global add rundo
```

### ワンタイム実行

```bash
npx rundo
```

## 使用方法

### 基本的な使用方法

```bash
rundo
```

ツールは以下の処理を行います：

1. 現在のディレクトリとサブディレクトリのすべての `package.json` ファイルをスキャン
2. パッケージマネージャーを検出
3. 利用可能なすべてのスクリプトを対話的なリストで表示（履歴による優先表示）
4. 選択されたスクリプトを正しいディレクトリで実行
5. 実行されたスクリプトを履歴に保存し、今後の優先表示に使用

### 履歴のクリア

```bash
rundo clean
```

保存されたスクリプト実行履歴をすべて削除します。

## 使用例

```bash
$ rundo
✅ Found 16 scripts using pnpm
? 🔍 Search script: （矢印キーまたは入力で検索）
❯ root:build          # ← 最近使用したスクリプトが最初に表示
  root:dev
  apps/web:start
  apps/api:test
  packages/ui:build
  packages/shared:lint
```

## 履歴管理

rundo は自動的にスクリプト実行履歴を保存し、よく使うスクリプトを優先表示します。履歴は XDG Base Directory Specification に従って保存されます：

- **履歴ファイル**: `~/.local/share/rundo/history.json`
- **カスタム場所**: `$XDG_DATA_HOME` 環境変数を設定してオーバーライド可能

### 履歴機能

- **スマート優先表示**: 最近使用したスクリプトが上位に表示
- **自動クリーンアップ**: 最新の50件の実行スクリプトのみを保持
- **重複処理**: 重複作成の代わりにタイムスタンプを更新
- **プライバシー重視**: 成功した実行のみを保存

## 設定

rundo はスキャン動作をカスタマイズするための設定ファイルをサポートしています：

- `.rundorc` または `.rundorc.json`
- `rundo.config.json`

### 設定例

```json
{
  "maxDepth": 3,
  "ignore": ["node_modules", "dist", "build"],
  "include": ["apps/*", "packages/*"]
}
```

### 設定オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|----------|-----|
| `maxDepth` | `number` | `5` | ディレクトリをスキャンする最大の深さ |
| `ignore` | `string[]` | [詳細リスト](#デフォルト除外ディレクトリ) | 除外するディレクトリパターン |
| `include` | `string[]` | `[]` | 含めるディレクトリパターン（指定した場合、これらのみスキャン） |

### デフォルト除外ディレクトリ

```json
[
  "node_modules", ".yarn", "dist", "build", "out",
  ".next", ".nuxt", ".output", ".svelte-kit", 
  ".storybook-static", ".turbo", ".nx", ".git",
  "vendor", "coverage", "tmp", "log", ".cache",
  "target", "obj", "venv", ".venv", "env", ".env",
  ".mypy_cache", ".pytest_cache", "__pycache__",
  "bootstrap/cache"
]
```

## 動作要件

- Node.js 20+
- 任意のパッケージマネージャー（npm、yarn、pnpm、bun）

## コマンド一覧

| コマンド | 説明 |
|---------|-----|
| `rundo` | スクリプトの検索・選択・実行 |
| `rundo clean` | 実行履歴をクリア |

## よくある質問

### Q: なぜ一部のスクリプトが表示されないのですか？

A: 以下の理由が考えられます：
- ディレクトリが `ignore` 設定に含まれている
- `maxDepth` の制限に達している
- `include` 設定が指定されているが、該当ディレクトリが含まれていない

### Q: 履歴ファイルを手動で編集できますか？

A: 技術的には可能ですが、推奨されません。代わりに `rundo clean` を使用して履歴をリセットしてください。

### Q: 設定ファイルの優先順位は？

A: 以下の順序で検索されます：
1. `.rundorc`
2. `.rundorc.json`
3. `rundo.config.json`

## トラブルシューティング

### スクリプトが見つからない

```bash
# 現在のディレクトリに package.json があることを確認
ls package.json

# 設定ファイルの ignore 設定を確認
cat .rundorc
```

### 履歴が保存されない

```bash
# 履歴ディレクトリの確認
ls -la ~/.local/share/rundo/

# 権限の確認
ls -la ~/.local/share/
```

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

## ライセンス

MIT