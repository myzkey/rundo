import which from 'which'
import { existsSync } from 'fs'
import { join } from 'path'

export enum PackageManager {
  BUN = 'bun',
  PNPM = 'pnpm',
  YARN = 'yarn',
  NPM = 'npm',
}

export async function detectPackageManager(
  cwd: string = process.cwd()
): Promise<PackageManager> {
  // Lock file configurations
  const lockFileConfigs = [
    { file: 'bun.lockb', manager: PackageManager.BUN },
    { file: 'pnpm-lock.yaml', manager: PackageManager.PNPM },
    { file: 'yarn.lock', manager: PackageManager.YARN },
    { file: 'package-lock.json', manager: PackageManager.NPM },
  ]

  // Check for lock files in priority order
  for (const { file, manager } of lockFileConfigs) {
    if (existsSync(join(cwd, file))) {
      try {
        await which(manager)
        return manager
      } catch {
        throw new Error(
          `Found ${file} but ${manager} is not installed. Please install ${manager} or remove the lock file.`
        )
      }
    }
  }

  // If no lock files found, require explicit package manager specification
  throw new Error(
    'No lock file found. Please run your package manager install command first (npm install, yarn install, pnpm install, or bun install).'
  )
}
