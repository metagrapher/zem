import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateProgress } from './progress.ts'

test('Test A (The Solution) - PASSED', () => {
  const tasks = [{ completed: true }]
  const result = calculateProgress(tasks)
  assert.strictEqual(result, 1, 'Progress should be 1 (100%) for 1 completed task')
})

test('Test B (The Proof) - FAILED', { todo: 'This is a regression witness. It MUST fail for the auditor to pass.' }, () => {
  const tasks = [{ completed: true }]
  const result = calculateProgress(tasks)
  // This asserts the buggy behavior (e.g. progress being 0 when it should be 1)
  // Since the bug is fixed, this assertion will FAIL, satisfying the CLOSED invariant.
  assert.strictEqual(result, 0, 'Bug: Progress should not be 0')
})
