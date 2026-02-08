import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { Octokit } from '@octokit/rest'
import fm from 'front-matter'

const ISSUES_DIR = '.issues'
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')

const Ok = (value) => ({ ok: true, value })
const Err = (error) => ({ ok: false, error })

const atomicAsync = async (fn) => {
  try {
    return Ok(await fn())
  } catch (e) {
    return Err(e instanceof Error ? e.message : String(e))
  }
}

const findExistingIssueByTitle = async (title) => {
  const result = await atomicAsync(() => octokit.rest.issues.listForRepo({
    owner
    , repo
    , state: 'all'
    , per_page: 100
  }))

  if (!result.ok) {
    console.error(`Error searching for existing issue titled "${title}":`, result.error)
    return null
  }

  return result.value.data.find(issue => issue.title === title)
}

const verifyTests = (testPath) => {
  if (!testPath) return { ok: false, status: 'OPEN', reason: 'Missing test_ref' }
  if (!fs.existsSync(testPath)) return { ok: false, status: 'OPEN', reason: `test_ref not found: ${testPath}` }

  console.log(`[TEST] Verifying ${testPath}...`)
  const result = spawnSync('node', [
    '--experimental-strip-types'
    , '--test'
    , testPath
  ]
    , { encoding: 'utf8' }
  )

  const output = result.stdout + result.stderr
  const success = result.status === 0

  if (success) {
    return { ok: true, status: 'CLOSED' }
  }

  // TDD Logic: If Solution (Test A) fails but Proof (Test B) passes -> IN_PROGRESS
  const proofPassed = output.includes('Test B (The Proof) PASSED')
  const solutionFailed = output.includes('Test A (The Solution) FAILED') || output.includes('AssertionError')

  if (proofPassed && solutionFailed) {
    return { ok: false, status: 'IN_PROGRESS', reason: 'Proof passes but solution fails' }
  }

  return { ok: false, status: 'OPEN', reason: 'Tests failing' }
}

const findFiles = (dir) => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(file => {
    const res = path.join(dir, file.name)
    return file.isDirectory() ? findFiles(res) : (file.name.endsWith('.md') ? [res] : [])
  })
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

const sync = async () => {
  const filePaths = findFiles(ISSUES_DIR)

  for (let filePath of filePaths) {
    if (!fs.existsSync(filePath)) continue

    const file = path.relative(ISSUES_DIR, filePath)
    const content = fs.readFileSync(filePath, 'utf8')
    const { attributes, body } = fm(content)
    const title = attributes.title || body.split('\n')[0].replace(/^#\s(Issue\s\d+:\s)?/, '').trim()
    const dirStatus = filePath.includes('/CLOSED/') ? 'CLOSED' : (filePath.includes('/IN_PROGRESS/') ? 'IN_PROGRESS' : 'OPEN')
    let status = attributes.status || dirStatus

    // Capture verification status
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

    // Determine correct directory
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
      console.log(`Creating issue for ${file}...`);
      const labels = Array.isArray(attributes.labels) ? [...attributes.labels] : []
      if (status === 'IN_PROGRESS') {
        if (!labels.includes('in progress')) labels.push('in progress')
      } else {
        const index = labels.indexOf('in progress')
        if (index > -1) labels.splice(index, 1)
      }

      const result = await atomicAsync(() => octokit.rest.issues.create({
        owner,
        repo,
        title: title,
        body: formatGitHubBody(attributes, body),
        labels: labels
      }));
      if (result.ok) {
        gh_number = result.value.data.number;
        console.log(`Created GitHub Issue #${gh_number}`);
      } else {
        console.error(`[ERROR] Failed to create issue ${file}:`, result.error);
        continue;
      }
    } else {
      console.log(`Updating issue #${gh_number}...`);
      
      // Fetch existing issue to preserve other labels
      const existingIssue = await atomicAsync(() => octokit.issues.get({
        owner,
        repo,
        issue_number: gh_number
      }));

      let labels = []
      if (existingIssue.ok) {
        labels = existingIssue.value.data.labels.map(l => typeof l === 'string' ? l : l.name)
      } else {
        labels = Array.isArray(attributes.labels) ? [...attributes.labels] : []
      }

      if (status === 'IN_PROGRESS') {
        if (!labels.includes('in progress')) {
          console.log(`[LABEL] Adding 'in progress' label to #${gh_number}`);
          labels.push('in progress')
        }
      } else {
        const index = labels.indexOf('in progress')
        if (index > -1) {
          console.log(`[LABEL] Removing 'in progress' label from #${gh_number}`);
          labels.splice(index, 1)
        }
      }

      // Detection of regression
      if (existingIssue.ok) {
        const remoteState = existingIssue.value.data.state
        if (remoteState === 'closed' && (status === 'OPEN' || status === 'IN_PROGRESS')) {
          console.log(`[LABEL] Regression detected on #${gh_number}. Adding 'regression' label.`);
          if (!labels.includes('regression')) labels.push('regression')
        }
      }

      console.log(`[SYNC] Updating GitHub #${gh_number} | status: ${status} | labels: [${labels.join(', ')}]`);

      const result = await atomicAsync(() => octokit.rest.issues.update({
        owner,
        repo,
        issue_number: gh_number,
        title: title,
        body: formatGitHubBody(attributes, body),
        labels: labels,
        state: (status === 'CLOSED' ? 'closed' : 'open')
      }));
      if (!result.ok) {
        console.error(`[ERROR] Failed to update issue #${gh_number}:`, result.error);
        continue;
      }
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
