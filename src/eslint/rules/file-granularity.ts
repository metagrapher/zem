import { type Rule } from 'eslint'

export const fileGranularity: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Warn when files exceed threshold to encourage atomicity',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    threshold: {
                        type: 'number',
                    },
                    max: {
                        type: 'number',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context: Rule.RuleContext) {
        const threshold = context.options[0]?.threshold || 40
        const max = context.options[0]?.max || 75
        const sourceCode = context.getSourceCode()
        const lineCount = sourceCode.getLines().length

        if (lineCount > threshold && lineCount <= max) {
            context.report({
                loc: { line: 1, column: 0 },
                message: `File has ${lineCount} lines. Consider refactoring to stay under ${threshold} lines for better atomicity.`,
            })
        }

        return {}
    },
}
