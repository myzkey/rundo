import { execSync } from 'child_process';
import { PackageManager } from '../pm';

export function executeScript(
  packageManager: PackageManager,
  script: string,
  directory: string
): void {
  const command = `cd "${directory}" && ${packageManager} run ${script}`;

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch {
    process.exit(1);
  }
}
