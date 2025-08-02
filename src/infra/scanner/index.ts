import { readFile } from 'fs/promises'
import { relative, dirname } from 'path'
import { fastScanPackageJson } from './fast-scan'
import { loadConfig, RundoConfig } from '@/domain/config'
import type { HistoryManager } from '@/application/services/history-manager'

export interface PackageJson {
  name?: string
  scripts?: Record<string, string>
}

export interface ScriptChoice {
  name: string
  value: {
    script: string
    command: string
    directory: string
  }
}

export async function scanPackageJsonFiles(
  cwd: string = process.cwd(),
  config?: RundoConfig
): Promise<string[]> {
  const actualConfig = config || (await loadConfig(cwd))
  return await fastScanPackageJson(cwd, actualConfig)
}

export async function parsePackageJson(
  filePath: string
): Promise<PackageJson | null> {
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function collectScripts(
  cwd: string = process.cwd(),
  historyManager?: HistoryManager
): Promise<ScriptChoice[]> {
  const config = await loadConfig(cwd)

  const packageJsonFiles = await scanPackageJsonFiles(cwd, config)

  // Parse all package.json files in parallel
  const packageJsonPromises = packageJsonFiles.map(async (filePath) => {
    const packageJson = await parsePackageJson(filePath)
    if (!packageJson?.scripts) return null

    const directory = dirname(filePath)
    const relativePath = relative(cwd, directory)
    const prefix = relativePath === '' ? 'root' : relativePath

    return {
      filePath,
      directory,
      prefix,
      scripts: packageJson.scripts,
    }
  })

  const packageJsonResults = await Promise.all(packageJsonPromises)

  const choices: ScriptChoice[] = []

  // Build choices from parsed results
  for (const result of packageJsonResults) {
    if (!result) continue

    for (const [scriptName, scriptCommand] of Object.entries(result.scripts)) {
      choices.push({
        name: `${result.prefix}:${scriptName}`,
        value: {
          script: scriptName,
          command: scriptCommand,
          directory: result.directory,
        },
      })
    }
  }

  // Sort choices: history items first (by last run time), then alphabetically
  const history = historyManager ? historyManager.getHistory() : []
  const historyMap = new Map(
    history.map((h) => [`${h.name}:${h.directory}`, h])
  )

  const sortedChoices = choices.sort((a, b) => {
    const aKey = `${a.name}:${a.value.directory}`
    const bKey = `${b.name}:${b.value.directory}`
    const aHistory = historyMap.get(aKey)
    const bHistory = historyMap.get(bKey)

    // Both have history: sort by last run time (most recent first)
    if (aHistory && bHistory) {
      return (
        new Date(bHistory.lastRun).getTime() -
        new Date(aHistory.lastRun).getTime()
      )
    }

    // Only a has history: a comes first
    if (aHistory && !bHistory) return -1

    // Only b has history: b comes first
    if (!aHistory && bHistory) return 1

    // Neither has history: sort alphabetically
    return a.name.localeCompare(b.name)
  })

  return sortedChoices
}
