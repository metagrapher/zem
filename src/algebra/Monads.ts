import type { Result } from './Result.ts'

export type Maybe<T> = Result<T, void>

export type IO<T, E = string> = () => Result<T, E>

export type State<S, T, E = string> = (s: S) => Result<[T, S], E>
