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
      
      const braceOnNewLine = openToken.loc.start.line !== sourceCode.getTokenBefore(openToken).loc.end.line;
      
      // Determine Wall Column
      // 1. Explicit override (e.g. brace on new line calculated from key/parent)
      // 2. Default: If first item exists, use its column. (This handles L13/L14 indentation)
      // 3. Fallback: Open token column.
      let wallColumn = options.wallColumn; 
      if (wallColumn === undefined) {
         if (items[0]) wallColumn = items[0].loc.start.column;
         else wallColumn = openToken.loc.start.column;
      }
      
      const wallIndent = ' '.repeat(wallColumn);
      
      // 1. First Item
      const first = items[0];
      if (first) {
          if (braceOnNewLine) {
              // ENFORCE: First Item on SAME LINE as Brace
              if (first.loc.start.line !== openToken.loc.end.line) {
                   context.report({
                       node: first,
                       message: 'First item must stand on the same line as the brace',
                       fix: f => f.replaceTextRange([openToken.range[1], first.range[0]], ' ') 
                   });
              } else {
                   // Check textual separation (must be 1 space)
                   const textBetween = sourceCode.getText().substring(openToken.range[1], first.range[0]);
                   if (textBetween !== ' ' && !options.isParams && !options.isArgs) {
                        context.report({
                            node: first,
                            message: 'First item must have 1 space after brace (Newline Brace)',
                            fix: f => f.replaceTextRange([openToken.range[1], first.range[0]], ' ')
                        });
                   }
              }
          } else {
               // Inline: Enforce specific spacing rules.
              const textBefore = sourceCode.getText().substring(openToken.range[1], first.range[0]);
              
              if (first.loc.start.line === openToken.loc.end.line) {
                  // Single Line or Multiline Start:
                  // 1. If Multiline AND Function Args: Enforce 1 space (match 'golden-standard' L54 style)
                  if (isMultiline && (options.isArgs || options.isParams)) {
                      if (textBefore !== ' ') {
                          context.report({ 
                              node: first, 
                              message: 'Space required (Alignment for Multiline Args)', 
                              fix: f => f.replaceTextRange([openToken.range[1], first.range[0]], ' ') 
                          });
                      }
                  } else {
                      // 2. Flexible (0 or 1 space allowed) for others.
                      if (textBefore !== '' && textBefore !== ' ') {
                           context.report({ 
                              node: first, 
                              message: 'Invalid spacing (0 or 1 space allowed)', 
                              fix: f => f.replaceTextRange([openToken.range[1], first.range[0]], ' ') 
                          });
                      }
                  }
              } else {
                  // First item on NEW LINE (Hanging Indent)
                  // Enforce strict indentation: wallColumn + 2 (Virtual Comma Width)
                  // This aligns first item with subsequent items which start at wallColumn + ', '.length (2)
                  const targetCol = wallColumn + 2;
                  
                  if (first.loc.start.column !== targetCol) {
                       // Replace range from start of line? No, textBefore includes newline.
                       // We need to replace indentation.
                       const range = [openToken.range[1], first.range[0]];
                       // Ensure we replace with '\n' + spaces
                       const replacement = '\n' + ' '.repeat(targetCol);
                       
                       context.report({
                           node: first,
                           message: 'Incorrect indentation for hanging item (Virtual Comma)',
                           fix: f => f.replaceTextRange(range, replacement)
                       });
                  }
              }
          }
      }

      // 2. Subsequent Items
      for (let i = 1; i < items.length; i++) {
        const item = items[i];
        const prev = items[i - 1];
        if (!item || !prev) continue;

        const expected = isMultiline ? ('\n' + wallIndent + ', ') : ', ';
        const range = [prev.range[1], item.range[0]];
        const actual = sourceCode.getText().substring(range[0], range[1]);
        
        if (actual !== expected) {
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
      // Must align with Wall Indent if on new line relative to open (or just multiline generally)
      if (closeToken.loc.start.line !== openToken.loc.start.line) {
           const last = items[items.length - 1]; // or tokens before close?
           // If empty, simple check.
           const expectedClose = '\n' + wallIndent;
           // Check space before closeToken
           const tokenBeforeClose = sourceCode.getTokenBefore(closeToken);
           const range = [tokenBeforeClose.range[1], closeToken.range[0]];
           const actual = sourceCode.getText().substring(range[0], range[1]);
           
           if (actual !== expectedClose) {
               // Special case: if tokenBeforeClose is comma, we handled trailing comma separate?
               // Yes, Step 3 removes trailing comma if present.
               // If removed, tokenBeforeClose is Last Item.
               // If actual !== expected, fix.
               context.report({ 
                   node: closeToken, 
                   message: 'Close alignment', 
                   fix: f => f.replaceTextRange(range, expectedClose) 
               });
           }
      }
    }

    function ensureSplit(node, markerNode, itemCount, isCall = false) {
        if (isCall) return 0; // Function calls MUST be inline
        if (itemCount <= 1) return 0; // Single items allowed inline

        const openToken = sourceCode.getFirstToken(node);
        const tokenBefore = sourceCode.getTokenBefore(openToken);
        if (!tokenBefore) return 0;
        
        const textBefore = sourceCode.getText().substring(tokenBefore.range[1], openToken.range[0]);
        if (textBefore.trim().length > 0) return 0; // Don't touch comments

        // STRICT COLUMN ALIGNMENT: 
        // Newline + Spaces matching the marker's visual column
        const expected = '\n' + ' '.repeat(markerNode.loc.start.column);
        
        if (textBefore !== expected) {
            context.report({ 
                node: openToken, 
                message: 'Break before brace (Multi-Item)', 
                fix: f => f.replaceTextRange([tokenBefore.range[1], openToken.range[0]], expected) 
            });
        }
        return markerNode.loc.start.column;
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
        
        if (node.params.length > 0) {
            // Robustly find open/close relative to params
            open = sourceCode.getTokenBefore(node.params[0]);
            close = sourceCode.getTokenAfter(node.params[node.params.length - 1]);
            
            if (open && close) {
                const first = node.params[0];
                const isFirstInline = first.loc.start.line === open.loc.start.line;
                // Function Params:
                // If inline: Wall is open.column.
                // If newline: Wall is getIndent(node).length + 2 (Standard Indent + Comma Offset).
                // checkList will add +2 for item start, reaching Indent + 4.
                const wallColumn = isFirstInline ? open.loc.start.column : (getIndent(node).length + 2);
                
                checkList(node, node.params, open, close, { 
                    isParams: true, 
                    wallColumn: wallColumn, 
                    newlineFirst: !isFirstInline, 
                    minItems: 0 
                });
            }
        }
        
        if (!isArrow && node.body) {
            const brace = sourceCode.getFirstToken(node.body);
            if (brace && close) {
                const text = sourceCode.getText().substring(close.range[1], brace.range[0]);
                if (text !== ' ') context.report({ node: node.body, message: 'Space before {', fix: f => f.replaceTextRange([close.range[1], brace.range[0]], ' ') });
            }
        }
    }

    function checkControlFlow(node) {
         // Find '(' after keyword
         const openToken = sourceCode.getTokenAfter(node.type === 'CatchClause' ? node.param ? sourceCode.getTokenBefore(node.param) : sourceCode.getFirstToken(node) : sourceCode.getFirstToken(node), { filter: t => t.value === '(' });
         
         if (!openToken) return;
         
         const nextToken = sourceCode.getTokenAfter(openToken);
         if (!nextToken) return;
         
         // Enforce 0 SPACE
         const textBetween = sourceCode.getText().substring(openToken.range[1], nextToken.range[0]);
         if (textBetween !== '') {
              context.report({
                  node: node, // or openToken
                  loc: openToken.loc,
                  message: 'No space allowed in control flow',
                  fix: f => f.replaceTextRange([openToken.range[1], nextToken.range[0]], '')
              });
         }
    }

    return {
      ObjectExpression(node) {
        const p = node.parent;
        if (p.type === 'CallExpression') return; 

        const open = sourceCode.getFirstToken(node);
        const close = sourceCode.getLastToken(node);
        let wallColumn = 0;

        if (p.type === 'VariableDeclarator') wallColumn = ensureSplit(node, p.parent, node.properties.length); 
        else if (p.type === 'Property') wallColumn = ensureSplit(node, p.key, node.properties.length); 
        else if (p.type === 'AssignmentPattern') wallColumn = ensureSplit(node, p.left, node.properties.length);
        else if (p.type === 'AssignmentExpression') wallColumn = ensureSplit(node, p.left, node.properties.length);
        else if (p.type === 'ArrayExpression') {
             wallColumn = open.loc.start.column;
        }
        else {
             wallColumn = open.loc.start.column;
        }
        
        const braceOnNewLine = sourceCode.getTokenBefore(open).loc.end.line !== open.loc.start.line;
        
        if (!braceOnNewLine) {
             wallColumn = getIndent(node).length + 2;
        }

        checkList(node, node.properties, open, close, { wallColumn: wallColumn, newlineFirst: !braceOnNewLine, minItems: 4 });
      },

      ArrayExpression(node) {
        const p = node.parent;
        if (p.type === 'CallExpression') return; 

        const open = sourceCode.getFirstToken(node);
        const close = sourceCode.getLastToken(node);
        let wallColumn = 0;

        if (p.type === 'VariableDeclarator') wallColumn = ensureSplit(node, p.parent, node.elements.length); 
        else if (p.type === 'Property') wallColumn = ensureSplit(node, p.key, node.elements.length); 
        else if (p.type === 'AssignmentExpression') wallColumn = ensureSplit(node, p.left, node.elements.length);
        else if (p.type === 'ArrayExpression') {
             wallColumn = open.loc.start.column;
        }
        else {
             wallColumn = open.loc.start.column;
        }
        
        const braceOnNewLine = sourceCode.getTokenBefore(open).loc.end.line !== open.loc.start.line;
        
        if (!braceOnNewLine) {
             wallColumn = getIndent(node).length;
        }

        checkList(node, node.elements, open, close, { wallColumn: wallColumn, newlineFirst: !braceOnNewLine, minItems: 4 });
      },

      CallExpression(node) {
          const open = sourceCode.getTokenAfter(node.callee);
          const close = sourceCode.getLastToken(node);
          if (open && open.value === '(' && node.arguments.length > 0) {
              const first = node.arguments[0];
              const isFirstInline = first.loc.start.line === open.loc.start.line;
              
              // Enforce Inline Start for Function Calls (Canonical Style)
              // Example: `verificationTest( false` vs `verificationTest(\n  false`
              // To achieve Zero Diff against golden-standard, we must enforce inline start.
              if (!isFirstInline) {
                   const tokenBeforeFirst = sourceCode.getTokenBefore(first);
                   if (tokenBeforeFirst === open) {
                       context.report({
                           node: first,
                           message: 'Function call arguments must start inline',
                           fix: f => f.replaceTextRange([open.range[1], first.range[0]], ' ')
                       });
                       // Return early? checkList might run on old location?
                       // Fixer runs later. checkList runs now.
                       // checkList will see !isFirstInline.
                       // It will report indentation error (virtual comma).
                       // We report inline error.
                       // Multiple fixes might conflict?
                       // If we fix inline, indentation fix becomes irrelevant.
                       // Let's hope removing newline invalidates indentation report or overlaps safely.
                       // Usually replacement of overlapping range handles it.
                       // Indentation fix replaces [open.range[1], first.range[0]].
                       // Inline fix replaces [open.range[1], first.range[0]].
                       // They target SAME range.
                       // Both act?
                       // If checking !isFirstInline, we report Inline.
                       // Should we SKIP checkList if fixing inline?
                       // No, checkList handles commas.
                       // But checkList logic depends on `isFirstInline`.
                       // If we know it's wrong, we can skip checkList for THIS pass?
                       // Or pass `newlineFirst: false` manually to simulate expected state?
                       // Let's rely on overlap.
                   }
              }

              // Determine wallColumn assuming standard logic
              // If inline (or forced inline), wallColumn = open.loc.start.column
              const wallColumn = open.loc.start.column; // Always inline for Calls per Golden Standard (L59 Clean)

              checkList(node, node.arguments, open, close, { 
                  wallColumn: wallColumn, 
                  newlineFirst: !isFirstInline, // If fixing, this is technically false for next pass
                  minItems: 0, 
                  isArgs: true 
              });
          }
      },

      FunctionDeclaration: checkFunc,
      FunctionExpression: checkFunc,
      ArrowFunctionExpression: checkFunc,
      
      IfStatement: checkControlFlow,
      WhileStatement: checkControlFlow,
      SwitchStatement: checkControlFlow,
      CatchClause: checkControlFlow
    };
  },
};

