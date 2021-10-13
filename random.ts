export const randomIntn = (n: number): number => Math.floor(Math.random() * n)
export const randomPickOne = <T>(a: readonly T[]): T => {
  if (a.length === 0) throw new Error('array is empty')
  return a[randomIntn(a.length)]
}

export class WeightedDie {
  private readonly n: number
  private readonly prob: readonly number[]
  private readonly alias: readonly number[]

  public static fromWeightFn(n: number, weight: (i: number) => number): WeightedDie {
    return new WeightedDie(new Array(n).fill(0).map((_, i) => weight(i)))
  }

  public constructor(weights: number[]) {
    // https://en.wikipedia.org/wiki/Alias_method
    // https://stackoverflow.com/a/39199014
    const n = weights.length
    const sum = weights.reduce((acc, cur) => acc + cur, 0)
    const p = weights.map((w) => w / sum)

    const prob = new Array(n).fill(0)
    const alias = new Array(n).fill(0)

    const small: number[] = []
    const large: number[] = []
    p.forEach((pp, i) => {
      if (pp < 1) small.push(i)
      else large.push(i)
    })

    while (small.length > 0 && large.length > 0) {
      const l = small.shift()!
      const g = large.shift()!
      prob[l] = p[l]
      alias[l] = g
      p[g] = (p[g] + p[l]) - 1
      if (p[g] < 1) small.push(g)
      else large.push(g)
    }
    while (large.length > 0) {
      const g = large.shift()!
      prob[g] = 1
    }
    while (small.length > 0) {
      const l = small.shift()!
      prob[l] = 1
    }

    this.n = n
    this.prob = prob
    this.alias = alias
  }

  public roll(): number {
    const i = randomIntn(this.n)
    if (Math.random() < this.prob[i]) return i
    else return this.alias[i]
  }
}
