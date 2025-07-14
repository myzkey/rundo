import { describe, it, expect, vi } from 'vitest'
import { detectPackageManager, PackageManager } from './index'

// Mock the which function
vi.mock('which', () => ({
  default: vi.fn(),
}))

describe('detectPackageManager', () => {
  it('should detect bun when available', async () => {
    const { default: which } = await import('which')
    vi.mocked(which).mockImplementation(async (cmd) => {
      if (cmd === 'bun') return '/path/to/bun'
      throw new Error('not found')
    })

    const result = await detectPackageManager()
    expect(result).toBe(PackageManager.BUN)
  })

  it('should detect pnpm when bun is not available', async () => {
    const { default: which } = await import('which')
    vi.mocked(which).mockImplementation(async (cmd) => {
      if (cmd === 'pnpm') return '/path/to/pnpm'
      throw new Error('not found')
    })

    const result = await detectPackageManager()
    expect(result).toBe(PackageManager.PNPM)
  })

  it('should detect yarn when bun and pnpm are not available', async () => {
    const { default: which } = await import('which')
    vi.mocked(which).mockImplementation(async (cmd) => {
      if (cmd === 'yarn') return '/path/to/yarn'
      throw new Error('not found')
    })

    const result = await detectPackageManager()
    expect(result).toBe(PackageManager.YARN)
  })

  it('should fall back to npm when no other package manager is found', async () => {
    const { default: which } = await import('which')
    vi.mocked(which).mockImplementation(async () => {
      throw new Error('not found')
    })

    const result = await detectPackageManager()
    expect(result).toBe(PackageManager.NPM)
  })
})
