#!/usr/bin/env node

import { detectPackageManager } from './pm';
import { collectScripts } from './scan';
import { promptForScript } from './prompt';
import { executeScript } from './executor';

async function main() {
  try {
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

    executeScript(
      packageManager,
      selectedScript.script,
      selectedScript.directory
    );
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
