import { describe, it, expect, vi } from 'vitest';
import { parsePackageJson, collectScripts } from './index';
import { readFile } from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

// Mock fast-scan
vi.mock('./fast-scan', () => ({
  fastScanPackageJson: vi.fn(),
}));

// Mock config
vi.mock('../config', () => ({
  loadConfig: vi.fn(),
}));

describe('parsePackageJson', () => {
  it('should parse valid package.json', async () => {
    const mockPackageJson = {
      name: 'test-package',
      scripts: {
        build: 'tsc',
        test: 'vitest',
      },
    };

    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockPackageJson));

    const result = await parsePackageJson('/path/to/package.json');
    expect(result).toEqual(mockPackageJson);
  });

  it('should return null for invalid JSON', async () => {
    vi.mocked(readFile).mockResolvedValue('invalid json');

    const result = await parsePackageJson('/path/to/package.json');
    expect(result).toBeNull();
  });

  it('should return null when file read fails', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

    const result = await parsePackageJson('/path/to/package.json');
    expect(result).toBeNull();
  });
});

describe('collectScripts', () => {
  it('should collect scripts from multiple package.json files', async () => {
    const { fastScanPackageJson } = await import('./fast-scan');
    const { loadConfig } = await import('../config');

    vi.mocked(loadConfig).mockResolvedValue({
      ignore: [],
      include: [],
      maxDepth: 3,
    });

    vi.mocked(fastScanPackageJson).mockResolvedValue([
      '/project/package.json',
      '/project/apps/web/package.json',
    ]);

    vi.mocked(readFile)
      .mockResolvedValueOnce(
        JSON.stringify({
          name: 'root',
          scripts: { build: 'tsc', test: 'vitest' },
        })
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          name: 'web',
          scripts: { dev: 'vite', build: 'vite build' },
        })
      );

    const result = await collectScripts('/project');
    expect(result).toHaveLength(4);
    expect(result[0].name).toBe('apps/web:build');
    expect(result[1].name).toBe('apps/web:dev');
    expect(result[2].name).toBe('root:build');
    expect(result[3].name).toBe('root:test');
  });
});
