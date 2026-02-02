import { type Rule } from 'eslint'

export const noLoops: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forbid standard loops (for, while, do-while) in ZEM.',
    },
    schema: [],
  },
  create(context: Rule.RuleContext) {
    return {
      ForStatement(node: any) {
        context.report({ node, message: 'Loops are forbidden in ZEM. Use functional iterators (map, reduce, filter) or the do pattern.' })
      },
      ForInStatement(node: any) {
        context.report({ node, message: 'For-in loops are forbidden in ZEM. Use Object.keys().forEach().' })
      },
      ForOfStatement(node: any) {
        context.report({ node, message: 'For-of loops are forbidden in ZEM. Use forEach().' })
      },
      WhileStatement(node: any) {
        context.report({ node, message: 'While loops are forbidden in ZEM. Use recursion or functional patterns.' })
      },
      DoWhileStatement(node: any) {
        context.report({ node, message: 'Do-while loops are forbidden in ZEM. Use functional patterns.' })
      },
    }
  },
}
