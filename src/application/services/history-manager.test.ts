import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { HistoryEntry, HistoryData } from '@/domain/types.js'

// Test-specific HistoryManager that uses custom paths
class TestHistoryManager {
  private historyData: HistoryData = { scripts: [] }

  constructor(private historyFile: string) {}

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8')
      this.historyData = JSON.parse(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error('Failed to load history, resetting:', error)
      }
      this.historyData = { scripts: [] }
    }
  }

  async save(entry: Omit<HistoryEntry, 'lastRun'>): Promise<void> {
    await this.ensureConfigDir()

    const newEntry: HistoryEntry = {
      ...entry,
      lastRun: new Date().toISOString(),
    }

    const existingIndex = this.historyData.scripts.findIndex(
      (e) => e.name === entry.name && e.directory === entry.directory
    )

    if (existingIndex !== -1) {
      this.historyData.scripts[existingIndex] = newEntry
    } else {
      this.historyData.scripts.unshift(newEntry)
      this.truncateHistory()
    }

    await this.persist()
  }

  async clean(): Promise<void> {
    try {
      await fs.unlink(this.historyFile)
      this.historyData = { scripts: [] }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }

  getHistory(): HistoryEntry[] {
    return [...this.historyData.scripts]
  }

  hasHistory(name: string, directory: string): boolean {
    return this.historyData.scripts.some(
      (e) => e.name === name && e.directory === directory
    )
  }

  private truncateHistory(): void {
    const MAX_HISTORY_ENTRIES = 50
    if (this.historyData.scripts.length > MAX_HISTORY_ENTRIES) {
      this.historyData.scripts = this.historyData.scripts.slice(
        0,
        MAX_HISTORY_ENTRIES
      )
    }
  }

  private async ensureConfigDir(): Promise<void> {
    await fs.mkdir(path.dirname(this.historyFile), { recursive: true })
  }

  private async persist(): Promise<void> {
    await fs.writeFile(
      this.historyFile,
      JSON.stringify(this.historyData, null, 2),
      'utf-8'
    )
  }
}

describe('HistoryManager', () => {
  let historyManager: TestHistoryManager
  let testDir: string
  let historyFile: string

  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), 'test-rundo', '.local', 'share', 'rundo')
    historyFile = path.join(testDir, 'history.json')

    // Clean up any existing test directory
    try {
      await fs.rm(path.join(os.tmpdir(), 'test-rundo'), { recursive: true })
    } catch {
      // Directory doesn't exist, which is expected
    }

    // Create a fresh instance with test-specific path
    historyManager = new TestHistoryManager(historyFile)
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(path.join(os.tmpdir(), 'test-rundo'), { recursive: true })
    } catch {
      // Directory doesn't exist, which is expected
    }
  })

  describe('load', () => {
    it('should initialize with empty history when file does not exist', async () => {
      await historyManager.load()
      expect(historyManager.getHistory()).toEqual([])
    })

    it('should load existing history from file', async () => {
      const testData = {
        scripts: [
          {
            name: 'root:test',
            directory: '/test/dir',
            command: 'npm run test',
            lastRun: '2024-01-01T00:00:00.000Z',
          },
        ],
      }

      await fs.mkdir(testDir, { recursive: true })
      await fs.writeFile(historyFile, JSON.stringify(testData))

      await historyManager.load()
      expect(historyManager.getHistory()).toEqual(testData.scripts)
    })

    it('should reset history on corrupted file', async () => {
      await fs.mkdir(testDir, { recursive: true })
      await fs.writeFile(historyFile, 'invalid json')

      await historyManager.load()
      expect(historyManager.getHistory()).toEqual([])
    })
  })

  describe('save', () => {
    it('should save a new entry', async () => {
      await historyManager.save({
        name: 'root:build',
        directory: '/project',
        command: 'npm run build',
      })

      const history = historyManager.getHistory()
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        name: 'root:build',
        directory: '/project',
        command: 'npm run build',
      })
      expect(history[0].lastRun).toBeDefined()
    })

    it('should update existing entry instead of duplicating', async () => {
      await historyManager.save({
        name: 'root:build',
        directory: '/project',
        command: 'npm run build',
      })

      await new Promise((resolve) => globalThis.setTimeout(resolve, 10)) // Small delay

      await historyManager.save({
        name: 'root:build',
        directory: '/project',
        command: 'npm run build',
      })

      const history = historyManager.getHistory()
      expect(history).toHaveLength(1)
    })

    it('should truncate history when exceeding max entries', async () => {
      // Save 51 entries
      for (let i = 0; i < 51; i++) {
        await historyManager.save({
          name: `script:${i}`,
          directory: `/project${i}`,
          command: `npm run script${i}`,
        })
      }

      const history = historyManager.getHistory()
      expect(history).toHaveLength(50)
      expect(history[0].name).toBe('script:50') // Most recent
      expect(history[49].name).toBe('script:1') // Oldest kept
    })

    it('should persist history to file', async () => {
      await historyManager.save({
        name: 'root:test',
        directory: '/project',
        command: 'npm run test',
      })

      const fileContent = await fs.readFile(historyFile, 'utf-8')
      const data = JSON.parse(fileContent)
      expect(data.scripts).toHaveLength(1)
      expect(data.scripts[0].name).toBe('root:test')
    })
  })

  describe('clean', () => {
    it('should delete history file and clear memory', async () => {
      await historyManager.save({
        name: 'root:test',
        directory: '/project',
        command: 'npm run test',
      })

      await historyManager.clean()

      expect(historyManager.getHistory()).toEqual([])

      await expect(fs.access(historyFile)).rejects.toThrow()
    })

    it('should not throw when history file does not exist', async () => {
      await expect(historyManager.clean()).resolves.not.toThrow()
    })
  })

  describe('hasHistory', () => {
    it('should return true for existing entries', async () => {
      await historyManager.save({
        name: 'root:test',
        directory: '/project',
        command: 'npm run test',
      })

      expect(historyManager.hasHistory('root:test', '/project')).toBe(true)
    })

    it('should return false for non-existing entries', () => {
      expect(historyManager.hasHistory('root:test', '/project')).toBe(false)
    })
  })
})
