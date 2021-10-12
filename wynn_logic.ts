import { Build, Class, Gears, GearType } from './types/build'
import { Item, WeaponType } from './types/wynn'
import {
  attackSpeedToMultiplier,
  buildKeyToGearType,
  classToWeaponType,
  damageStringToAvg,
  weaponTypeToClass
} from './maps'
import { clamp, nextPermutation, randomPickOne } from './utils'

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

const isValidEquipOrder = (b: Build, order: (Exclude<keyof Build, 'weapon'>)[], manualSP: number): [boolean, number] => {
  const manualAssign = [0, 0, 0, 0, 0]
  const spReq = [0, 0, 0, 0, 0]
  const spBoost = [0, 0, 0, 0, 0]
  const spReqFieldNames = ['strength', 'dexterity', 'intelligence', 'defense', 'agility'] as const
  const spBoostFieldNames = ['strengthPoints', 'dexterityPoints', 'intelligencePoints', 'defensePoints', 'agilityPoints'] as const

  const check = (item: Item): boolean => {
    for (let spIndex = 0; spIndex < 5; spIndex++) {
      const req = item[spReqFieldNames[spIndex]]
      const boost = item[spBoostFieldNames[spIndex]]

      // can you wear the piece?
      manualAssign[spIndex] = Math.max(manualAssign[spIndex], req - spBoost[spIndex])
      if (100 < manualAssign[spIndex]) return false
      // does it not exceed the maximum assignable manual SP?
      if (manualSP < manualAssign.reduce((acc, cur) => acc + cur, 0)) return false

      // wear the piece
      spReq[spIndex] = Math.max(spReq[spIndex], req)
      spBoost[spIndex] += boost

      // is requirement satisfied after wearing the piece?
      if (manualAssign[spIndex] + spBoost[spIndex] < spReq[spIndex]) return false
    }
    return true
  }

  for (let i = 0; i < order.length; i++){
    const item = b[order[i]]
    if (item === undefined) continue

    if (!check(item)) return [false, i]
  }

  if (b.weapon !== undefined && !check(b.weapon)) return [false, order.length-1]

  return [true, -1]
}

// strictly checks SP requirement by considering the equip order
const strictCheckSPRequirement = (b: Build, level: number): boolean => {
  let currentOrder: (Exclude<keyof Build, 'weapon'>)[] =
    ['helmet', 'chestplate', 'leggings', 'boots', 'ring1', 'ring2', 'bracelet', 'necklace']
  currentOrder.sort()
  const order: readonly (Exclude<keyof Build, 'weapon'>)[] = currentOrder.slice()

  const nextCheck = (invalidAt: number): boolean => {
    if (invalidAt >= order.length-2) return nextPermutation(currentOrder)
    currentOrder = currentOrder.slice(0, invalidAt+1).concat(currentOrder.slice(invalidAt+1).sort().reverse())
    return nextPermutation(currentOrder)
  }

  const manualSP = levelToSP(level)
  let [ok, invalidAt] = isValidEquipOrder(b, currentOrder, manualSP)
  if (ok) {
    return true
  }
  while (nextCheck(invalidAt)) {
    [ok, invalidAt] = isValidEquipOrder(b, currentOrder, manualSP)
    if (ok) {
      return true
    }
  }
  console.log('strict sp check fail')
  return false
}

export const isValidBuild = (b: Build, classConstraint: Class | undefined, level: number): boolean => {
  // fast check sp requirements
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

  const manualSPAssign = spReq
    .map((req, i) => Math.max(spReq[i] - spBoost[i], 0))
  // check 100+ manual assign => invalid
  for (const manualAssign of manualSPAssign) {
    if (100 < manualAssign) return false
  }
  if (levelToSP(level) < manualSPAssign.reduce((acc, cur) => acc + cur, 0)) return false

  // strict check sp requirements; could be computationally expensive
  if (!strictCheckSPRequirement(b, level)) return false

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
