import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateProgress } from './progress.ts'

test('Test A (The Solution) - PASSED', () => {
  const tasks = [{ completed: true }]
  const result = calculateProgress(tasks)
  assert.strictEqual(result, 1, 'Progress should be 1 (100%) for 1 completed task')
})

test('Test B (The Proof) - FAILED', () => {
  const tasks = [{ completed: true }]
  const result = calculateProgress(tasks)
  assert.strictEqual(result, 1, 'Proof should fail now')
})
