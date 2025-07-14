import { readFile } from 'fs/promises'
import { join } from 'path'

export interface RundoConfig {
  maxDepth?: number
  ignore?: string[]
  include?: string[]
}

const DEFAULT_CONFIG: RundoConfig = {
  maxDepth: 5,
  ignore: [
    // Node.js & frontend
    'node_modules',
    '.yarn',
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    '.output',
    '.svelte-kit',
    '.storybook-static',
    '.turbo',
    '.nx',

    // Infrastructure & deployment
    '.git',
    'vendor',
    'coverage',
    'tmp',
    'log',
    '.bundle',
    'storage',
    '.vercel',
    '.firebase',
    '.terraform',
    '.aws-sam',
    '.serverless',
    '.gradle',
    '.cache',
    'cdk.out',

    // Language specific
    'target', // Rust
    'obj', // C/C++
    'venv',
    '.venv',
    'env',
    '.env', // Python
    '.mypy_cache',
    '.pytest_cache',
    '__pycache__', // Python
    'bootstrap/cache', // Laravel
  ],
  include: [],
}

const CONFIG_FILES = ['.rundorc', '.rundorc.json', 'rundo.config.json']

export async function loadConfig(
  cwd: string = process.cwd()
): Promise<RundoConfig> {
  // Try to find config file
  for (const configFile of CONFIG_FILES) {
    try {
      const configPath = join(cwd, configFile)
      const content = await readFile(configPath, 'utf-8')
      const userConfig = JSON.parse(content)

      // Merge with defaults
      return mergeConfig(DEFAULT_CONFIG, userConfig)
    } catch {
      // Config file not found or invalid, continue
    }
  }

  return DEFAULT_CONFIG
}

function mergeConfig(
  defaultConfig: RundoConfig,
  userConfig: Partial<RundoConfig>
): RundoConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    // For arrays, replace completely if provided
    ignore: userConfig.ignore ?? defaultConfig.ignore,
    include: userConfig.include ?? defaultConfig.include,
  }
}

export { DEFAULT_CONFIG }
