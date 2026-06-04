export function normalizeLimit(value: unknown, maxLimit: number = 10): number {
    const num = Number(value)
    if (isNaN(num) || num < 1) return maxLimit
    return Math.min(num, maxLimit)
}