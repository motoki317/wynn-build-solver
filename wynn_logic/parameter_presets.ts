import { Build } from '../types/build'
import { dps } from './build'

export type UtilityFunc = (b: Build) => number

export interface HyperParameters {
  name: string
  utilityFunc: UtilityFunc
  maxIterations: number
  initialTemperature: number
}

// TODO: better initial temperature according to utility func
export const parameterPresets: HyperParameters[] = [
  {
    name: 'hpTest',
    utilityFunc: (b: Build): number => {
      let hp = 0
      Object.values(b).forEach((item) => {
        hp += item.health ?? 0
        hp += item.healthBonus ?? 0
      })
      return hp
    },
    maxIterations: 20000,
    initialTemperature: 2000
  },
  {
    name: 'dps melee',
    utilityFunc: (b: Build): number => {
      const d = dps(b)
      return d.melee.neutral + d.melee.elemental.reduce((acc, cur) => acc + cur, 0)
    },
    maxIterations: 20000,
    initialTemperature: 2000
  },
  {
    name: 'dps spell',
    utilityFunc: (b: Build): number => {
      const d = dps(b)
      return d.spell.neutral + d.spell.elemental.reduce((acc, cur) => acc + cur, 0)
    },
    maxIterations: 20000,
    initialTemperature: 1000
  },
  {
    name: 'balanced',
    utilityFunc: (b: Build): number => {
      // TODO: balanced?
      let hp = 0
      Object.values(b).forEach((item) => {
        hp += item.health ?? 0
        hp += item.healthBonus ?? 0
      })
      return hp
    },
    maxIterations: 20000,
    initialTemperature: 500
  }
]
