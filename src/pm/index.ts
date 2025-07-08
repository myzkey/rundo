import which from 'which';

export enum PackageManager {
  BUN = 'bun',
  PNPM = 'pnpm',
  YARN = 'yarn',
  NPM = 'npm',
}

export async function detectPackageManager(): Promise<PackageManager> {
  const managers = [
    PackageManager.BUN,
    PackageManager.PNPM,
    PackageManager.YARN,
    PackageManager.NPM,
  ];

  for (const manager of managers) {
    try {
      await which(manager);
      return manager;
    } catch {
      continue;
    }
  }

  return PackageManager.NPM;
}
