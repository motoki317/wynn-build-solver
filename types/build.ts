import { AccessoryType, Item, Type } from './wynn'

export type GearType = Type | AccessoryType
export type Gears = { [key in GearType]?: Item[] }
export type Class = 'Archer' | 'Mage' | 'Warrior' | 'Assassin' | 'Shaman'

export interface Build {
  helmet?: Item
  chestplate?: Item
  leggings?: Item
  boots?: Item
  ring1?: Item
  ring2?: Item
  bracelet?: Item
  necklace?: Item
  weapon?: Item
}
