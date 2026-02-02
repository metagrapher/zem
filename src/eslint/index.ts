import { leadingCommas } from './rules/leading-commas'
import { noLoops } from './rules/no-loops'
import { noThrow } from './rules/no-throw'
import { noAny } from './rules/no-any'
import { noLongFiles } from './rules/no-long-files'
import { fileGranularity } from './rules/file-granularity'


export const rules = {
  'leading-commas': leadingCommas,
  'no-loops': noLoops,
  'no-throw': noThrow,
  'no-any': noAny,
  'no-long-files': noLongFiles,
  'file-granularity': fileGranularity,
}

const plugin = {
  rules,
}

export const configs = {
  specA: {
    plugins: {
      '@metagrapher/zem': plugin,
    },
    rules: {
      '@metagrapher/zem/leading-commas': 'error',
      '@metagrapher/zem/no-loops': 'error',
      '@metagrapher/zem/no-throw': 'error',
      '@metagrapher/zem/no-any': 'error',
      '@metagrapher/zem/no-long-files': 'error',
      '@metagrapher/zem/file-granularity': 'warn',
    },
  },
  specB: {
    plugins: {
      '@metagrapher/zem': plugin,
    },
    rules: {
      '@metagrapher/zem/leading-commas': 'warn',
      '@metagrapher/zem/no-loops': 'error',
      '@metagrapher/zem/no-throw': 'error',
      '@metagrapher/zem/no-any': 'error',
      '@metagrapher/zem/no-long-files': ['error', { max: 150 }],
      '@metagrapher/zem/file-granularity': ['warn', { threshold: 75, max: 150 }],
    },
  },
  recommended: null as any, // assigned below
}

configs.recommended = configs.specA

// Add configs to the plugin object for standard access
Object.assign(plugin, { configs })

export default plugin
