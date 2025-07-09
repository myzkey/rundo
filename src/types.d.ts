import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';

export interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
}

export interface ScriptInfo {
  name: string;
  script: string;
  directory: string;
  command: string;
}

export interface HistoryEntry {
  name: string;
  directory: string;
  command: string;
  lastRun: string;
}

export interface HistoryData {
  scripts: HistoryEntry[];
}

// Type declaration for inquirer-autocomplete-prompt
declare module 'inquirer-autocomplete-prompt' {
  import { QuestionCollection } from 'inquirer';

  interface AutocompleteQuestion {
    type: 'autocomplete';
    name: string;
    message: string;
    source: (answersSoFar: any, input: string) => Promise<any[]>;
    pageSize?: number;
  }

  const autocomplete: any;
  export = autocomplete;
}
