import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VersionManager } from './version-manager'

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  unlinkSync: vi.fn(),
}))

// Mock os module
vi.mock('os', () => ({
  homedir: vi.fn(() => '/home/user'),
}))

// Mock fetch
global.fetch = vi.fn()

// Mock console.log
const originalConsoleLog = console.log
const mockConsoleLog = vi.fn()

describe('version check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(global.fetch).mockClear()
    console.log = mockConsoleLog
    mockConsoleLog.mockClear()
  })

  afterEach(() => {
    console.log = originalConsoleLog
  })

  describe('VersionManager.notifyIfUpdateAvailable', () => {
    it('should notify when update is available', async () => {
      const { existsSync, readFileSync } = await import('fs')

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('package.json')) return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (path.toString().includes('package.json')) {
          return JSON.stringify({ version: '1.0.0' })
        }
        return ''
      })

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: '1.0.1' }),
      } as Response)

      const versionManager = new VersionManager()
      await versionManager.notifyIfUpdateAvailable()

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Update available: 1.0.0 → 1.0.1')
      )
    })

    it('should not notify when no update is available', async () => {
      const { existsSync, readFileSync } = await import('fs')

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('package.json')) return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (path.toString().includes('package.json')) {
          return JSON.stringify({ version: '1.0.1' })
        }
        return ''
      })

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ version: '1.0.1' }),
      } as Response)

      const versionManager = new VersionManager()
      await versionManager.notifyIfUpdateAvailable()

      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should silently fail when fetch errors', async () => {
      const { existsSync, readFileSync } = await import('fs')

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('package.json')) return true
        return false
      })

      vi.mocked(readFileSync).mockImplementation((path) => {
        if (path.toString().includes('package.json')) {
          return JSON.stringify({ version: '1.0.0' })
        }
        return ''
      })

      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

      const versionManager = new VersionManager()
      await versionManager.notifyIfUpdateAvailable()

      expect(mockConsoleLog).not.toHaveBeenCalled()
    })
  })
})