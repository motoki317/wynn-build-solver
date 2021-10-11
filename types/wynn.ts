export type Tier = 'Normal' | 'Unique' | 'Rare' | 'Legendary' | 'Fabled' | 'Mythic' | 'Set'
export type ArmorType = 'Helmet' | 'Chestplate' | 'Leggings' | 'Boots'
export type WeaponType = 'Bow' | 'Wand' | 'Spear' | 'Dagger' | 'Relik'
export type Type = ArmorType | WeaponType
export type AccessoryType = 'Ring' | 'Bracelet' | 'Necklace'
export type Category = 'armor' | 'weapon' | 'accessory'
export type AttackSpeed = 'SUPER_SLOW' | 'VERY_SLOW' | 'SLOW' | 'NORMAL' | 'FAST' | 'VERY_FAST' | 'SUPER_FAST'

export interface Item {
  name: string
  tier: Tier
  type?: Type
  set: null | string
  restrictions?: string | null
  material?: number | null | string
  armorType?: string
  armorColor?: number | string
  dropType: string
  addedLore?: null | string
  sockets: number
  health?: number
  earthDefense?: number
  thunderDefense?: number
  waterDefense?: number
  fireDefense?: number
  airDefense?: number

  level: number
  quest: null | string
  classRequirement?: null | string
  strength: number
  dexterity: number
  intelligence: number
  defense: number
  agility: number

  strengthPoints: number
  dexterityPoints: number
  intelligencePoints: number
  defensePoints: number
  agilityPoints: number
  damageBonus: number
  damageBonusRaw: number
  spellDamage: number
  spellDamageRaw: number
  rainbowSpellDamageRaw?: number
  healthRegen: number
  healthRegenRaw: number
  healthBonus: number
  poison: number
  lifeSteal: number
  manaRegen: number
  manaSteal: number
  spellCostPct1?: number
  spellCostRaw1?: number
  spellCostPct2?: number
  spellCostRaw2?: number
  spellCostPct3?: number
  spellCostRaw3?: number
  spellCostPct4?: number
  spellCostRaw4?: number
  thorns: number
  reflection: number
  attackSpeedBonus: number
  speed: number
  exploding: number
  soulPoints: number
  sprint?: number
  sprintRegen?: number
  jumpHeight?: number
  xpBonus: number
  lootBonus: number
  lootQuality?: number
  emeraldStealing: number
  gatherXpBonus?: number
  gatherSpeed?: number
  bonusEarthDamage: number
  bonusThunderDamage: number
  bonusWaterDamage: number
  bonusFireDamage: number
  bonusAirDamage: number
  bonusEarthDefense: number
  bonusThunderDefense: number
  bonusWaterDefense: number
  bonusFireDefense: number
  bonusAirDefense: number
  category: Category

  damage?: string
  earthDamage?: string
  thunderDamage?: string
  waterDamage?: string
  fireDamage?: string
  airDamage?: string
  attackSpeed?: AttackSpeed
  accessoryType?: AccessoryType
  displayName?: string
  majorIds?: string[]
  identified?: boolean
  allowCraftsman?: boolean
  skin?: string
}

export interface ItemDB {
  items: Item[]
  request: {
    timestamp: number,
    version: string
  }
}
