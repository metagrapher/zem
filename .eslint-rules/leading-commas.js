export default {
  meta: {
    type: 'layout',
    docs: { description: 'Enforce Comma-First spatial alignment. Safe & Precise.' },
    fixable: 'whitespace',
    schema: [],
  },
  create: function (context) {
    const sourceCode = context.getSourceCode();

    function getIndent(locOrNode) {
      if (!locOrNode) return '';
      const loc = locOrNode.loc || locOrNode;
      const lineIndex = loc.start.line - 1;
      const line = sourceCode.lines[lineIndex];
      if (line === undefined) return '';
      return line.match(/^\s*/)[0];
    }

    function checkList(node, items, openToken, closeToken, options = {}) {
      if (!items || items.length === 0) return;

      const isMultiline = openToken.loc.end.line !== closeToken.loc.start.line || 
                          items.some(i => i && i.loc.start.line !== i.loc.end.line);
      
      const threshold = options.minItems || 4;
      if (!isMultiline && items.length < threshold) return;

      const parentBaseIndent = options.parentIndent !== undefined ? options.parentIndent : getIndent(openToken);
      const wallIndent = parentBaseIndent + ' '.repeat(options.wallOffset || 0);
      const firstItemIndent = wallIndent + (options.isParams || options.isArgs ? '  ' : '');

      // 1. First Item
      const first = items[0];
      if (first) {
          const textBefore = sourceCode.getText().substring(openToken.range[1], first.range[0]);
          if (options.newlineFirst) {
              const exp = '\n' + firstItemIndent;
              const normalizedText = textBefore.replace(/^[^\n]*\n/, '\n');
              if (normalizedText !== exp && textBefore !== exp) {
                   context.report({ node: first, message: 'Newline needed', fix: f => f.replaceTextRange([openToken.range[1], first.range[0]], exp) });
              }
          } else {
              if (textBefore.includes('\n')) {
                  const exp = '\n' + firstItemIndent;
                  const lastLine = textBefore.substring(textBefore.lastIndexOf('\n'));
                  if (lastLine !== exp) {
                      context.report({ node: first, message: 'Indent mismatch', fix: f => f.replaceTextRange([openToken.range[1], first.range[0]], exp) });
                  }
              } else if (textBefore !== ' ' && textBefore !== ' \n' && textBefore !== '\n') {
                  context.report({ node: first, message: 'Pull-up required', fix: f => f.replaceTextRange([openToken.range[1], first.range[0]], ' ') });
              }
          }
      }

      // 2. Subsequent Items
      for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const prev = items[i - 1];
        if (!item || !prev) continue;

        const expected = '\n' + wallIndent + ', ';
        const range = [prev.range[1], item.range[0]];
        if (sourceCode.getText().substring(range[0], range[1]) !== expected) {
            context.report({ node: item, message: 'Wall mismatch', fix: f => f.replaceTextRange(range, expected) });
        }
      }

      // 3. Trailing Comma
      const tokens = sourceCode.getTokensBetween(openToken, closeToken);
      tokens.forEach((token, idx) => {
          if (token.value === ',') {
              const nextToken = tokens[idx + 1] || closeToken;
              if (nextToken === closeToken) context.report({ node: token, message: 'No trailing', fix: f => f.remove(token) });
          }
      });

      // 4. Closing token
      const last = items[items.length - 1];
      const expectedClose = '\n' + parentBaseIndent;
      if (sourceCode.getText().substring(last.range[1], closeToken.range[0]) !== expectedClose) {
          context.report({ node: closeToken, message: 'Close alignment', fix: f => f.replaceTextRange([last.range[1], closeToken.range[0]], expectedClose) });
      }
    }

    function ensureSplit(node, markerNode, offset = 0) {
        const openToken = sourceCode.getFirstToken(node);
        const tokenBefore = sourceCode.getTokenBefore(openToken);
        if (!tokenBefore) return;
        const textBefore = sourceCode.getText().substring(tokenBefore.range[1], openToken.range[0]);
        
        if (textBefore.includes('\n')) {
            const expected = '\n' + getIndent(markerNode) + ' '.repeat(offset);
            if (textBefore !== expected) context.report({ node: openToken, message: 'Split indent', fix: f => f.replaceTextRange([tokenBefore.range[1], openToken.range[0]], expected) });
        }
        return getIndent(markerNode).length + offset;
    }

    function checkFunc(node) {
        const isArrow = node.type === 'ArrowFunctionExpression';
        let open, close;
        if (isArrow) {
            const tokens = sourceCode.getTokensBefore(node.body || node);
            open = tokens.reverse().find(t => t.value === '(');
            close = tokens.reverse().find(t => t.value === ')');
        } else {
            const tokens = sourceCode.getTokensBetween(node.id || node, node.body);
            open = tokens.find(t => t.value === '(');
            close = tokens.find(t => t.value === ')');
        }
        
        if (open && close && node.params.length > 0) {
            checkList(node, node.params, open, close, { isParams: true, newlineFirst: true, parentIndent: getIndent(node), wallOffset: 0, minItems: 4 });
        }
        
        if (!isArrow && node.body) {
            const brace = sourceCode.getFirstToken(node.body);
            if (brace && close) {
                const text = sourceCode.getText().substring(close.range[1], brace.range[0]);
                if (text !== ' ') context.report({ node: node.body, message: 'Space before {', fix: f => f.replaceTextRange([close.range[1], brace.range[0]], ' ') });
            }
        }
    }

    return {
      ObjectExpression(node) {
        const open = sourceCode.getFirstToken(node);
        const close = sourceCode.getLastToken(node);
        const p = node.parent;
        let baseIndent = getIndent(open);
        let wallOffset = 0;

        if (p.type === 'VariableDeclarator') ensureSplit(node, p.parent, 0);
        else if (p.type === 'Property') {
            const splitCol = ensureSplit(node, p.key, 2);
            if (sourceCode.getTokenBefore(open).loc.end.line !== open.loc.start.line) {
                baseIndent = ' '.repeat(splitCol);
                wallOffset = 0;
            } else {
                baseIndent = getIndent(p.key);
                wallOffset = 2;
            }
        }
        else if (p.type === 'AssignmentPattern') ensureSplit(node, p.left, 2);
        else if (p.type === 'AssignmentExpression') ensureSplit(node, p.left, 0);
        
        // Array parent: strict alignment with the opening brace column
        if (p.type === 'ArrayExpression') {
             wallOffset = 0;
             baseIndent = ' '.repeat(open.loc.start.column);
        }
        
        checkList(node, node.properties, open, close, { newlineFirst: false, wallOffset: wallOffset, minItems: 4, parentIndent: baseIndent });
      },

      ArrayExpression(node) {
        const open = sourceCode.getFirstToken(node);
        const close = sourceCode.getLastToken(node);
        const p = node.parent;
        let baseIndent = getIndent(open);
        let wallOffset = 0;

        if (p.type === 'VariableDeclarator') ensureSplit(node, p.parent, 0);
        else if (p.type === 'Property') {
            const splitCol = ensureSplit(node, p.key, 2);
            if (sourceCode.getTokenBefore(open).loc.end.line !== open.loc.start.line) {
                baseIndent = ' '.repeat(splitCol);
                wallOffset = 0;
            } else {
                baseIndent = getIndent(p.key);
                wallOffset = 2;
            }
        }
        else if (p.type === 'AssignmentExpression') ensureSplit(node, p.left, 0);
        
        checkList(node, node.elements, open, close, { wallOffset: wallOffset, newlineFirst: false, minItems: 4, parentIndent: baseIndent });
      },

      CallExpression(node) {
          const open = sourceCode.getTokenAfter(node.callee);
          const close = sourceCode.getLastToken(node);
          if (open && open.value === '(') {
              checkList(node, node.arguments, open, close, { wallOffset: 0, newlineFirst: false, minItems: 4, isArgs: true });
          }
      },

      FunctionDeclaration: checkFunc,
      FunctionExpression: checkFunc,
      ArrowFunctionExpression: checkFunc
    };
  },
};
