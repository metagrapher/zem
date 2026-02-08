
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cliPath = path.resolve(__dirname, '../dist/cli.js')

console.log('[LEGACY WRAPPER] Forwarding to dist/cli.js sync-issues')
const result = spawnSync('node', [cliPath, 'sync-issues'], { 
    stdio: 'inherit',
    env: process.env
})

process.exit(result.status ?? 1)
