export interface HistoryEntry {
  name: string
  directory: string
  command: string
  lastRun: string
}

export interface HistoryData {
  scripts: HistoryEntry[]
}

export interface ScriptChoice {
  name: string
  value: {
    script: string
    command: string
    directory: string
  }
}

export interface RundoConfig {
  paths?: {
    exclude?: string[]
    include?: string[]
  }
  scan?: {
    depth?: number
  }
}
