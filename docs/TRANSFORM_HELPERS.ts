import { type Result, Ok } from '../src/algebra/Result'

export const chain = <T, E, U>(result: Result<T, E>, fn: (val: T) => Result<U, E>): Result<U, E> =>
    result.ok ? fn(result.value) : result as unknown as Result<U, E>

export const map = <T, E, U>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> =>
    result.ok ? Ok(fn(result.value)) : result as unknown as Result<U, E>

export const fold = <T, E, U>(result: Result<T, E>, match: { ok: (v: T) => U, err: (e: E) => U }): U =>
    result.ok ? match.ok(result.value) : match.err(result.error)

export const sequence = <T, E>(results: Result<T, E>[]): Result<T[], E> =>
    results.reduce((acc: Result<T[], E>, r) =>
        acc.ok
            ? (r.ok ? Ok([...acc.value, r.value]) : r as unknown as Result<T[], E>)
            : acc
        , Ok([] as T[]) as Result<T[], E>)

export const tap = <T, E>(result: Result<T, E>, fn: (val: T) => void): Result<T, E> => {
    if (result.ok) fn(result.value)
    return result
}
