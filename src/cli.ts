#!/usr/bin/env node
import { sync } from './cli/sync-issues.ts'
import { init } from './cli/init.ts'
import { audit } from './cli/audit.ts'

const command = process.argv[2]

switch (command) {
    case 'audit':
        audit().then(code => {
            process.exit(code)
        }).catch(err => {
            console.error('Audit failed:', err)
            process.exit(1)
        })
        break
    case 'sync-issues':
        sync().catch(err => {
            console.error(err)
            process.exit(1)
        })
        break
    case 'init':
        init().catch(err => {
            console.error('Initialization failed:', err)
            process.exit(1)
        })
        break
    default:
        console.log('Usage: zem <command>')
        console.log('Commands:')
        console.log('  init         Initialize ZEM in a project')
        console.log('  audit        Perform structural and mechanical verification')
        console.log('  sync-issues  Sync local issue files with GitHub issues')
        process.exit(1)
}
