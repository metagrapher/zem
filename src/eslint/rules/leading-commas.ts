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
  isParams?: boolean | undefined
  isArgs?: boolean | undefined
  newlineFirst?: boolean | undefined
  wallColumn?: number | undefined
  closeIndent?: number | undefined // Added to distinguish from wall
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

    const getIndentSize = (locOrNode: Rule.Node | AST.SourceLocation | AST.Token | null): number => {
      if (!locOrNode) return 0
      const loc = (locOrNode as any).loc || (locOrNode as AST.SourceLocation)
      if (!loc) return 0
      const lineIndex = loc.start.line - 1
      const line = sourceCode.lines[lineIndex]
      if (line === undefined) return 0
      const match = line.match(/^\s*/)
      return match ? match[0].length : 0
    }

    const checkList = (
      node: Rule.Node
    , items: (Rule.Node | null)[]
    , openToken: AST.Token
    , closeToken: AST.Token
    , options: CheckListOptions = {}
    ): void => {
      const validItems = items.filter((i): i is Rule.Node => i !== null)
      if (validItems.length === 0) return

      const isMultiline = openToken.loc.end.line !== closeToken.loc.start.line ||
                          validItems.some(i => i.loc && i.loc.start.line !== i.loc.end.line)
      
      const tokenBeforeOpen = sourceCode.getTokenBefore(openToken)
      const braceOnNewLine = tokenBeforeOpen && openToken.loc.start.line !== tokenBeforeOpen.loc.end.line
      
      let wallColumn = options.wallColumn
      if (wallColumn === undefined) {
        const first = validItems[0]
        wallColumn = first ? first.loc!.start.column : openToken.loc.start.column
      }

      const wallIndent = ' '.repeat(wallColumn)

      // 1. First Item
      const first = validItems[0]
      if (first && first.range && openToken.range) {
        if (braceOnNewLine) {
          if (first.loc!.start.line !== openToken.loc.end.line) {
            context.report({
              node: first
            , message: 'First item must stand on the same line as the brace'
            , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], ' ')
            })
          } else {
            const textBetween = sourceCode.getText().substring(openToken.range![1], first.range![0])
            if (textBetween !== ' ' && !options.isParams && !options.isArgs) {
              context.report({
                node: first
              , message: 'First item must have 1 space after brace (Newline Brace)'
              , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], ' ')
              })
            }
          }
        } else {
          const textBefore = sourceCode.getText().substring(openToken.range[1], first.range[0])
          if (first.loc!.start.line === openToken.loc.end.line) {
            if (isMultiline && (options.isArgs || options.isParams)) {
              if (textBefore !== ' ') {
                context.report({
                  node: first
                , message: 'Space required (Alignment for Multiline Args)'
                , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], ' ')
                })
              }
            } else if (textBefore !== '' && textBefore !== ' ') {
              context.report({
                node: first
              , message: 'Invalid spacing (0 or 1 space allowed)'
              , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], ' ')
              })
            }
          } else {
            const targetCol = wallColumn + 2
            if (first.loc!.start.column !== targetCol) {
              const replacement = '\n' + ' '.repeat(targetCol)
              context.report({
                node: first
              , message: 'Incorrect indentation for hanging item (Virtual Comma)'
              , fix: f => f.replaceTextRange([openToken.range![1], first.range![0]], replacement)
              })
            }
          }
        }
      }

      // 2. Subsequent Items
      validItems.slice(1).forEach((item, idx) => {
        const prev = validItems[idx]
        if (!item || !prev || !item.range || !prev.range) return

        const expected = isMultiline ? ('\n' + wallIndent + ', ') : ', '
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
      if (closeToken.loc.start.line !== openToken.loc.start.line) {
        const closeIndent = options.closeIndent !== undefined ? options.closeIndent : wallColumn
        const expectedClose = '\n' + ' '.repeat(closeIndent)
        const tokenBeforeClose = sourceCode.getTokenBefore(closeToken)
        if (tokenBeforeClose && closeToken.range) {
          const range: [number, number] = [tokenBeforeClose.range[1], closeToken.range[0]]
          if (sourceCode.getText().substring(range[0], range[1]) !== expectedClose) {
            context.report({
              node: closeToken
            , message: 'Close alignment'
            , fix: f => f.replaceTextRange(range, expectedClose)
            })
          }
        }
      }
    }

    const ensureSplit = (node: Rule.Node, markerNode: Rule.Node, itemCount: number, isCall = false): number => {
      if (isCall) return 0
      if (itemCount <= 1) return 0

      const openToken = sourceCode.getFirstToken(node)
      if (!openToken) return 0
      const tokenBefore = sourceCode.getTokenBefore(openToken)
      if (!tokenBefore) return 0
      
      const textBefore = sourceCode.getText().substring(tokenBefore.range[1], openToken.range[0])
      if (textBefore.trim().length > 0) return 0

      const expected = '\n' + ' '.repeat(markerNode.loc!.start.column)
      if (textBefore !== expected) {
        context.report({
          node: openToken
        , message: 'Break before brace (Multi-Item)'
        , fix: f => f.replaceTextRange([tokenBefore.range[1], openToken.range[0]], expected)
        })
      }
      return markerNode.loc!.start.column
    }

    const checkFunc = (node: Rule.Node): void => {
      const isArrow = node.type === 'ArrowFunctionExpression'
      let open: AST.Token | undefined
      let close: AST.Token | undefined
      
      const params = (node as any).params as Rule.Node[]
      if (params.length > 0) {
        open = sourceCode.getTokenBefore(params[0]) || undefined
        close = sourceCode.getTokenAfter(params[params.length - 1]) || undefined
        
        if (open && close) {
          const first = params[0]
          const isFirstInline = first.loc!.start.line === open.loc.start.line
          const nodeIndent = getIndentSize(node)
          const wallColumn = isFirstInline ? open.loc.start.column : (nodeIndent + 2)
          
          checkList(node, params, open, close, { 
            isParams: true
          , wallColumn: wallColumn
          , closeIndent: nodeIndent
          , newlineFirst: !isFirstInline
          , minItems: 0 
          })
        }
      }
      
      if (!isArrow) {
        const body = (node as any).body
        if (body) {
          const brace = sourceCode.getFirstToken(body)
          const closeToken = close || (sourceCode.getTokensBefore(body).reverse().find(t => t.value === ')') as AST.Token)
          if (brace && closeToken) {
            const text = sourceCode.getText().substring(closeToken.range[1], brace.range[0])
            if (text !== ' ') {
              context.report({
                node: body
              , message: 'Space before {'
              , fix: f => f.replaceTextRange([closeToken.range[1], brace.range[0]], ' ')
              })
            }
          }
        }
      }
    }

    const checkControlFlow = (node: Rule.Node): void => {
      const firstToken = sourceCode.getFirstToken(node)
      if (!firstToken) return
      
      let searchNode = firstToken
      if (node.type === 'CatchClause' && (node as any).param) {
         searchNode = sourceCode.getTokenBefore((node as any).param) || firstToken
      }

      const openToken = sourceCode.getTokenAfter(searchNode, { filter: t => t.value === '(' })
      if (!openToken) return
      
      const closeToken = sourceCode.getLastToken(node, { filter: t => t.value === ')' })
      if (!closeToken) return

      const nextToken = sourceCode.getTokenAfter(openToken)
      if (nextToken && nextToken.range[0] < closeToken.range[0]) {
        const textAfterOpen = sourceCode.getText().substring(openToken.range[1], nextToken.range[0])
        if (textAfterOpen !== '') {
          context.report({
            node: node
          , loc: openToken.loc
          , message: 'No space allowed in control flow (start)'
          , fix: f => f.replaceTextRange([openToken.range[1], nextToken.range[0]], '')
          })
        }

        const prevToken = sourceCode.getTokenBefore(closeToken)
        if (prevToken) {
          const textBeforeClose = sourceCode.getText().substring(prevToken.range[1], closeToken.range[0])
          if (textBeforeClose !== '') {
            context.report({
              node: node
            , loc: closeToken.loc
            , message: 'No space allowed in control flow (end)'
            , fix: f => f.replaceTextRange([prevToken.range[1], closeToken.range[0]], '')
            })
          }
        }
      }
    }

    return {
      ObjectExpression(node: Rule.Node & { properties: any[] }) {
        const p = node.parent
        if (!p || p.type === 'CallExpression') return

        const open = sourceCode.getFirstToken(node)
        const close = sourceCode.getLastToken(node)
        if (!open || !close) return

        let wallColumn = 0
        if (p.type === 'VariableDeclarator') wallColumn = ensureSplit(node, p.parent as Rule.Node, node.properties.length)
        else if (p.type === 'Property') wallColumn = ensureSplit(node, (p as any).key as Rule.Node, node.properties.length)
        else if (p.type === 'AssignmentPattern') wallColumn = ensureSplit(node, (p as any).left as Rule.Node, node.properties.length)
        else if (p.type === 'AssignmentExpression') wallColumn = ensureSplit(node, (p as any).left as Rule.Node, node.properties.length)
        else wallColumn = open.loc.start.column

        const tokenBeforeOpen = sourceCode.getTokenBefore(open)
        const braceOnNewLine = tokenBeforeOpen && open.loc.start.line !== tokenBeforeOpen.loc.end.line
        
        if (!braceOnNewLine) {
          wallColumn = getIndentSize(node) + 2
        }

        checkList(node, node.properties, open, close, { 
          wallColumn: wallColumn
        , newlineFirst: !braceOnNewLine
        , minItems: 4 
        })
      },

      ArrayExpression(node: Rule.Node & { elements: any[] }) {
        const p = node.parent
        if (!p || p.type === 'CallExpression') return

        const open = sourceCode.getFirstToken(node)
        const close = sourceCode.getLastToken(node)
        if (!open || !close) return

        let wallColumn = 0
        if (p.type === 'VariableDeclarator') wallColumn = ensureSplit(node, p.parent as Rule.Node, node.elements.length)
        else if (p.type === 'Property') wallColumn = ensureSplit(node, (p as any).key as Rule.Node, node.elements.length)
        else if (p.type === 'AssignmentExpression') wallColumn = ensureSplit(node, (p as any).left as Rule.Node, node.elements.length)
        else wallColumn = open.loc.start.column

        const tokenBeforeOpen = sourceCode.getTokenBefore(open)
        const braceOnNewLine = tokenBeforeOpen && open.loc.start.line !== tokenBeforeOpen.loc.end.line
        
        if (!braceOnNewLine) {
          wallColumn = getIndentSize(node)
        }

        checkList(node, node.elements, open, close, { 
          wallColumn: wallColumn
        , newlineFirst: !braceOnNewLine
        , minItems: 4 
        })
      },

      CallExpression(node: Rule.Node & { callee: any, arguments: any[] }) {
        const open = sourceCode.getTokenAfter(node.callee)
        const close = sourceCode.getLastToken(node)
        if (open && open.value === '(' && close && node.arguments.length > 0) {
          const first = node.arguments[0]
          const isFirstInline = first.loc!.start.line === open.loc.start.line
          
          if (!isFirstInline) {
            const tokenBeforeFirst = sourceCode.getTokenBefore(first)
            if (tokenBeforeFirst === open) {
              context.report({
                node: first
              , message: 'Function call arguments must start inline'
              , fix: f => f.replaceTextRange([open.range![1], first.range![0]], ' ')
              })
            }
          }

          const wallColumn = open.loc.start.column
          checkList(node, node.arguments, open, close, { 
            wallColumn: wallColumn
          , newlineFirst: !isFirstInline
          , minItems: 0
          , isArgs: true 
          })
        }
      },

      FunctionDeclaration: checkFunc,
      FunctionExpression: checkFunc,
      ArrowFunctionExpression: checkFunc,
      
      IfStatement: checkControlFlow,
      WhileStatement: checkControlFlow,
      SwitchStatement: checkControlFlow,
      CatchClause: checkControlFlow
    }
  },
}
