import { test } from 'node:test'
import assert from 'node:assert/strict'

// Logic extracted from structural-audit.ts
const detectDuplicates = (contents: string[]) => {
  const ghNumberMap: Record<string, number> = {}
  const duplicates: string[] = []

  contents.forEach(content => {
    const match = content.match(/gh_number:\s*(\d+)/)
    if (match) {
      const num = match[1]
      ghNumberMap[num] = (ghNumberMap[num] || 0) + 1
      if (ghNumberMap[num] === 2) duplicates.push(num)
    }
  })
  return duplicates
}

test('Issue #17: detectDuplicates correctly identify overlapping gh_numbers', () => {
  const files = [
    'gh_number: 10',
    'gh_number: 11',
    'gh_number: 10' // Duplicate
  ]
  const duplicates = detectDuplicates(files)
  assert.deepStrictEqual(duplicates, ['10'], 'Detected duplicate gh_number 10')
})

test('Issue #17: No duplicates report empty list', () => {
  const files = [
    'gh_number: 10',
    'gh_number: 11'
  ]
  const duplicates = detectDuplicates(files)
  assert.deepStrictEqual(duplicates, [], 'No duplicates detected')
})
