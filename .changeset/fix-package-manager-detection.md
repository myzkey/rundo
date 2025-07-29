---
"rundo": patch
---

Fix package manager detection to use lock files and add version check feature

- Improved package manager detection to prioritize lock files over system availability
- Added proper error handling when lock file exists but package manager is not installed
