import { execSync } from 'child_process'
import { PackageManager } from '@/infra/pm'
import type { HistoryManager } from '@/application/services/history-manager'

export async function executeScript(
  packageManager: PackageManager,
  script: string,
  directory: string,
  scriptName: string,
  historyManager?: HistoryManager
): Promise<void> {
  const command = `${packageManager} run ${script}`

  try {
    execSync(`cd "${directory}" && ${command}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    // Save to history after successful execution
    if (historyManager) {
      await historyManager.save({
        name: scriptName,
        directory,
        command,
      })
    }
  } catch {
    process.exit(1)
  }
}
