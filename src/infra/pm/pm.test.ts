import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectPackageManager, PackageManager } from './index'

// Mock the which function
vi.mock('which', () => ({
  default: vi.fn(),
}))

// Mock the fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
}))

// Mock the path module
vi.mock('path', () => ({
  join: vi.fn((...args) => {
    const result = args.join('/')
    // Handle double slashes
    return result.replace(/\/+/g, '/')
  }),
  dirname: vi.fn((path) => {
    const parts = path.split('/').filter(Boolean)
    if (parts.length <= 1) return '/'
    return '/' + parts.slice(0, -1).join('/')
  }),
  resolve: vi.fn((path) => {
    if (path === '/') return '/'
    return path.startsWith('/') ? path : `/${path}`
  }),
}))

describe('detectPackageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('lock file based detection', () => {
    it('should detect bun when bun.lockb exists and bun is available', async () => {
      const { existsSync } = await import('fs')
      const { default: which } = await import('which')

      vi.mocked(existsSync).mockImplementation((path) =>
        path.toString().endsWith('bun.lockb')
      )
      vi.mocked(which).mockImplementation(async (cmd) => {
        if (cmd === 'bun') return '/path/to/bun'
        throw new Error('not found')
      })

      const result = await detectPackageManager('/test/dir')
      expect(result).toBe(PackageManager.BUN)
    })

    it('should detect pnpm when pnpm-lock.yaml exists and pnpm is available', async () => {
      const { existsSync } = await import('fs')
      const { default: which } = await import('which')

      vi.mocked(existsSync).mockImplementation((path) =>
        path.toString().endsWith('pnpm-lock.yaml')
      )
      vi.mocked(which).mockImplementation(async (cmd) => {
        if (cmd === 'pnpm') return '/path/to/pnpm'
        throw new Error('not found')
      })

      const result = await detectPackageManager('/test/dir')
      expect(result).toBe(PackageManager.PNPM)
    })

    it('should detect yarn when yarn.lock exists and yarn is available', async () => {
      const { existsSync } = await import('fs')
      const { default: which } = await import('which')

      vi.mocked(existsSync).mockImplementation((path) =>
        path.toString().endsWith('yarn.lock')
      )
      vi.mocked(which).mockImplementation(async (cmd) => {
        if (cmd === 'yarn') return '/path/to/yarn'
        throw new Error('not found')
      })

      const result = await detectPackageManager('/test/dir')
      expect(result).toBe(PackageManager.YARN)
    })

    it('should detect npm when package-lock.json exists and npm is available', async () => {
      const { existsSync } = await import('fs')
      const { default: which } = await import('which')

      vi.mocked(existsSync).mockImplementation((path) =>
        path.toString().endsWith('package-lock.json')
      )
      vi.mocked(which).mockImplementation(async (cmd) => {
        if (cmd === 'npm') return '/path/to/npm'
        throw new Error('not found')
      })

      const result = await detectPackageManager('/test/dir')
      expect(result).toBe(PackageManager.NPM)
    })

    it('should throw error when lock file manager is not available', async () => {
      const { existsSync } = await import('fs')
      const { default: which } = await import('which')

      vi.mocked(existsSync).mockImplementation((path) =>
        path.toString().endsWith('pnpm-lock.yaml')
      )
      vi.mocked(which).mockImplementation(async () => {
        throw new Error('not found')
      })

      await expect(detectPackageManager('/test/dir')).rejects.toThrow(
        'Found pnpm-lock.yaml in /test/dir but pnpm is not installed. Please install pnpm or remove the lock file.'
      )
    })
  })

  describe('parent directory search', () => {
    it('should find lock file in parent directory', async () => {
      const { existsSync } = await import('fs')
      const { default: which } = await import('which')

      // Mock existsSync to return false for child directory, true for parent
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = path.toString()
        return (
          pathStr === '/test/pnpm-lock.yaml' &&
          pathStr.includes('pnpm-lock.yaml')
        )
      })

      vi.mocked(which).mockImplementation(async (cmd) => {
        if (cmd === 'pnpm') return '/path/to/pnpm'
        throw new Error('not found')
      })

      const result = await detectPackageManager('/test/child/dir')
      expect(result).toBe(PackageManager.PNPM)
    })

    it('should find lock file in grandparent directory', async () => {
      const { existsSync } = await import('fs')
      const { default: which } = await import('which')

      // Mock existsSync to simulate finding yarn.lock only in the root directory
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = path.toString()
        // Return true only when checking for yarn.lock in the root directory
        return pathStr === '/yarn.lock'
      })

      vi.mocked(which).mockImplementation(async (cmd) => {
        if (cmd === 'yarn') return '/path/to/yarn'
        throw new Error('not found')
      })

      const result = await detectPackageManager('/child/grandchild/dir')
      expect(result).toBe(PackageManager.YARN)
    })
  })

  describe('no lock files found', () => {
    beforeEach(async () => {
      const { existsSync } = await import('fs')
      vi.mocked(existsSync).mockReturnValue(false)
    })

    it('should throw error when no lock files are found', async () => {
      await expect(detectPackageManager()).rejects.toThrow(
        'No lock file found. Please run your package manager install command first (npm install, yarn install, pnpm install, or bun install).'
      )
    })
  })
})
