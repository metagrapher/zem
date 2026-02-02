import { leadingCommas } from './rules/leading-commas'
import { noLoops } from './rules/no-loops'
import { noThrow } from './rules/no-throw'
import { noAny } from './rules/no-any'

export const rules = {
  'leading-commas': leadingCommas,
  'no-loops': noLoops,
  'no-throw': noThrow,
  'no-any': noAny,
}

export const configs = {
  recommended: {
    plugins: ['@metagrapher/zem'],
    rules: {
      '@metagrapher/zem/leading-commas': 'error',
      '@metagrapher/zem/no-loops': 'error',
      '@metagrapher/zem/no-throw': 'error',
      '@metagrapher/zem/no-any': 'error',
    },
  },
}

const plugin = {
  rules,
  configs,
}

export default plugin
