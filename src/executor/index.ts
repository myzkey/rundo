import { execSync } from 'child_process'
import { PackageManager } from '../pm'
import { historyManager } from '../history/history.js'

export async function executeScript(
  packageManager: PackageManager,
  script: string,
  directory: string,
  scriptName: string
): Promise<void> {
  const command = `${packageManager} run ${script}`

  try {
    execSync(`cd "${directory}" && ${command}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    // Save to history after successful execution
    await historyManager.save({
      name: scriptName,
      directory,
      command,
    })
  } catch {
    process.exit(1)
  }
}
