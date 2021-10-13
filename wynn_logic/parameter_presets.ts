import { Build } from '../types/build'
import { dps, effectiveHP } from './build'
import { harmonicMean } from '../utils'

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
    name: 'effective hp',
    utilityFunc: (b: Build): number => {
      return effectiveHP(b)
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
    maxIterations: 5000,
    initialTemperature: 500
  },
  {
    name: 'melee * ehp',
    utilityFunc: (b: Build): number => {
      const ehp = effectiveHP(b)
      const d = dps(b)
      const melee = d.melee.neutral + d.melee.elemental.reduce((acc, cur) => acc + cur, 0)
      return harmonicMean(melee * 8, ehp)
    },
    maxIterations: 5000,
    initialTemperature: 1000
  },
  {
    name: 'spell * ehp',
    utilityFunc: (b: Build): number => {
      const ehp = effectiveHP(b)
      const d = dps(b)
      const spell = d.spell.neutral + d.spell.elemental.reduce((acc, cur) => acc + cur, 0)
      return harmonicMean(spell * 8, ehp)
    },
    maxIterations: 5000,
    initialTemperature: 1000
  }
]
