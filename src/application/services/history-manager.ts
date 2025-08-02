import type { HistoryEntry, HistoryData } from '@/domain/types'
import { executeScript } from '@/infra/executor'
import { PackageManager } from '@/infra/pm'
import inquirer from 'inquirer'
import autocomplete from 'inquirer-autocomplete-prompt'
import { FileCacheClient } from '@/infra/cache'

inquirer.registerPrompt('autocomplete', autocomplete)

const MAX_HISTORY_ENTRIES = 50

export class HistoryManager {
  private historyData: HistoryData = { scripts: [] }
  private historyCache: FileCacheClient<HistoryData>

  constructor() {
    this.historyCache = new FileCacheClient<HistoryData>('history')
  }

  public async load(): Promise<void> {
    try {
      const data = await this.historyCache.get('data')
      if (data) {
        this.historyData = data
      } else {
        this.historyData = { scripts: [] }
      }
    } catch (error) {
      console.error('Failed to load history, resetting:', error)
      this.historyData = { scripts: [] }
    }
  }

  public async save(entry: Omit<HistoryEntry, 'lastRun'>): Promise<void> {
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

  public async clean(): Promise<void> {
    await this.historyCache.delete('data')
    this.historyData = { scripts: [] }
  }

  public getHistory(): HistoryEntry[] {
    return [...this.historyData.scripts]
  }

  public hasHistory(name: string, directory: string): boolean {
    return this.historyData.scripts.some(
      (e) => e.name === name && e.directory === directory
    )
  }

  public async displayHistory(): Promise<void> {
    const history = this.getHistory()

    if (history.length === 0) {
      console.log('📝 No command history found')
      return
    }

    const selectedEntry = await this.promptForHistoryEntry(history)

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

  private truncateHistory(): void {
    if (this.historyData.scripts.length > MAX_HISTORY_ENTRIES) {
      this.historyData.scripts = this.historyData.scripts.slice(
        0,
        MAX_HISTORY_ENTRIES
      )
    }
  }

  private async persist(): Promise<void> {
    await this.historyCache.set('data', this.historyData)
  }

  private async promptForHistoryEntry(
    history: HistoryEntry[]
  ): Promise<HistoryEntry | null> {
    const choices = history.map((entry) => {
      const lastRun = new Date(entry.lastRun)
      const relativeTime = this.getRelativeTime(lastRun)
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  private getRelativeTime(date: Date): string {
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
}
