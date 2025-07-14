export function displayHelp() {
  console.log(`
📖 Rundo - Interactive npm script runner
`)
  console.log('Usage:')
  console.log('  rundo                Run interactive script selector')
  console.log('  rundo history        Browse and run from command history')
  console.log('  rundo clean          Clear command history')
  console.log('')
  console.log('Options:')
  console.log('  -h, --help           Show this help message\n')
  console.log('Features:')
  console.log('  • Auto-detects package manager (bun → pnpm → yarn → npm)')
  console.log('  • Fuzzy search for scripts across monorepo/workspace')
  console.log('  • Command history with search and quick re-execution')
  console.log('  • Respects .rdrc, .rundorc, and rundo.config.json files')
  console.log('')
  console.log('Repository: https://github.com/myzkey/rundo\n')
}
