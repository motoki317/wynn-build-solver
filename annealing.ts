import { Build, Class, Gears } from './types/build'
import { HyperParameters, isValidBuild, neighbor, UtilityFunc } from './wynn_logic'

const nextTemperature = (initialTemperature: number, progress: number): number => {
  // TODO: better cooling
  return initialTemperature * progress
}

const accept = (cur: Build, next: Build, temperature: number, utilityFunc: UtilityFunc): boolean => {
  const uc = utilityFunc(cur)
  const un = utilityFunc(next)
  const acceptProb = uc < un ? 1 : Math.exp(-(uc - un) / temperature)
  return acceptProb >= Math.random()
}

export const simulatedAnnealing = (hp: HyperParameters, gears: Gears, classConstraint: Class | undefined, level: number): Build => {
  const maxInvalidRetry = 100

  let cur: Build = {}
  let best: Build = {}
  let temperature = hp.initialTemperature
  for (let k = 0; k < hp.maxIterations; k++) {
    temperature = nextTemperature(hp.initialTemperature, 1 - (k + 1) / hp.maxIterations)

    let next: Build = neighbor(cur, gears, classConstraint)
    let retry = 0
    while (!isValidBuild(next, classConstraint, level)) {
      next = neighbor(cur, gears, classConstraint)
      retry++
      if (maxInvalidRetry < retry) {
        console.warn(`no valid neighbor found within ${maxInvalidRetry} retries, current iter: ${k}, temp: ${temperature}`)
        return best
      }
    }
    if (accept(cur, next, temperature, hp.utilityFunc)) {
      cur = next
    }
    const cu = hp.utilityFunc(cur)
    const cb = hp.utilityFunc(best)
    if (cb < cu) {
      best = cur
    }

    console.log(`${k}: current utility ${cu}, best utility ${Math.max(cu, cb)}`)
  }
  return best
}
