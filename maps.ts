import { Build, Class, GearType } from './types/build'
import { AttackSpeed, WeaponType } from './types/wynn'

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
