/**
 * Result Pattern for Zero-Exception Methodology (ZEM)
 */
export type Result<T, E = string> =
    | { ok: true; value: T }
    | { ok: false; error: E }

export const Ok = <T,>(value: T): Result<T, never> =>
    ({ ok: true, value })

export const Err = <E,>(error: E): Result<never, E> =>
    ({ ok: false, error })

export const atomic = <T>(fn: () => T): Result<T> => {
    try {
        return Ok(fn())
    } catch (e: unknown) {
        return Err(e instanceof Error ? e.message : String(e))
    }
}

/**
 * atomicAsync: A non-throwing runner for async functions
 */
export const atomicAsync = async <T>(fn: () => Promise<T>): Promise<Result<T>> => {
    try {
        return Ok(await fn())
    } catch (e: unknown) {
        return Err(e instanceof Error ? e.message : String(e))
    }
}

export const fromPromise = async <T>(promise: Promise<T>): Promise<Result<T>> => {
    try {
        const value = await promise
        return Ok(value)
    } catch (e: unknown) {
        return Err(e instanceof Error ? e.message : String(e))
    }
}

export const Result = {
    fromPromise,
    Ok,
    Err,
    atomic,
    atomicAsync
}
