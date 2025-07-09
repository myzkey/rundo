# rundo

## 0.0.5

### Patch Changes

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
