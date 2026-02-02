import { type Rule } from 'eslint'

export const noAny: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid the use of "any" in ZEM for strict type safety.',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      TSAnyKeyword(node: unknown) {
        context.report({ node, message: 'The "any" type is forbidden in ZEM. Use "unknown" or define specific types.' })
      },
    }
  },
}
