import fs from 'fs'
import path from 'path'
import { Octokit } from '@octokit/rest'
import fm from 'front-matter'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ISSUES_DIR = path.join(ROOT, '.issues')

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')

const findFiles = (dir) => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(file => {
    const res = path.join(dir, file.name)
    return file.isDirectory() ? findFiles(res) : (file.name.endsWith('.md') ? [res] : [])
  })
}

const findExistingIssueByTitle = async (title) => {
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'all',
  })
  return issues.find(issue => issue.title === title)
}

const formatGitHubBody = (attributes, body) => {
  const metadata = Object.entries(attributes)
    .filter(([key]) => !['title', 'status', 'gh_number', 'labels'].includes(key))
    .map(([key, value]) => {
      let displayValue = value
      if (key === 'verification') {
        displayValue = value === 'PASS' ? '✅ PASS' : (value === 'IN_PROGRESS' ? '🧪 IN_PROGRESS (Proof Passes)' : '❌ FAIL')
      }
      return `- **${key}**: ${displayValue}`
    })
    .join('\n')

  if (!metadata) return body
  return `### Metadata\n${metadata}\n\n---\n\n${body}`
}

const verifyTests = (testPath) => {
  if (!testPath) return { ok: false, status: 'OPEN', reason: 'Missing test_ref' }
  const fullPath = path.resolve(ROOT, testPath)
  if (!fs.existsSync(fullPath)) return { ok: false, status: 'OPEN', reason: `test_ref not found: ${testPath}` }

  console.log(`[TEST] Verifying ${testPath}...`)
  const result = spawnSync('node', [
    '--experimental-strip-types',
    '--test',
    fullPath
  ], { encoding: 'utf8', cwd: ROOT })

  const output = result.stdout + result.stderr
  const success = result.status === 0

  if (success) {
    return { ok: true, status: 'CLOSED' }
  }

  // Check for TDD State (Proof passing, Solution failing)
  const proofPassed = /Test B \(The Proof\).*PASSED|✔ Test B \(The Proof\)/i.test(output)
  const solutionFailed = /Test A \(The Solution\).*FAILED|✖ Test A \(The Solution\)|AssertionError|ERR_ASSERTION/i.test(output)

  if (proofPassed && solutionFailed) {
    console.log(`[TEST] TDD State detected for ${testPath}`)
    return { ok: false, status: 'IN_PROGRESS', reason: 'Proof passes but solution fails' }
  }

  console.log(`[TEST] Generic failure for ${testPath} (Proof: ${proofPassed}, Solution Failed: ${solutionFailed})`)
  return { ok: false, status: 'OPEN', reason: 'Tests failing' }
}

