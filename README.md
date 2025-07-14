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
- 🕐 **History browser**: Interactive history with search and re-execution
- ❓ **Help system**: Built-in help with `--help` flag
- 🗂️ **XDG compliant**: Follows XDG Base Directory Specification for data storage
- ⚙️ **Configurable**: Supports configuration files for custom behavior

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

### Browse and Run from History

```bash
rundo history
```

Interactive history browser that allows you to:
- Browse previously executed scripts
- Search through history with fuzzy search
- Select and re-run scripts instantly
- See execution time and directory context

### Clear History

```bash
rundo clean
```

Removes all saved script execution history.

### Help

```bash
rundo --help
# or
rundo -h
```

Shows usage information, available commands, and features.

## Examples

### Running Scripts

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

### Browsing History

```bash
$ rundo history
📝 Command History (3 entries):

? 🔍 Search history: (Use arrow keys or type to search)
❯ root:build (~/) - 5m ago
  apps/web:start (~/apps/web) - 2h ago
  packages/ui:test (~/packages/ui) - 1d ago
```

### Help Information

```bash
$ rundo --help
📖 Rundo - Interactive npm script runner

Usage:
  rundo                Run interactive script selector
  rundo history        Browse and run from command history
  rundo clean          Clear command history

Options:
  -h, --help           Show this help message

Features:
  • Auto-detects package manager (bun → pnpm → yarn → npm)
  • Fuzzy search for scripts across monorepo/workspace
  • Command history with search and quick re-execution
  • Respects .rdrc, .rundorc, and rundo.config.json files

Repository: https://github.com/myzkey/rundo
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

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxDepth` | number | `10` | Maximum directory depth to scan |
| `ignore` | string[] | `["node_modules", "dist", ...]` | Directories to ignore |
| `include` | string[] | `[]` | Specific patterns to include |

## Troubleshooting

### Common Issues

**Q: Scripts not found in my monorepo**
A: Check that your `package.json` files contain a `scripts` section and ensure they're not in ignored directories.

**Q: Wrong package manager detected**
A: Rundo detects package managers in order: bun → pnpm → yarn → npm. Make sure your preferred package manager is installed globally.

**Q: History not working**
A: Ensure you have write permissions to `~/.local/share/rundo/` or set `$XDG_DATA_HOME` to a writable directory.

**Q: Performance issues in large repositories**
A: Use configuration file to limit scan depth or specify include patterns to reduce scan scope.

### Debug Mode

For debugging, you can check the history file location:
```bash
# Default location
ls ~/.local/share/rundo/history.json

# Custom XDG location
ls $XDG_DATA_HOME/rundo/history.json
```

## Requirements

- Node.js 20+
- Any package manager (npm, yarn, pnpm, bun)

## Use Cases

### Monorepo Development
Perfect for large monorepos with multiple apps and packages:
```
my-monorepo/
├── apps/
│   ├── web/package.json      # build, dev, test
│   └── api/package.json      # start, test, migrate
├── packages/
│   ├── ui/package.json       # build, storybook
│   └── shared/package.json   # build, test
└── package.json              # build:all, test:all
```

### Workspace Management
Quickly switch between different project contexts without memorizing paths and script names.

### CI/CD Integration
Use in CI environments to run specific scripts across workspace packages.

## Performance

- **Fast scanning**: Optimized directory traversal with smart ignore patterns
- **Minimal memory usage**: Streams directory contents instead of loading everything into memory
- **Instant search**: Fuzzy search with sub-millisecond response times
- **Efficient history**: Only stores essential information with automatic cleanup

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run the test suite (`pnpm test`)
5. Run linting (`pnpm lint`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/myzkey/rundo.git
cd rundo

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## License

MIT
