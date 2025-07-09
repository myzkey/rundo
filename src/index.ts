#!/usr/bin/env node

import { detectPackageManager } from './pm';
import { collectScripts } from './scan';
import { promptForScript } from './prompt';
import { executeScript } from './executor';
import { historyManager } from './history/history.js';

async function main() {
  try {
    // Check for clean command
    if (process.argv[2] === 'clean') {
      await historyManager.clean();
      console.log('✅ History cleared');
      process.exit(0);
    }

    // Load history at startup
    await historyManager.load();

    // Default script runner behavior
    const [scripts, packageManager] = await Promise.all([
      collectScripts(),
      detectPackageManager(),
    ]);

    if (scripts.length === 0) {
      console.log('❌ No scripts found in any package.json files');
      process.exit(1);
    }

    console.log(`✅ Found ${scripts.length} scripts using ${packageManager}`);

    const selectedScript = await promptForScript(scripts);

    console.log(
      `🚀 Running: ${selectedScript.script} (${selectedScript.command})`
    );

    // Find the script name (e.g., "root:build") from the choices
    const scriptChoice = scripts.find(
      (s) =>
        s.value.script === selectedScript.script &&
        s.value.directory === selectedScript.directory
    );
    const scriptName = scriptChoice?.name || selectedScript.script;

    await executeScript(
      packageManager,
      selectedScript.script,
      selectedScript.directory,
      scriptName
    );
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
