import { readdir } from 'fs/promises'
import { join } from 'path'
import { RundoConfig } from '@/domain/config'

export async function fastScanPackageJson(
  cwd: string,
  config: RundoConfig
): Promise<string[]> {
  const results: string[] = []
  const skipDirs = new Set(config.ignore || [])
  const maxDepth = config.maxDepth || 3

  // Check root first
  try {
    const rootEntries = await readdir(cwd, { withFileTypes: true })

    // Look for package.json in root
    if (
      rootEntries.some(
        (entry) => entry.isFile() && entry.name === 'package.json'
      )
    ) {
      results.push(join(cwd, 'package.json'))
    }

    // Filter directories based on config
    let dirsToScan = rootEntries.filter(
      (entry) =>
        entry.isDirectory() &&
        !skipDirs.has(entry.name) &&
        !entry.name.startsWith('.')
    )

    // Apply include filter if specified
    if (config.include && config.include.length > 0) {
      dirsToScan = dirsToScan.filter((entry) =>
        config.include!.some(
          (pattern) =>
            entry.name.includes(pattern) ||
            new RegExp(pattern.replace('*', '.*')).test(entry.name)
        )
      )
    }

    // Check locations in parallel
    const locationPromises = dirsToScan.map(async (entry) => {
      const dirPath = join(cwd, entry.name)
      return scanDirectory(dirPath, maxDepth - 1, skipDirs)
    })

    const locationResults = await Promise.all(locationPromises)
    for (const locationResult of locationResults) {
      results.push(...locationResult)
    }
  } catch {
    // Ignore errors
  }

  return results
}

async function scanDirectory(
  dir: string,
  maxDepth: number,
  skipDirs: Set<string>
): Promise<string[]> {
  if (maxDepth <= 0) return []

  const results: string[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    // Check for package.json in current directory
    const hasPackageJson = entries.some(
      (entry) => entry.isFile() && entry.name === 'package.json'
    )

    if (hasPackageJson) {
      results.push(join(dir, 'package.json'))
    }

    // Scan subdirectories
    const subDirPromises = entries
      .filter((entry) => {
        if (!entry.isDirectory()) return false
        if (skipDirs.has(entry.name)) return false
        if (entry.name.startsWith('.')) return false
        return true
      })
      .slice(0, 50) // Limit subdirs for performance
      .map((entry) =>
        scanDirectory(join(dir, entry.name), maxDepth - 1, skipDirs)
      )

    if (subDirPromises.length > 0) {
      const subResults = await Promise.all(subDirPromises)
      for (const subResult of subResults) {
        results.push(...subResult)
      }
    }
  } catch {
    // Ignore permission errors
  }

  return results
}
