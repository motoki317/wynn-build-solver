import { Build, Class, Gears, GearType } from './types/build'
import { Item, WeaponType } from './types/wynn'
import {
  attackSpeedToMultiplier,
  buildKeyToGearType,
  classToWeaponType,
  damageStringToAvg,
  weaponTypeToClass
} from './maps'
import { clamp, randomPickOne } from './utils'

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
    name: 'dps',
    utilityFunc: (b: Build): number => {
      if (b.weapon === undefined || b.weapon.attackSpeed === undefined) return 0

      // TODO: consider ID and SP boosts
      const totalDamage = [
        damageStringToAvg(b.weapon.damage ?? ''),
        damageStringToAvg(b.weapon.earthDamage ?? ''),
        damageStringToAvg(b.weapon.thunderDamage ?? ''),
        damageStringToAvg(b.weapon.waterDamage ?? ''),
        damageStringToAvg(b.weapon.fireDamage ?? ''),
        damageStringToAvg(b.weapon.airDamage ?? '')
      ].reduce((acc, cur) => acc + cur, 0)
      return totalDamage * attackSpeedToMultiplier[b.weapon.attackSpeed]
    },
    maxIterations: 20000,
    initialTemperature: 500
  },
  {
    name: 'balanced',
    utilityFunc: (b: Build): number => {
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

export const neighbor = (b: Build, gears: Gears, classConstraint: Class | undefined): Build => {
  // TODO: consider powdering, but could be too complex
  const next: Build = {}
  Object.assign(next, b)

  const changeBuildKey = randomPickOne(Object.keys(buildKeyToGearType) as (keyof Build)[])
  const changeGearType: GearType =
    changeBuildKey !== 'weapon'
      ? buildKeyToGearType[changeBuildKey]
      : classConstraint === undefined
        ? randomPickOne(['Bow', 'Wand', 'Spear', 'Dagger', 'Relik'])
        : classToWeaponType[classConstraint]

  const possibleGears = gears[changeGearType]
  if (possibleGears === undefined || possibleGears.length === 0) {
    console.warn(`gears had empty array of undefined for gear type ${changeGearType}`)
    next[changeBuildKey] = undefined
  } else {
    // TODO: efficient candidate generation
    next[changeBuildKey] = randomPickOne(possibleGears)
  }
  return next
}

const levelToSP = (level: number): number => (clamp(level, 1, 101) - 1) * 2

export const isValidBuild = (b: Build, classConstraint: Class | undefined, level: number): boolean => {
  // TODO: consider equip order, but could be computationally expensive
  // sp requirements
  const spReq = [0, 0, 0, 0, 0]
  const spBoost = [0, 0, 0, 0, 0]
  const spReqFieldNames = ['strength', 'dexterity', 'intelligence', 'defense', 'agility'] as const
  const spBoostFieldNames = ['strengthPoints', 'dexterityPoints', 'intelligencePoints', 'defensePoints', 'agilityPoints'] as const

  Object.values(b).forEach((item: Item) => {
    for (let i = 0; i < 5; i++) {
      spReq[i] = Math.max(spReq[i], item[spReqFieldNames[i]])
      spBoost[i] += item[spBoostFieldNames[i]]
    }
  })

  const spNeedToAssign = spReq
    .map((req, i) => Math.max(spReq[i] - spBoost[i], 0))
  // check 100+ manual assign => invalid
  for (const manualAssign of spNeedToAssign) {
    if (manualAssign > 100) return false
  }
  if (spNeedToAssign.reduce((acc, cur) => acc + cur, 0) > levelToSP(level)) return false

  // class constraints
  if (b.weapon !== undefined) {
    if (b.weapon.type === undefined) throw new Error('weapon type is undefined')
    const curClass = weaponTypeToClass[b.weapon.type as WeaponType]
    classConstraint ??= curClass
    if (curClass !== classConstraint) return false
  }
  if (classConstraint !== undefined) {
    for (const item of Object.values(b) as Item[]) {
      if (item.classRequirement && item.classRequirement !== classConstraint) return false
    }
  }

  // level constraints
  for (const item of Object.values(b) as Item[]) {
    if (level < item.level) return false
  }

  return true
}
