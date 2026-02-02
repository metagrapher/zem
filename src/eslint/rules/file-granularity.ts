import { type Rule } from 'eslint'

export const fileGranularity: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Warn when files exceed 40 lines to encourage atomicity',
        },
        schema: [],
    },
    create(context: Rule.RuleContext) {
        const sourceCode = context.getSourceCode()
        const lineCount = sourceCode.getLines().length

        if (lineCount > 40 && lineCount <= 75) {
            context.report({
                loc: { line: 1, column: 0 },
                message: `File has ${lineCount} lines. Consider refactoring to stay under 40 lines for better atomicity.`,
            })
        }

        return {}
    },
}
