export const identity = <T>(v: T): T => v

export const constant = <T>(v: T) => () => v

export const curry = (fn: Function) => {
    const curried = (...args: any[]) =>
        args.length >= fn.length
            ? fn(...args)
            : (...nextArgs: any[]) => curried(...args, ...nextArgs)
    return curried
}

export const pipe = <T>(value: T, ...fns: Function[]): any =>
    fns.reduce((acc, fn) => fn(acc), value)

export const compose = (...fns: Function[]) =>
    (value: any) => fns.reduceRight((acc, fn) => fn(acc), value)
