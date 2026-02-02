import { type Rule } from 'eslint'

export const leadingCommas: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce leading commas in arrays and objects',
    },
    fixable: 'whitespace',
    schema: [],
  },
  create(context: Rule.RuleContext) {
    const sourceCode = context.getSourceCode()

    function checkCommas(node: Rule.Node) {
      const elementsOrProps =
        node.type === 'ArrayExpression' ? (node as unknown as { elements: (Rule.Node | null)[] }).elements :
          node.type === 'ObjectExpression' ? (node as unknown as { properties: Rule.Node[] }).properties :
            []

      if (!elementsOrProps || elementsOrProps.length === 0) return

      // Use functional methods instead of loops (ZEM Rule 0)
      elementsOrProps.forEach((item: unknown, i: number) => {
        const elementOrProp = item as Rule.Node | null
        if (i === 0 || !elementOrProp) return

        const previousItem = elementsOrProps[i - 1]
        const previousElementOrProp = previousItem as Rule.Node | null
        if (!previousElementOrProp || !elementOrProp.range || !previousElementOrProp.range) return

        const previousEnd = previousElementOrProp.range[1]
        const currentStart = elementOrProp.range[0]
        const leadingText = sourceCode.getText().substring(previousEnd, currentStart).trim()

        if (leadingText.indexOf(',') !== 0) {
          context.report({
            node: elementOrProp,
            message: 'Expected a leading comma',
            fix(fixer: Rule.RuleFixer) {
              return fixer.insertTextBefore(elementOrProp, ', ')
            },
          })
        }
      })
    }

    return {
      ArrayExpression: checkCommas,
      ObjectExpression: checkCommas,
    }
  },
}