const sync = async () => {
  if (!owner || !repo) {
    console.error('GITHUB_REPOSITORY environment variable is required')
    process.exit(1)
  }

  const files = findFiles(ISSUES_DIR)

  for (let filePath of files) {
    const file = path.relative(ISSUES_DIR, filePath)
    const content = fs.readFileSync(filePath, 'utf8')
    const { attributes, body } = fm(content)
    const title = attributes.title || body.split('\n')[0].replace(/^#\s(Issue\s\d+:\s)?/, '').trim()

    // Determine implied status from directory
    const dirStatus = filePath.includes('/CLOSED/') ? 'CLOSED' : (filePath.includes('/IN_PROGRESS/') ? 'IN_PROGRESS' : 'OPEN')
    let status = attributes.status || dirStatus

    // Verification Logic
    if (attributes.test_ref) {
      const verification = verifyTests(attributes.test_ref)
      attributes.verification = verification.ok ? 'PASS' : (verification.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'FAIL')
      
      if (status === 'CLOSED' && !verification.ok) {
        console.warn(`[WARN] Issue ${file} cannot be CLOSED: ${verification.reason}. Moving to ${verification.status}.`)
        status = verification.status
      } else if (status === 'OPEN' && verification.status === 'IN_PROGRESS') {
        console.log(`[INFO] Issue ${file} promoted to IN_PROGRESS via TDD verification.`)
        status = 'IN_PROGRESS'
      } else if (status === 'IN_PROGRESS' && verification.status === 'OPEN') {
        console.warn(`[WARN] Issue ${file} demoted to OPEN: TDD proof no longer passing.`)
        status = 'OPEN'
      }
    }

    // Move file if status changed
    const targetDir = status === 'CLOSED' ? 'CLOSED' : (status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'OPEN')
    const targetPath = path.join(ISSUES_DIR, targetDir, path.basename(filePath))

    if (filePath !== targetPath) {
      console.log(`[MOVE] Moving ${file} to ${targetDir}/`)
      if (!fs.existsSync(path.dirname(targetPath))) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true })
      }
      fs.renameSync(filePath, targetPath)
      filePath = targetPath
    }

    let gh_number = attributes.gh_number

    if (!gh_number) {
      console.log(`[SYNC] Searching GitHub for issue: "${title}"`)
      const existing = await findExistingIssueByTitle(title)
      if (existing) {
        gh_number = existing.number
        console.log(`[SYNC] Matched existing issue #${gh_number}`)
      }
    }

    if (!gh_number) {
      console.log(`Creating issue for ${file}...`)
      const labels = Array.isArray(attributes.labels) ? [...attributes.labels] : []
      if (status === 'IN_PROGRESS') {
        if (!labels.includes('in progress')) labels.push('in progress')
      } else {
        const index = labels.indexOf('in progress')
        if (index > -1) labels.splice(index, 1)
      }

      const { data } = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body: formatGitHubBody(attributes, body),
        labels
      })
      gh_number = data.number
      console.log(`Created GitHub Issue #${gh_number}`)
    } else {
      console.log(`Updating issue #${gh_number}...`)
      
      // label sync logic
      let labels = []
      try {
        const { data: issue } = await octokit.rest.issues.get({ owner, repo, issue_number: gh_number })
        labels = issue.labels.map(l => (typeof l === 'string' ? l : l.name))
      } catch (e) {
        console.warn(`[WARN] Could not fetch remote labels for #${gh_number}, falling back to local.`)
        labels = Array.isArray(attributes.labels) ? [...attributes.labels] : []
      }

      if (status === 'IN_PROGRESS') {
        if (!labels.includes('in progress')) {
          console.log(`[LABEL] Adding 'in progress' label to #${gh_number}`)
          labels.push('in progress')
        }
      } else {
        const index = labels.indexOf('in progress')
        if (index > -1) {
          console.log(`[LABEL] Removing 'in progress' label from #${gh_number}`)
          labels.splice(index, 1)
        }
      }

      // Regression Check
      try {
        const { data: issue } = await octokit.rest.issues.get({ owner, repo, issue_number: gh_number })
        if (issue.state === 'closed' && (status === 'OPEN' || status === 'IN_PROGRESS')) {
             console.log(`[LABEL] Regression detected on #${gh_number}. Adding 'regression' label.`)
             if (!labels.includes('regression')) labels.push('regression')
        } else if (status === 'CLOSED') {
             const index = labels.indexOf('regression')
             if (index > -1) {
                 console.log(`[LABEL] Fixed! Removing 'regression' label from #${gh_number}`)
                 labels.splice(index, 1)
             }
        }
      } catch (e) {}

      labels = [...new Set(labels)]

      console.log(`[SYNC] Updating GitHub #${gh_number} | status: ${status} | labels: [${labels.join(', ')}]`)

      await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: gh_number,
        title,
        body: formatGitHubBody(attributes, body),
        labels,
        state: (status === 'CLOSED' ? 'closed' : 'open')
      })
    }

    const updatedAttributes = {
      ...attributes,
      title,
      status,
      gh_number
    }

    const frontMatter = Object.entries(updatedAttributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')

    const newContent = `---\n${frontMatter}\n---\n${body}`

    if (newContent.trim() !== content.trim()) {
      console.log(`[SYNC] Updating local file: ${file}`)
      fs.writeFileSync(filePath, newContent)
    }

    // Rename file if prefix doesn't match gh_number
    const currentName = path.basename(filePath)
    const ghPrefix = String(gh_number).padStart(3, '0')
    if (!currentName.startsWith(ghPrefix)) {
      const newName = `${ghPrefix}-${currentName.replace(/^\d+-/, '')}`
      const finalPath = path.join(path.dirname(filePath), newName)
      console.log(`[RENAME] Renaming local issue to match GitHub #${gh_number}: ${newName}`)
      fs.renameSync(filePath, finalPath)
      filePath = finalPath
    }
  }
}

sync().catch(err => {
  console.error('[FATAL] Sync failed:', err)
  process.exit(1)
})
