#!/usr/bin/env node

import {
  detectPackageManager,
  detectPackageManagerForDirectory,
} from '@/infra/pm'
import { collectScripts } from '@/infra/scanner'
import { promptForScript } from '@/presentation/prompt'
import { executeScript } from '@/infra/executor'
import { HistoryManager } from '@/application/services/history-manager'
import { displayHelp } from '@/presentation/help'
import { VersionManager } from '@/application/services/version-manager'

async function main() {
  try {
    // Check for updates in background (non-blocking)
    const versionManager = new VersionManager()
    versionManager.notifyIfUpdateAvailable().catch(() => {
      // Silently ignore update check failures
    })

    // Create history manager instance
    const historyManager = new HistoryManager()

    const arg = process.argv[2]

    // Check for help command
    if (arg === '-h' || arg === '--help') {
      displayHelp()
      process.exit(0)
    }

    // Check for clean command
    if (arg === 'clean') {
      await historyManager.clean()
      console.log('✅ History cleared')
      process.exit(0)
    }

    // Check for history command
    if (arg === 'history') {
      await historyManager.load()
      await historyManager.displayHistory()
      process.exit(0)
    }

    // Load history at startup
    await historyManager.load()

    // Default script runner behavior
    const scripts = await collectScripts(process.cwd(), historyManager)

    if (scripts.length === 0) {
      console.log('❌ No scripts found in any package.json files')
      process.exit(1)
    }

    // Detect initial package manager for display purposes
    const initialPackageManager = await detectPackageManager().catch(
      () => 'npm'
    )
    console.log(
      `✅ Found ${scripts.length} scripts using ${initialPackageManager}`
    )

    const selectedScript = await promptForScript(scripts)

    // Detect package manager for the specific script directory
    const scriptPackageManager = await detectPackageManagerForDirectory(
      selectedScript.directory
    )

    console.log(
      `🚀 Running: ${selectedScript.script} (${selectedScript.command}) using ${scriptPackageManager}`
    )

    // Find the script name (e.g., "root:build") from the choices
    const scriptChoice = scripts.find(
      (s) =>
        s.value.script === selectedScript.script &&
        s.value.directory === selectedScript.directory
    )
    const scriptName = scriptChoice?.name || selectedScript.script

    await executeScript(
      scriptPackageManager,
      selectedScript.script,
      selectedScript.directory,
      scriptName,
      historyManager
    )
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
