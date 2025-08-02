import inquirer from 'inquirer'
import autocomplete from 'inquirer-autocomplete-prompt'
import { ScriptChoice } from '@/infra/scanner'

inquirer.registerPrompt('autocomplete', autocomplete)

export async function promptForScript(
  choices: ScriptChoice[]
): Promise<ScriptChoice['value']> {
  if (choices.length === 0) {
    throw new Error('No scripts found in any package.json files')
  }

  const choiceMap = choices.map((choice) => ({
    name: choice.name,
    value: choice.value,
  }))

  const answer = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'script',
      message: '🔍 Search script:',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      source: (_answersSoFar: any, input: string) => {
        if (!input) return Promise.resolve(choiceMap)

        const searchTerms = input
          .toLowerCase()
          .split(/\s+/)
          .filter((term) => term.length > 0)
        const filtered = choiceMap.filter((choice) => {
          const choiceName = choice.name.toLowerCase()
          return searchTerms.every((term) => choiceName.includes(term))
        })
        return Promise.resolve(filtered)
      },
      pageSize: 15,
    },
  ])

  return answer.script
}
