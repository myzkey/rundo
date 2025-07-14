# rundo

## 0.0.7

### Patch Changes

- 48cec5a: Add interactive history command and help system

## 0.0.6

### Patch Changes 0.0.6

- Add interactive history command and help system
  - Add `rundo history` command with interactive selection and fuzzy search
  - Add `rundo -h, --help` command with usage information
  - Add GitHub repository URL to help message
  - Remove semicolons from codebase and update linting rules
  - Integrate lint and format commands for better developer experience
  - Refactor code structure: separate help and history modules
  - Remove `.js` extensions from imports with TypeScript configuration

## 0.0.5

### Patch Changes 0.0.5

- 3885ab8: Add command history feature that tracks previously executed scripts and prioritizes frequently used ones in the selection list. History is persisted

## 0.0.4

### Patch Changes

- Add command history feature with XDG Base Directory Specification support
  - Add smart history that remembers frequently used scripts and prioritizes them
  - Follow XDG Base Directory Specification for data storage (~/.local/share/rundo/)
  - Add `rundo clean` command to clear history
  - History automatically saves successful script executions (max 50 entries)
  - Update existing entries instead of creating duplicates
  - Add comprehensive README documentation in both English and Japanese
  - Remove `.rdrc` config file support, keep only `.rundorc` and `rundo.config.json`
  - Add complete test coverage for history functionality

## 0.0.3

### Patch Changes

- eccb825: Add example React project to demonstrate rundo usage in monorepo environments

## 0.0.2

### Patch Changes

- Initial release of rundo - Interactive fuzzy-search CLI for running npm scripts in monorepos
