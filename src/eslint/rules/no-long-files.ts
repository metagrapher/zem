import { type Rule } from 'eslint'

export const noLongFiles: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce a maximum file length of 150 lines',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    max: {
                        type: 'number',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context: Rule.RuleContext) {
        const maxLines = context.options[0]?.max || 150
        const sourceCode = context.getSourceCode()
        const lineCount = sourceCode.getLines().length

        if (lineCount > maxLines) {
            context.report({
                loc: { line: 1, column: 0 },
                message: `File is too long (${lineCount} lines). Maximum allowed is ${maxLines} lines. Please refactor into smaller modules.`,
            })
        }

        return {}
    },
}
