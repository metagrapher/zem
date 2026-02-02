declare const Ok: <T>(value: T) => Result<T, never>;
declare const Err: <E>(error: E) => Result<never, E>;
declare const atomic: <T>(fn: () => T) => Result<T>;
/**
 * atomicAsync: A non-throwing runner for async functions
 */
declare const atomicAsync: <T>(fn: () => Promise<T>) => Promise<Result<T>>;
declare const fromPromise: <T>(promise: Promise<T>) => Promise<Result<T>>;
/**
 * Result Pattern for Zero-Exception Methodology (ZEM)
 */
type Result<T, E = string> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
declare const Result: {
    fromPromise: <T>(promise: Promise<T>) => Promise<Result<T>>;
    Ok: <T>(value: T) => Result<T, never>;
    Err: <E>(error: E) => Result<never, E>;
    atomic: <T>(fn: () => T) => Result<T>;
    atomicAsync: <T>(fn: () => Promise<T>) => Promise<Result<T>>;
};

type Maybe<T> = Result<T, void>;
type IO<T, E = string> = () => Result<T, E>;
type State<S, T, E = string> = (s: S) => Result<[T, S], E>;

/**
 * choice: Selects the first successful Result or returns the last error.
 * Implements the Alternative monad pattern.
 */
declare const choice: <T, E>(...results: Result<T, E>[]) => Result<T, E>;

declare const chain: <T, E, U>(result: Result<T, E>, fn: (val: T) => Result<U, E>) => Result<U, E>;
declare const map: <T, E, U>(result: Result<T, E>, fn: (val: T) => U) => Result<U, E>;
declare const fold: <T, E, U>(result: Result<T, E>, match: {
    ok: (v: T) => U;
    err: (e: E) => U;
}) => U;
declare const sequence: <T, E>(results: Result<T, E>[]) => Result<T[], E>;
declare const tap: <T, E>(result: Result<T, E>, fn: (val: T) => void) => Result<T, E>;

declare const identity: <T>(v: T) => T;
declare const constant: <T>(v: T) => () => T;
declare const curry: (fn: Function) => (...args: any[]) => any;
declare const pipe: <T>(value: T, ...fns: Function[]) => any;
declare const compose: (...fns: Function[]) => (value: any) => any;

declare const formatDate: (date: Date) => string;
declare const safeURL: (input: string | Request | URL | unknown) => Result<URL>;
declare const safeJSON: <T>(input: string) => Result<T>;

declare const toHex: (buffer: ArrayBuffer) => string;
declare const fromHex: (hex: string) => Uint8Array;

export { Err, type IO, type Maybe, Ok, Result, type State, atomic, atomicAsync, chain, choice, compose, constant, curry, fold, formatDate, fromHex, fromPromise, identity, map, pipe, safeJSON, safeURL, sequence, tap, toHex };
