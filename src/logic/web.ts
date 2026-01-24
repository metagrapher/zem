import { type Result, Ok, atomic } from '../algebra/Result'

export const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US",
        {
            weekday: "long"
            , year: "numeric"
            , month: "long"
            , day: "numeric"
        }).format(date)

export const safeURL = (input: string | Request | URL | any): Result<URL> => {
    if (input instanceof URL) return Ok(input)

    const urlStr =
        (typeof input === 'object' && input !== null && 'url' in input)
            ? String(input.url)
            : String(input)

    return atomic(() => new URL(urlStr))
}

export const safeJSON = <T>(input: string): Result<T> =>
    atomic(() => JSON.parse(input))
