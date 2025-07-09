declare module 'inquirer-autocomplete-prompt' {
  import { PromptConstructor } from 'inquirer';
  const autocomplete: PromptConstructor;
  export default autocomplete;
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
