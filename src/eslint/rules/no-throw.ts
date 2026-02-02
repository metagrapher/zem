import { type Rule } from 'eslint'

export const noThrow: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid throw statements in ZEM. Use Result<T, E> patterns.',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      ThrowStatement(node: any) {
        context.report({ node, message: 'Throwing is forbidden in ZEM. Use Ok(value) / Err(error) to handle failures.' })
      },
    }
  },
}
