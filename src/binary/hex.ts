export const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

export const fromHex = (hex: string): Uint8Array => {
    const pairs = hex.match(/.{1,2}/g) || []
    return new Uint8Array(pairs.map(byte => parseInt(byte, 16)))
}
