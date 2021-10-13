import { Build, Class, Gears, GearType } from '../types/build'
import { Item, Tier } from '../types/wynn'
import { randomPickOne, WeightedDie } from '../random'
import { buildKeyToGearType, classToWeaponType } from './maps'

interface RandomGear {
  pickRandomOne(type: GearType): Item | undefined
}

export const buildCandidateGenerator = (gears: Gears): RandomGear => {
  const tierToWeight: { [key in Tier]: number } = {
    Normal: 1,
    Unique: 2,
    Rare: 3,
    Legendary: 4,
    Fabled: 5,
    Mythic: 6,
    Set: 2
  }

  const dice: { [key in keyof Gears]: WeightedDie } =
    Object.fromEntries(Object.entries(gears).map(([type, items]) =>
      [type, WeightedDie.fromWeightFn(items.length, (i) => items[i].level * tierToWeight[items[i].tier])]))
  return new class implements RandomGear {
    pickRandomOne(type: GearType): Item | undefined {
      const i = dice[type]!.roll()
      return gears[type]![i]
    }
  }
}

export const neighbor = (b: Build, gears: RandomGear, classConstraint: Class | undefined): Build => {
  // TODO: consider powdering, but could be too complex
  // TODO: a way to swap 2 or more pieces at once
  const next: Build = {}
  Object.assign(next, b)

  const changeBuildKey = randomPickOne(Object.keys(buildKeyToGearType) as (keyof Build)[])
  const changeGearType: GearType =
    changeBuildKey !== 'weapon'
      ? buildKeyToGearType[changeBuildKey]
      : classConstraint === undefined
        ? randomPickOne(['Bow', 'Wand', 'Spear', 'Dagger', 'Relik'])
        : classToWeaponType[classConstraint]

  next[changeBuildKey] = gears.pickRandomOne(changeGearType)
  return next
}
