import { leadingCommas } from './rules/leading-commas'
import { noLoops } from './rules/no-loops'
import { noThrow } from './rules/no-throw'
import { noAny } from './rules/no-any'
import { noLongFiles } from './rules/no-long-files'


export const rules = {
  'leading-commas': leadingCommas,
  'no-loops': noLoops,
  'no-throw': noThrow,
  'no-any': noAny,
  'no-long-files': noLongFiles,
}

const plugin = {
  rules,
}

export const configs = {
  recommended: {
    plugins: {
      '@metagrapher/zem': plugin,
    },
    rules: {
      '@metagrapher/zem/leading-commas': 'error',
      '@metagrapher/zem/no-loops': 'error',
      '@metagrapher/zem/no-throw': 'error',
      '@metagrapher/zem/no-any': 'error',
      '@metagrapher/zem/no-long-files': 'error',
    },
  },
}

// Add configs to the plugin object for standard access
Object.assign(plugin, { configs })

export default plugin
