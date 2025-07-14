import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { HistoryEntry, HistoryData } from '../types'
import { executeScript } from '../executor/index'
import { PackageManager } from '../pm/index'
import inquirer from 'inquirer'
import autocomplete from 'inquirer-autocomplete-prompt'

inquirer.registerPrompt('autocomplete', autocomplete)

// Follow XDG Base Directory Specification
const DATA_DIR = process.env.XDG_DATA_HOME
  ? path.join(process.env.XDG_DATA_HOME, 'rundo')
  : path.join(os.homedir(), '.local', 'share', 'rundo')
const HISTORY_FILE = path.join(DATA_DIR, 'history.json')
const MAX_HISTORY_ENTRIES = 50

export class HistoryManager {
  private historyData: HistoryData = { scripts: [] }

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf-8')
      this.historyData = JSON.parse(data)
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error('Failed to load history, resetting:', error)
      }
      this.historyData = { scripts: [] }
    }
  }

  async save(entry: Omit<HistoryEntry, 'lastRun'>): Promise<void> {
    await this.ensureConfigDir()

    const newEntry: HistoryEntry = {
      ...entry,
      lastRun: new Date().toISOString(),
    }

    const existingIndex = this.historyData.scripts.findIndex(
      (e) => e.name === entry.name && e.directory === entry.directory
    )

    if (existingIndex !== -1) {
      this.historyData.scripts[existingIndex] = newEntry
    } else {
      this.historyData.scripts.unshift(newEntry)
      this.truncateHistory()
    }

    await this.persist()
  }

  async clean(): Promise<void> {
    try {
      await fs.unlink(HISTORY_FILE)
      this.historyData = { scripts: [] }
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error
      }
    }
  }

  getHistory(): HistoryEntry[] {
    return [...this.historyData.scripts]
  }

  hasHistory(name: string, directory: string): boolean {
    return this.historyData.scripts.some(
      (e) => e.name === name && e.directory === directory
    )
  }

  private truncateHistory(): void {
    if (this.historyData.scripts.length > MAX_HISTORY_ENTRIES) {
      this.historyData.scripts = this.historyData.scripts.slice(
        0,
        MAX_HISTORY_ENTRIES
      )
    }
  }

  private async ensureConfigDir(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }

  private async persist(): Promise<void> {
    await fs.writeFile(
      HISTORY_FILE,
      JSON.stringify(this.historyData, null, 2),
      'utf-8'
    )
  }
}

export const historyManager = new HistoryManager()

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

async function promptForHistoryEntry(
  history: HistoryEntry[]
): Promise<HistoryEntry | null> {
  const choices = history.map((entry) => {
    const lastRun = new Date(entry.lastRun)
    const relativeTime = getRelativeTime(lastRun)
    const directory = entry.directory.replace(process.env.HOME || '', '~')

    return {
      name: `${entry.name} (${directory}) - ${relativeTime}`,
      value: entry,
    }
  })

  try {
    const answer = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'entry',
        message: '🔍 Search history:',
        source: (_answersSoFar: any, input: string) => {
          if (!input) return Promise.resolve(choices)

          const searchTerms = input
            .toLowerCase()
            .split(/\s+/)
            .filter((term) => term.length > 0)
          const filtered = choices.filter((choice) => {
            const choiceName = choice.name.toLowerCase()
            return searchTerms.every((term) => choiceName.includes(term))
          })
          return Promise.resolve(filtered)
        },
        pageSize: 15,
      },
    ])

    return answer.entry
  } catch {
    // Handle Ctrl+C or other cancellation
    return null
  }
}

export async function displayHistory() {
  const history = historyManager.getHistory()

  if (history.length === 0) {
    console.log('📝 No command history found')
    return
  }

  const selectedEntry = await promptForHistoryEntry(history)

  if (!selectedEntry) {
    console.log('❌ No script selected')
    return
  }

  console.log(`🚀 Running: ${selectedEntry.name} (${selectedEntry.command})`)
  console.log(`📂 Directory: ${selectedEntry.directory}`)

  // Extract package manager and script from command
  const commandParts = selectedEntry.command.split(' ')
  const packageManager = commandParts[0] as PackageManager
  const script = commandParts.slice(2).join(' ') // Skip 'run' part

  await executeScript(
    packageManager,
    script,
    selectedEntry.directory,
    selectedEntry.name
  )
}
