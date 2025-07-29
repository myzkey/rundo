---
rundo: patch
---

Release v0.0.8: Package manager detection fixes and version check feature

**Major Improvements:**

- **Fixed package manager detection**: Now prioritizes lock files over system availability
- **Added automatic update notifications**: Checks npm registry for latest version with 24-hour caching
- **Enhanced error handling**: Clear messages when lock file exists but package manager is missing

**Package Manager Detection:**

- Detects package manager based on lock files (bun.lockb, pnpm-lock.yaml, yarn.lock, package-lock.json)
- Throws helpful errors when package manager is not installed
- Requires explicit package manager setup (no more fallback to npm)
