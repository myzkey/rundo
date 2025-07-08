# rundo

> Select & Run Your Scripts Across Any PM, Instantly.

**rundo** is a CLI tool that scans your monorepo/workspace for all `package.json` files, collects their scripts, and lets you select and run them interactively with fuzzy search. It automatically detects your package manager (bun, pnpm, yarn, or npm) and executes the script in the correct directory.

## Features

- 🔍 **Auto-discovery**: Recursively scans for all `package.json` files in your monorepo
- 🎯 **Smart filtering**: Automatically excludes `node_modules` directories
- 🔧 **Package manager detection**: Auto-detects bun → pnpm → yarn → npm
- 🔍 **Fuzzy search**: Interactive search with autocomplete
- 🚀 **Instant execution**: Runs scripts in their correct directories

## Usage

```bash
npx rundo
```

The tool will:

1. Scan for all `package.json` files in the current directory and subdirectories
2. Detect your package manager
3. Show an interactive list of all available scripts
4. Execute the selected script in the correct directory

## Example

```bash
$ npx rundo
🔍 Scanning for package.json files...
✅ Found 12 scripts
🔍 Detecting package manager...
✅ Using pnpm
? Select a script to run: (Use arrow keys or type to search)
❯ root:build
  root:dev
  apps/web:start
  apps/api:test
  packages/ui:build
  packages/shared:lint
```

## Requirements

- Node.js 20+
- Any package manager (npm, yarn, pnpm, bun)

## License

MIT
