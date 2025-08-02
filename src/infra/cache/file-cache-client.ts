import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
  readdirSync,
} from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { CacheClient, CacheOptions } from './types'

interface CacheEntry<T> {
  value: T
  expiry?: number
}

export class FileCacheClient<T> implements CacheClient<T> {
  private readonly directory: string

  constructor(namespace: string, options?: CacheOptions) {
    const baseDir =
      options?.directory ||
      (process.env.XDG_DATA_HOME
        ? join(process.env.XDG_DATA_HOME, 'rundo')
        : join(homedir(), '.local', 'share', 'rundo'))
    this.directory = join(baseDir, 'cache', namespace)
    this.ensureDirectory()
  }

  public async get(key: string): Promise<T | null> {
    try {
      const filePath = this.getFilePath(key)
      if (!existsSync(filePath)) {
        return null
      }

      const content = readFileSync(filePath, 'utf8')
      const entry: CacheEntry<T> = JSON.parse(content)

      if (entry.expiry && Date.now() > entry.expiry) {
        await this.delete(key)
        return null
      }

      return entry.value
    } catch {
      return null
    }
  }

  public async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        value,
        expiry: ttl ? Date.now() + ttl : undefined,
      }

      const filePath = this.getFilePath(key)
      writeFileSync(filePath, JSON.stringify(entry, null, 2))
    } catch {
      // Ignore write errors
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
    } catch {
      // Ignore delete errors
    }
  }

  public async clear(): Promise<void> {
    try {
      if (existsSync(this.directory)) {
        const files = readdirSync(this.directory)
        for (const file of files) {
          if (file.endsWith('.json')) {
            unlinkSync(join(this.directory, file))
          }
        }
      }
    } catch {
      // Ignore clear errors
    }
  }

  private getFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_')
    return join(this.directory, `${safeKey}.json`)
  }

  private ensureDirectory(): void {
    if (!existsSync(this.directory)) {
      mkdirSync(this.directory, { recursive: true })
    }
  }
}
