import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { FileCacheClient } from '@/infra/cache'

type VersionInfo = {
  current: string
  latest: string
  lastChecked: number
}

type CacheData = {
  version: string
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export class VersionManager {
  private versionCache: FileCacheClient<CacheData>
  private packageName: string

  constructor(packageName: string = 'rundo') {
    this.packageName = packageName
    this.versionCache = new FileCacheClient<CacheData>('version')
  }

  private async getVersionInfo(): Promise<VersionInfo | null> {
    const currentVersion = this.getCurrentVersion()
    if (!currentVersion) return null

    // Check cache first
    const cache = await this.versionCache.get('latest')
    const now = Date.now()

    let latestVersion = ''

    if (cache) {
      // Use cached version
      latestVersion = cache.version
    } else {
      // Fetch latest version
      latestVersion = await this.fetchLatestVersion()
      if (latestVersion) {
        await this.saveCache(latestVersion)
      }
    }

    if (!latestVersion) return null

    return {
      current: currentVersion,
      latest: latestVersion,
      lastChecked: now,
    }
  }

  private formatUpdateMessage(versionInfo: VersionInfo): string {
    const hasUpdate = this.compareVersions(versionInfo.current, versionInfo.latest)

    if (!hasUpdate) return ''

    return `
┌─────────────────────────────────────────────────┐
│  🚀 Update available: ${versionInfo.current} → ${versionInfo.latest}          │
│                                                 │
│  Run: npm install -g ${this.packageName}@latest               │
│   Or: pnpm add -g ${this.packageName}@latest                  │
│   Or: yarn global add ${this.packageName}@latest              │
│   Or: bun install -g ${this.packageName}@latest               │
└─────────────────────────────────────────────────┘
`
  }

  public async notifyIfUpdateAvailable(): Promise<void> {
    try {
      const versionInfo = await this.getVersionInfo()
      if (versionInfo) {
        const message = this.formatUpdateMessage(versionInfo)
        if (message) {
          console.log(message)
        }
      }
    } catch {
      // Silently ignore update check failures
    }
  }

  private async fetchLatestVersion(): Promise<string> {
    try {
      const response = await fetch(
        `https://registry.npmjs.org/${this.packageName}/latest`
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = (await response.json()) as { version: string }
      return data.version
    } catch (error) {
      console.warn(
        'Failed to check for updates:',
        error instanceof Error ? error.message : 'Unknown error'
      )
      return ''
    }
  }

  private getCurrentVersion(): string {
    try {
      // Try to read from package.json in the installed location
      const packageJsonPath = join(
        dirname(new URL(import.meta.url).pathname),
        '../../package.json'
      )
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
        return packageJson.version
      }

      // Fallback: return empty string if can't determine version
      return ''
    } catch {
      return ''
    }
  }

  private async saveCache(version: string): Promise<void> {
    const cacheData: CacheData = {
      version,
    }
    await this.versionCache.set('latest', cacheData, CACHE_DURATION)
  }

  private compareVersions(current: string, latest: string): boolean {
    if (!current || !latest) return false

    const currentParts = current.split('.').map(Number)
    const latestParts = latest.split('.').map(Number)

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0
      const latestPart = latestParts[i] || 0

      if (latestPart > currentPart) return true
      if (latestPart < currentPart) return false
    }

    return false
  }
}
