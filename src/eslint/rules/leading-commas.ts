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

    interface NodeWithRange {
      range: [number, number]
    }

    function checkCommas(node: { elements?: NodeWithRange[]; properties?: NodeWithRange[] }) {
      const elementsOrProps = node.elements || node.properties
      if (!elementsOrProps || elementsOrProps.length === 0) return

      // Use functional methods instead of loops (ZEM Rule 0)
      elementsOrProps.forEach((elementOrProp: NodeWithRange, i: number) => {
        if (i === 0) return

        const previousElementOrProp = elementsOrProps[i - 1]
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
