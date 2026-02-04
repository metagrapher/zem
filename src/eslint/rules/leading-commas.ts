import { type Rule, type AST } from 'eslint'

/**
 * Enforce Comma-First spatial alignment.
 * Ported from the specialized JS implementation.
 * Follows ZEM: Zero Exception Method rules.
 */

interface CheckListOptions {
  minItems?: number
  parentIndent?: string
  wallOffset?: number
  isParams?: boolean
  isArgs?: boolean
  newlineFirst?: boolean
}

export const leadingCommas: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce Comma-First spatial alignment. Safe & Precise.' },
    fixable: 'whitespace',
    schema: [],
  },

  create(context: Rule.RuleContext) {
    const sourceCode = context.sourceCode || context.getSourceCode()

    const getIndent = (locOrNode: Rule.Node | AST.SourceLocation | AST.Token | null): string => {
      if (!locOrNode) return ''
      const loc = (locOrNode as any).loc || (locOrNode as AST.SourceLocation)
      if (!loc) return ''
      const lineIndex = loc.start.line - 1
      const line = sourceCode.lines[lineIndex]
      if (line === undefined) return ''
      const match = line.match(/^\s*/)
      return match ? match[0] : ''
    }

    const checkList = (
      node: Rule.Node
    , items: (Rule.Node | null)[]
    , openToken: AST.Token
    , closeToken: AST.Token
    , options: CheckListOptions = {}
    ): void => {
      // Filter out null items (sparse arrays)
      const validItems = items.filter((i): i is Rule.Node => i !== null)
      if (validItems.length === 0) return

      const isMultiline = openToken.loc.end.line !== closeToken.loc.start.line ||
                          validItems.some(i => i.loc && i.loc.start.line !== i.loc.end.line)
      
      const threshold = options.minItems ?? 4
      if (!isMultiline && validItems.length < threshold) return

      const parentBaseIndent = options.parentIndent !== undefined ? options.parentIndent : getIndent(openToken)
      const wallIndent = parentBaseIndent + ' '.repeat(options.wallOffset || 0)
      const firstItemIndent = wallIndent + (options.isParams || options.isArgs ? '  ' : '')

      // 1. First Item
      const first = validItems[0]
      if (first && first.range && openToken.range) {
        const textBefore = sourceCode.getText().substring(openToken.range[1], first.range[0])
        if (options.newlineFirst) {
          const exp = '\n' + firstItemIndent
          const normalizedText = textBefore.replace(/^[^\n]*\n/, '\n')
          if (normalizedText !== exp && textBefore !== exp) {
            context.report({
              node: first
            , message: 'Newline needed'
            , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], exp)
            })
          }
        } else {
          if (textBefore.includes('\n')) {
            const exp = '\n' + firstItemIndent
            const lastLine = textBefore.substring(textBefore.lastIndexOf('\n'))
            if (lastLine !== exp) {
              context.report({
                node: first
              , message: 'Indent mismatch'
                , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], exp)
              })
            }
          } else if (textBefore !== ' ' && textBefore !== ' \n' && textBefore !== '\n') {
            context.report({
              node: first
            , message: 'Pull-up required'
              , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], ' ')
            })
          }
        }
      }

      // 2. Subsequent Items
      // Using slice/forEach to avoid ZEM-forbidden for-loops
      validItems.slice(1).forEach((item, idx) => {
        const prev = validItems[idx] // idx corresponds to original current-1 because of slice(1)
        if (!item || !prev || !item.range || !prev.range) return

        const expected = '\n' + wallIndent + ', '
        const range: [number, number] = [prev.range[1], item.range[0]]
        if (sourceCode.getText().substring(range[0], range[1]) !== expected) {
          context.report({
            node: item
          , message: 'Wall mismatch'
          , fix: f => f.replaceTextRange(range, expected)
          })
        }
      })

      // 3. Trailing Comma
      const tokens = sourceCode.getTokensBetween(openToken, closeToken)
      tokens.forEach((token, idx) => {
        if (token.value === ',') {
          const nextToken = tokens[idx + 1] || closeToken
          if (nextToken === closeToken) {
            context.report({
              node: token
            , message: 'No trailing'
            , fix: f => f.remove(token)
            })
          }
        }
      })

      // 4. Closing token
      const last = validItems[validItems.length - 1]
      if (!last || !last.range || !closeToken.range) return
      const expectedClose = '\n' + parentBaseIndent
      const lastEnd = last.range[1]
      const closeStart = closeToken.range[0]
      if (sourceCode.getText().substring(lastEnd, closeStart) !== expectedClose) {
        context.report({
          node: closeToken
        , message: 'Close alignment'
        , fix: f => f.replaceTextRange([lastEnd, closeStart], expectedClose)
        })
      }
    }

    const ensureSplit = (node: Rule.Node, markerNode: Rule.Node, offset = 0): number => {
      const openToken = sourceCode.getFirstToken(node)
      if (!openToken) return 0
      const tokenBefore = sourceCode.getTokenBefore(openToken)
      if (!tokenBefore) return 0
      const textBefore = sourceCode.getText().substring(tokenBefore.range[1], openToken.range[0])
      
      const indent = getIndent(markerNode)
      if (textBefore.includes('\n')) {
        const expected = '\n' + indent + ' '.repeat(offset)
        if (textBefore !== expected) {
          context.report({
            node: openToken
          , message: 'Split indent'
          , fix: f => f.replaceTextRange([tokenBefore.range[1], openToken.range[0]], expected)
          })
        }
      }
      return indent.length + offset
    }

    const checkFunc = (node: Rule.Node): void => {
      const isArrow = node.type === 'ArrowFunctionExpression'
      let open: AST.Token | undefined
      let close: AST.Token | undefined
      
      if (isArrow) {
        // ArrowFunctionExpression body can be a block or an expression
        const arrowBody = (node as any).body
        const tokens = sourceCode.getTokensBefore(arrowBody)
        // Find the last set of parens before the arrow body
        open = [...tokens].reverse().find(t => t.value === '(')
        close = [...tokens].reverse().find(t => t.value === ')')
      } else {
        const id = (node as any).id
        const body = (node as any).body
        const tokens = sourceCode.getTokensBetween(id || node, body)
        open = tokens.find(t => t.value === '(')
        close = tokens.find(t => t.value === ')')
      }
      
      const params = (node as any).params as Rule.Node[]
      if (open && close && params.length > 0) {
        checkList(node, params, open, close, { 
          isParams: true
        , newlineFirst: true
        , parentIndent: getIndent(node)
        , wallOffset: 2
        , minItems: 4 
        })
      }
      
      if (!isArrow) {
        const body = (node as any).body
        const brace = sourceCode.getFirstToken(body)
        if (brace && close) {
          const text = sourceCode.getText().substring(close.range[1], brace.range[0])
          if (text !== ' ') {
            context.report({
              node: body
            , message: 'Space before {'
            , fix: f => f.replaceTextRange([close.range[1], brace.range[0]], ' ')
            })
          }
        }
      }
    }

    return {
      ObjectExpression(node: Rule.Node & { properties: any[] }) {
        const open = sourceCode.getFirstToken(node)
        const close = sourceCode.getLastToken(node)
        if (!open || !close || !open.range || !close.range) return
        
        const p = node.parent
        if (!p) return

        let baseIndent = getIndent(open)
        let wallOffset = 0

        if (p.type === 'VariableDeclarator') {
          ensureSplit(node, p.parent as Rule.Node, 0)
        } else if (p.type === 'Property') {
          const property = p as any
          const splitCol = ensureSplit(node, property.key as Rule.Node, 2)
          const tokenBeforeOpen = sourceCode.getTokenBefore(open)
          if (tokenBeforeOpen && tokenBeforeOpen.loc.end.line !== open.loc.start.line) {
            baseIndent = ' '.repeat(splitCol)
            wallOffset = 0
          } else {
            baseIndent = getIndent(property.key as Rule.Node)
            wallOffset = 2
          }
        } else if (p.type === 'AssignmentPattern') {
          ensureSplit(node, (p as any).left as Rule.Node, 2)
        } else if (p.type === 'AssignmentExpression') {
          ensureSplit(node, (p as any).left as Rule.Node, 0)
        }
        
        // Array parent: strict alignment with the opening brace column + 2
        if (p.type === 'ArrayExpression') {
          wallOffset = 2
          baseIndent = ' '.repeat(open.loc.start.column)
        }
        
        checkList(node, node.properties, open, close, { 
          newlineFirst: false
        , wallOffset: wallOffset
        , minItems: 4
        , parentIndent: baseIndent 
        })
      },

      ArrayExpression(node: Rule.Node & { elements: any[] }) {
        const open = sourceCode.getFirstToken(node)
        const close = sourceCode.getLastToken(node)
        if (!open || !close || !open.range || !close.range) return
        
        const p = node.parent
        if (!p) return

        let baseIndent = getIndent(open)
        let wallOffset = 0

        if (p.type === 'VariableDeclarator') {
          ensureSplit(node, p.parent as Rule.Node, 0)
        } else if (p.type === 'Property') {
          const property = p as any
          const splitCol = ensureSplit(node, property.key as Rule.Node, 2)
          const tokenBeforeOpen = sourceCode.getTokenBefore(open)
          if (tokenBeforeOpen && tokenBeforeOpen.loc.end.line !== open.loc.start.line) {
            baseIndent = ' '.repeat(splitCol)
            wallOffset = 0
          } else {
            baseIndent = getIndent(property.key as Rule.Node)
            wallOffset = 2
          }
        } else if (p.type === 'AssignmentExpression') {
          ensureSplit(node, (p as any).left as Rule.Node, 0)
        }
        
        checkList(node, node.elements, open, close, { 
          wallOffset: wallOffset
        , newlineFirst: false
        , minItems: 4
        , parentIndent: baseIndent 
        })
      },

      CallExpression(node: Rule.Node & { callee: any, arguments: any[] }) {
        const open = sourceCode.getTokenAfter(node.callee)
        const close = sourceCode.getLastToken(node)
        if (open && open.value === '(' && close) {
          checkList(node, node.arguments, open, close, { 
            wallOffset: 2
          , newlineFirst: false
          , minItems: 4
          , isArgs: true 
          })
        }
      },

      FunctionDeclaration: checkFunc,
      FunctionExpression: checkFunc,
      ArrowFunctionExpression: checkFunc,
    }
  },
}
