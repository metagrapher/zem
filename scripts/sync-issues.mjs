import fs from 'fs'
import path from 'path'
import { Octokit } from '@octokit/rest'
import fm from 'front-matter'

const ISSUES_DIR = '.issues'
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/')

const findExistingIssueByTitle = async (title) => {
  try {
    const { data } = await octokit.rest.issues.listForRepo(
      ({
        owner
        , repo
        , state: 'all'
        , per_page: 100
      }
      )
    )
    return data.find(issue => issue.title === title)
  } catch (error) {
    console.error(`Error searching for existing issue titled "${title}":`, error)
    return null
  }
}

const sync = async () => {
  const files = fs.readdirSync(ISSUES_DIR).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const filePath = path.join(ISSUES_DIR, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const { attributes, body } = fm(content)

    let gh_number = attributes.gh_number

    if (!gh_number) {
      console.log(`[SYNC] Searching GitHub for issue: "${attributes.title}"`)
      const existing = await findExistingIssueByTitle(attributes.title)
      if (existing) {
        gh_number = existing.number
        console.log(`[SYNC] Matched existing issue #${gh_number}`)
      }
    }
    if (!gh_number) {
      console.log(`Creating issue for ${file}...`);
      const { data } = await octokit.issues.create({
        owner,
        repo,
        title: attributes.title,
        body: body,
        labels: attributes.labels || []
      });
      gh_number = data.number;
      console.log(`Created GitHub Issue #${gh_number}`);
    } else {
      console.log(`Updating issue #${gh_number}...`);
      await octokit.issues.update({
        owner,
        repo,
        issue_number: gh_number,
        title: attributes.title,
        body: body,
        labels: attributes.labels || [],
        state: (attributes.status === 'CLOSED' ? 'closed' : 'open')
      });
    }

    const newContent =
      (`---\n`
        + `title: ${attributes.title}\n`
        + `status: ${attributes.status || 'OPEN'}\n`
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
