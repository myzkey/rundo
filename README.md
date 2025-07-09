# rundo

> Select & Run Your Scripts Across Any PM, Instantly.

**rundo** is a CLI tool that scans your monorepo/workspace for all `package.json` files, collects their scripts, and lets you select and run them interactively with fuzzy search. It automatically detects your package manager (bun, pnpm, yarn, or npm) and executes the script in the correct directory.

**[日本語版README](README.ja.md)**

## Features

- 🔍 **Auto-discovery**: Recursively scans for all `package.json` files in your monorepo
- 🎯 **Smart filtering**: Automatically excludes `node_modules` and other build directories
- 🔧 **Package manager detection**: Auto-detects bun → pnpm → yarn → npm
- 🔍 **Fuzzy search**: Interactive search with autocomplete
- 🚀 **Instant execution**: Runs scripts in their correct directories
- 📝 **Smart history**: Remembers frequently used scripts and prioritizes them
- 🗂️ **XDG compliant**: Follows XDG Base Directory Specification for data storage

## Installation

### Global Installation (Recommended)

```bash
# Using npm
npm install -g rundo

# Using pnpm
pnpm add -g rundo

# Using yarn
yarn global add rundo
```

### One-time Usage

```bash
npx rundo
```

## Usage

### Basic Usage

```bash
rundo
```

The tool will:

1. Scan for all `package.json` files in the current directory and subdirectories
2. Detect your package manager
3. Show an interactive list of all available scripts (with history-based prioritization)
4. Execute the selected script in the correct directory
5. Save the executed script to history for future prioritization

### Clear History

```bash
rundo clean
```

Removes all saved script execution history.

## Example

```bash
$ rundo
✅ Found 16 scripts using pnpm
? 🔍 Search script: (Use arrow keys or type to search)
❯ root:build          # ← Recently used scripts appear first
  root:dev
  apps/web:start
  apps/api:test
  packages/ui:build
  packages/shared:lint
```

## History Management

Rundo automatically saves your script execution history to prioritize frequently used scripts. The history is stored following XDG Base Directory Specification:

- **History file**: `~/.local/share/rundo/history.json`
- **Custom location**: Set `$XDG_DATA_HOME` environment variable to override

### History Features

- **Smart prioritization**: Recently used scripts appear at the top
- **Automatic cleanup**: Maintains only the last 50 executed scripts
- **Duplicate handling**: Updates timestamp instead of creating duplicates
- **Privacy-friendly**: Only successful executions are saved

## Configuration

Rundo supports configuration files for customizing scan behavior:

- `.rundorc` or `.rundorc.json`
- `rundo.config.json`

### Example Configuration

```json
{
  "maxDepth": 3,
  "ignore": ["node_modules", "dist", "build"],
  "include": ["apps/*", "packages/*"]
}
```

## Requirements

- Node.js 20+
- Any package manager (npm, yarn, pnpm, bun)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
