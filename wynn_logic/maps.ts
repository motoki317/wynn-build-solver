import { Build, Class, GearType } from '../types/build'
import { AttackSpeed, WeaponType } from '../types/wynn'
import { clamp } from '../utils'

export const buildKeyToGearType: { [key in Exclude<keyof Build, undefined>]: GearType } = {
  'helmet': 'Helmet',
  'chestplate': 'Chestplate',
  'leggings': 'Leggings',
  'boots': 'Boots',
  'ring1': 'Ring',
  'ring2': 'Ring',
  'bracelet': 'Bracelet',
  'necklace': 'Necklace',
  'weapon': 'Bow' // replace by randomPickOne(weaponTypes)
}

export const classToWeaponType: { [key in Class]: WeaponType } = {
  'Archer': 'Bow',
  'Mage': 'Wand',
  'Warrior': 'Spear',
  'Assassin': 'Dagger',
  'Shaman': 'Relik'
}

export const weaponTypeToClass = Object.fromEntries(
  Object.entries(classToWeaponType)
    .map(([cls, weapon]) => [weapon, cls as Class])) as { [key in WeaponType]: Class }

export const attackSpeedToMultiplier: { [key in AttackSpeed]: number } = {
  'SUPER_SLOW': 0.51,
  'VERY_SLOW': 0.83,
  'SLOW': 1.5,
  'NORMAL': 2.05,
  'FAST': 2.5,
  'VERY_FAST': 3.1,
  'SUPER_FAST': 4.3
}

export const damageStringToMinMax = (s: string): [min: number, max: number] => {
  const damages = s.split('-').map((ss) => +ss)
  if (damages.length !== 2) throw new Error(`malformed damage string: ${s}`)
  return [damages[0], damages[1]]
}
export const damageStringToAvg = (s: string): number => {
  const [min, max] = damageStringToMinMax(s)
  return (min + max) / 2
}

const spToPercentage: readonly number[] =
  [0, 1, 2, 2.9, 3.9, 4.9, 5.8, 6.7, 7.7, 8.6,
    9.5, 10.4, 11.3, 12.2, 13.1, 13.9, 14.8, 15.7, 16.5, 17.3,
    18.2, 19, 19.8, 20.6, 21.4, 22.2, 23, 23.8, 24.6, 25.3,
    26.1, 26.8, 27.6, 28.3, 29, 29.8, 30.5, 31.2, 31.9, 32.6,
    33.3, 34, 34.6, 35.3, 36, 36.6, 37.3, 37.9, 38.6, 39.2,
    39.9, 40.5, 41.1, 41.7, 42.3, 42.9, 43.5, 44.1, 44.7, 45.3,
    45.8, 46.4, 47, 47.5, 48.1, 48.6, 49.2, 49.7, 50.3, 50.8,
    51.3, 51.8, 52.3, 52.8, 53.4, 53.9, 54.3, 54.8, 55.3, 55.8,
    56.3, 56.8, 57.2, 57.7, 58.1, 58.6, 59.1, 59.5, 59.9, 60.4,
    60.8, 61.3, 61.7, 62.1, 62.5, 62.9, 63.3, 63.8, 64.2, 64.6,
    65, 65.4, 65.7, 66.1, 66.5, 66.9, 67.3, 67.6, 68, 68.4,
    68.7, 69.1, 69.4, 69.8, 70.1, 70.5, 70.8, 71.2, 71.5, 71.8,
    72.2, 72.5, 72.8, 73.1, 73.5, 73.8, 74.1, 74.4, 74.7, 75,
    75.3, 75.6, 75.9, 76.2, 76.5, 76.8, 77.1, 77.3, 77.6, 77.9,
    78.2, 78.4, 78.7, 79, 79.2, 79.5, 79.8, 80, 80.3, 80.5, 80.8]

export const spToIDBoost = (sp: number): number => spToPercentage[clamp(sp, 0, 150)] / 100
