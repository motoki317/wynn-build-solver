export const clamp = (n: number, min: number, max: number): number => Math.max(Math.min(n, max), min)

export const harmonicMean = (...a: number[]): number => {
  if (a.length === 0 || a.includes(0)) return 0
  return a.length / a.map((n) => 1 / n).reduce((acc, cur) => acc + cur, 0)
}

// https://play.golang.org/p/ljft9xhOEn
export const nextPermutation = <T>(a: Array<T>): boolean => {
  const n = a.length - 1
  if (n < 1) {
    return false
  }
  let j = n - 1
  for (; a[j] >= a[j+1]; j--) {
    if (j == 0) {
      return false
    }
  }
  let l = n
  while (a[j] >= a[l]) l--
  [a[j], a[l]] = [a[l], a[j]]
  let k = j+1
  l = n
  for (; k < l;) {
    [a[k], a[l]] = [a[l], a[k]]
    k++
    l--
  }
  return true
}
