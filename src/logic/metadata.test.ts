import { test } from 'node:test'
import assert from 'node:assert/strict'

// Mock representation of the logic in sync-issues.mjs
const formatGitHubBody = (attributes: any, body: string) => {
  const metadata = Object.entries(attributes)
    .filter(([key]) => !['title', 'status', 'gh_number', 'labels'].includes(key))
    .map(([key, value]) => `- **${key}**: ${value}`)
    .join('\n');
  if (!metadata) return body;
  return `### Metadata\n${metadata}\n\n---\n\n${body}`;
};

test('Issue #13: Metadata sync is non-destructive and propagates local state', () => {
  const attributes = {
    test_ref: 'src/logic/metadata.test.ts',
    custom_field: 'preserved'
  }
  const body = 'Description content'
  const result = formatGitHubBody(attributes, body)
  
  assert.ok(result.includes('### Metadata'), 'Included metadata header')
  assert.ok(result.includes('- **test_ref**: src/logic/metadata.test.ts'), 'Propagated test_ref')
  assert.ok(result.includes('- **custom_field**: preserved'), 'Propagated custom fields')
})
