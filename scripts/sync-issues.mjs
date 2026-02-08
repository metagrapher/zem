import fs from 'fs'
import path from 'path'
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

const findFiles = (dir) => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(file => {
    const res = path.join(dir, file.name)
    return file.isDirectory() ? findFiles(res) : (file.name.endsWith('.md') ? [res] : [])
  })
}

const sync = async () => {
  const filePaths = findFiles(ISSUES_DIR)

  for (const filePath of filePaths) {
    const file = path.relative(ISSUES_DIR, filePath)
    const content = fs.readFileSync(filePath, 'utf8')
    const { attributes, body } = fm(content)
    const title = attributes.title || body.split('\n')[0].replace(/^#\s(Issue\s\d+:\s)?/, '').trim()
    const isClosed = attributes.status === 'CLOSED' || filePath.includes('/CLOSED/')
    const status = isClosed ? 'CLOSED' : 'OPEN'

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
      const result = await atomicAsync(() => octokit.issues.create({
        owner,
        repo,
        title: title,
        body: body,
        labels: attributes.labels || []
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
      const result = await atomicAsync(() => octokit.issues.update({
        owner,
        repo,
        issue_number: gh_number,
        title: title,
        body: body,
        labels: attributes.labels || [],
        state: (status === 'CLOSED' ? 'closed' : 'open')
      }));
      if (!result.ok) {
        console.error(`[ERROR] Failed to update issue #${gh_number}:`, result.error);
        continue;
      }
    }

    const newContent =
      (`---\n`
        + `title: ${title}\n`
        + `status: ${status}\n`
        + `gh_number: ${gh_number}\n`
        + `---\n`
        + `${body}`
      )

    if (newContent.trim() !== content.trim()) {
      console.log(`[SYNC] Updating local file: ${file}`)
      fs.writeFileSync(filePath, newContent)
    }
  }
}

sync().catch(err => {
  console.error('[FATAL] Sync failed:', err)
  process.exit(1)
})
