import { describe, it, expect, vi } from 'vitest';
import { promptForScript } from './index';
import { ScriptChoice } from '../scan';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    registerPrompt: vi.fn(),
    prompt: vi.fn(),
  },
}));

// Mock inquirer-autocomplete-prompt
vi.mock('inquirer-autocomplete-prompt', () => ({
  default: vi.fn(),
}));

describe('promptForScript', () => {
  const mockChoices: ScriptChoice[] = [
    {
      name: 'root:build',
      value: { script: 'build', command: 'tsc', directory: '/project' },
    },
    {
      name: 'apps/web:dev',
      value: {
        script: 'dev',
        command: 'vite dev',
        directory: '/project/apps/web',
      },
    },
    {
      name: 'packages/ui:test',
      value: {
        script: 'test',
        command: 'vitest run',
        directory: '/project/packages/ui',
      },
    },
  ];

  it('should throw error when no scripts found', async () => {
    await expect(promptForScript([])).rejects.toThrow(
      'No scripts found in any package.json files'
    );
  });

  it('should return selected script', async () => {
    const inquirer = await import('inquirer');
    vi.mocked(inquirer.default.prompt).mockResolvedValue({
      script: mockChoices[0].value,
    });

    const result = await promptForScript(mockChoices);
    expect(result).toEqual(mockChoices[0].value);
  });
});
