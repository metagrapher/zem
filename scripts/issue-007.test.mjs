import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateProgress } from './src/logic/progress.ts'

test('Test A (The Solution) - SHOULD FAIL', () => {
  // Goal: Feature should calculate 100% for 1 completed task
  const tasks = [{ completed: true }]
  const result = calculateProgress(tasks)
  assert.strictEqual(result, 1, 'Progress should be 1 (100%) for 1 completed task')
})

test('Test B (The Proof) - SHOULD PASS', () => {
  // Proof: Currently it always returns 0
  const tasks = [{ completed: true }]
  const result = calculateProgress(tasks)
  console.log('Test B (The Proof) PASSED')
  assert.strictEqual(result, 0, 'Proof: Current implementation always returns 0')
})
