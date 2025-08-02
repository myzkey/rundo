import which from 'which'
import { existsSync } from 'fs'
import { join, dirname, resolve } from 'path'

export enum PackageManager {
  BUN = 'bun',
  PNPM = 'pnpm',
  YARN = 'yarn',
  NPM = 'npm',
}

function findLockFileInParentDirectories(
  startDir: string
): { file: string; manager: PackageManager; directory: string } | null {
  const lockFileConfigs = [
    { file: 'bun.lockb', manager: PackageManager.BUN },
    { file: 'pnpm-lock.yaml', manager: PackageManager.PNPM },
    { file: 'yarn.lock', manager: PackageManager.YARN },
    { file: 'package-lock.json', manager: PackageManager.NPM },
  ]

  let currentDir = resolve(startDir)
  const root = resolve('/')

  while (true) {
    for (const { file, manager } of lockFileConfigs) {
      const lockFilePath = join(currentDir, file)
      if (existsSync(lockFilePath)) {
        return { file, manager, directory: currentDir }
      }
    }
    if (currentDir === root) break
    const parentDir = dirname(currentDir)
    if (parentDir === currentDir) break
    currentDir = parentDir
  }

  return null
}

export async function detectPackageManager(
  cwd: string = process.cwd()
): Promise<PackageManager> {
  const lockFileInfo = findLockFileInParentDirectories(cwd)

  if (lockFileInfo) {
    try {
      await which(lockFileInfo.manager)
      return lockFileInfo.manager
    } catch {
      throw new Error(
        `Found ${lockFileInfo.file} in ${lockFileInfo.directory} but ${lockFileInfo.manager} is not installed. Please install ${lockFileInfo.manager} or remove the lock file.`
      )
    }
  }

  // If no lock files found, require explicit package manager specification
  throw new Error(
    'No lock file found. Please run your package manager install command first (npm install, yarn install, pnpm install, or bun install).'
  )
}

export async function detectPackageManagerForDirectory(
  directory: string
): Promise<PackageManager> {
  return detectPackageManager(directory)
}
