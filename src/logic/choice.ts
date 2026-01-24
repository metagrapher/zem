import { type Result, Err } from '../algebra/Result'

/**
 * choice: Selects the first successful Result or returns the last error.
 * Implements the Alternative monad pattern.
 */
export const choice = <T, E>(...results: Result<T, E>[]): Result<T, E> =>
    results.find(r => r.ok) || results[results.length - 1] || Err('EMPTY_CHOICE' as any)
