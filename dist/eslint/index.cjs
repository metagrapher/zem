"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/eslint/index.ts
var eslint_exports = {};
__export(eslint_exports, {
  configs: () => configs,
  default: () => eslint_default,
  rules: () => rules
});
module.exports = __toCommonJS(eslint_exports);

// src/eslint/rules/leading-commas.ts
var leadingCommas = {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce leading commas in arrays and objects"
    },
    fixable: "whitespace",
    schema: []
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    function checkCommas(node) {
      const elementsOrProps = node.elements || node.properties;
      if (!elementsOrProps || elementsOrProps.length === 0) return;
      elementsOrProps.forEach((elementOrProp, i) => {
        if (i === 0) return;
        const previousElementOrProp = elementsOrProps[i - 1];
        const previousEnd = previousElementOrProp.range[1];
        const currentStart = elementOrProp.range[0];
        const leadingText = sourceCode.getText().substring(previousEnd, currentStart).trim();
        if (leadingText.indexOf(",") !== 0) {
          context.report({
            node: elementOrProp,
            message: "Expected a leading comma",
            fix(fixer) {
              return fixer.insertTextBefore(elementOrProp, ", ");
            }
          });
        }
      });
    }
    return {
      ArrayExpression: checkCommas,
      ObjectExpression: checkCommas
    };
  }
};

// src/eslint/rules/no-loops.ts
var noLoops = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Forbid standard loops (for, while, do-while) in ZEM."
    },
    schema: []
  },
  create(context) {
    return {
      ForStatement(node) {
        context.report({ node, message: "Loops are forbidden in ZEM. Use functional iterators (map, reduce, filter) or the do pattern." });
      },
      ForInStatement(node) {
        context.report({ node, message: "For-in loops are forbidden in ZEM. Use Object.keys().forEach()." });
      },
      ForOfStatement(node) {
        context.report({ node, message: "For-of loops are forbidden in ZEM. Use forEach()." });
      },
      WhileStatement(node) {
        context.report({ node, message: "While loops are forbidden in ZEM. Use recursion or functional patterns." });
      },
      DoWhileStatement(node) {
        context.report({ node, message: "Do-while loops are forbidden in ZEM. Use functional patterns." });
      }
    };
  }
};

// src/eslint/rules/no-throw.ts
var noThrow = {
  meta: {
    type: "problem",
    docs: {
      description: "Forbid throw statements in ZEM. Use Result<T, E> patterns."
    },
    schema: []
  },
  create(context) {
    return {
      ThrowStatement(node) {
        context.report({ node, message: "Throwing is forbidden in ZEM. Use Ok(value) / Err(error) to handle failures." });
      }
    };
  }
};

// src/eslint/rules/no-any.ts
var noAny = {
  meta: {
    type: "problem",
    docs: {
      description: 'Forbid the use of "any" in ZEM for strict type safety.'
    },
    schema: []
  },
  create(context) {
    return {
      TSAnyKeyword(node) {
        context.report({ node, message: 'The "any" type is forbidden in ZEM. Use "unknown" or define specific types.' });
      }
    };
  }
};

// src/eslint/index.ts
var rules = {
  "leading-commas": leadingCommas,
  "no-loops": noLoops,
  "no-throw": noThrow,
  "no-any": noAny
};
var configs = {
  recommended: {
    plugins: ["@metagrapher/zem"],
    rules: {
      "@metagrapher/zem/leading-commas": "error",
      "@metagrapher/zem/no-loops": "error",
      "@metagrapher/zem/no-throw": "error",
      "@metagrapher/zem/no-any": "error"
    }
  }
};
var plugin = {
  rules,
  configs
};
var eslint_default = plugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  configs,
  rules
});
