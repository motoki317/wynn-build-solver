export const randomIntn = (n: number): number => Math.floor(Math.random() * n)
export const randomPickOne = <T>(a: readonly T[]): T => {
  if (a.length === 0) throw new Error('array is empty')
  return a[randomIntn(a.length)]
}
export const clamp = (n: number, min: number, max: number): number => Math.max(Math.min(n, max), min)
