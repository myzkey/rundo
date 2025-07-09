import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { HistoryEntry, HistoryData } from '../types.js';

// Follow XDG Base Directory Specification
const DATA_DIR = process.env.XDG_DATA_HOME
  ? path.join(process.env.XDG_DATA_HOME, 'rundo')
  : path.join(os.homedir(), '.local', 'share', 'rundo');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const MAX_HISTORY_ENTRIES = 50;

export class HistoryManager {
  private historyData: HistoryData = { scripts: [] };

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(HISTORY_FILE, 'utf-8');
      this.historyData = JSON.parse(data);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        console.error('Failed to load history, resetting:', error);
      }
      this.historyData = { scripts: [] };
    }
  }

  async save(entry: Omit<HistoryEntry, 'lastRun'>): Promise<void> {
    await this.ensureConfigDir();

    const newEntry: HistoryEntry = {
      ...entry,
      lastRun: new Date().toISOString(),
    };

    const existingIndex = this.historyData.scripts.findIndex(
      (e) => e.name === entry.name && e.directory === entry.directory
    );

    if (existingIndex !== -1) {
      this.historyData.scripts[existingIndex] = newEntry;
    } else {
      this.historyData.scripts.unshift(newEntry);
      this.truncateHistory();
    }

    await this.persist();
  }

  async clean(): Promise<void> {
    try {
      await fs.unlink(HISTORY_FILE);
      this.historyData = { scripts: [] };
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getHistory(): HistoryEntry[] {
    return [...this.historyData.scripts];
  }

  hasHistory(name: string, directory: string): boolean {
    return this.historyData.scripts.some(
      (e) => e.name === name && e.directory === directory
    );
  }

  private truncateHistory(): void {
    if (this.historyData.scripts.length > MAX_HISTORY_ENTRIES) {
      this.historyData.scripts = this.historyData.scripts.slice(
        0,
        MAX_HISTORY_ENTRIES
      );
    }
  }

  private async ensureConfigDir(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  private async persist(): Promise<void> {
    await fs.writeFile(
      HISTORY_FILE,
      JSON.stringify(this.historyData, null, 2),
      'utf-8'
    );
  }
}

export const historyManager = new HistoryManager();
