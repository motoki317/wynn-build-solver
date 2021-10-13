import { Item } from '../types/wynn'
import { Build } from '../types/build'
import { attackSpeedToMultiplier, damageStringToAvg, spToIDBoost } from './maps'

type NumberItemKeys = Exclude<{ [K in keyof Item]: Item[K] extends number ?  K : never }[keyof Item], undefined>
export const sumOfID = (b: Build, fieldName: NumberItemKeys): number =>
  Object.values(b).map((item) => item[fieldName])
    .reduce((acc, cur) => acc + cur, 0)

export const idBoosts = (b: Build): {
  melee: {
    neutral: number
    elemental: number[]
  },
  spell: {
    neutral: number
    elemental: number[]
  }
} => {
  const spIDBoosts = spFinal(b).map((sp) => spToIDBoost(sp))
  const elementalDamage: NumberItemKeys[] = ['bonusEarthDamage', 'bonusThunderDamage', 'bonusWaterDamage', 'bonusFireDamage', 'bonusAirDamage']
  return {
    melee: {
      neutral: sumOfID(b, 'damageBonus') / 100,
      elemental: spIDBoosts.map((sp, i) => sp + sumOfID(b, 'damageBonus') / 100 + sumOfID(b, elementalDamage[i]) / 100),
    },
    spell: {
      neutral: sumOfID(b, 'spellDamage') / 100,
      elemental: spIDBoosts.map((sp, i) => sp + sumOfID(b, 'spellDamage') / 100 + sumOfID(b, elementalDamage[i]) / 100),
    }
  }
}

export const dps = (b: Build): {
  melee: {
    neutral: number
    elemental: number[]
  },
  spell: {
    neutral: number
    elemental: number[]
  }
} => {
  if (b.weapon === undefined) {
    return {
      melee: {
        neutral: 0,
        elemental: [0, 0, 0, 0, 0]
      },
      spell: {
        neutral: 0,
        elemental: [0, 0, 0, 0, 0]
      }
    }
  }
  if (b.weapon.attackSpeed === undefined) throw new Error(`attack speed is undefined for item ${b.weapon.name}`)

  const neutral = damageStringToAvg(b.weapon.damage ?? '')
  const elemental = [
    damageStringToAvg(b.weapon.earthDamage ?? ''),
    damageStringToAvg(b.weapon.thunderDamage ?? ''),
    damageStringToAvg(b.weapon.waterDamage ?? ''),
    damageStringToAvg(b.weapon.fireDamage ?? ''),
    damageStringToAvg(b.weapon.airDamage ?? '')
  ]

  const poison = sumOfID(b, 'poison') / 3

  const rawMelee = sumOfID(b, 'damageBonusRaw')
  const rawSpell = sumOfID(b, 'spellDamageRaw')
  const rawRainbowSpell =
    Object.values(b).map((item) => item.rainbowSpellDamageRaw ?? 0)
      .reduce((acc, cur) => acc + cur, 0)

  const idBoost = idBoosts(b)

  const [str, dex] = spFinal(b).map((sp) => spToIDBoost(sp))

  const attackSpeedMultiplier = attackSpeedToMultiplier[b.weapon.attackSpeed]

  // TODO: consider element conversion of each spells
  // TODO: consider powdering
  return {
    melee: {
      neutral: ((neutral * Math.max(0, 1 + idBoost.melee.neutral) + rawMelee) * attackSpeedMultiplier + poison) * (1 + str + dex),
      elemental: elemental.map((base, i) => base * Math.max(0, 1 + idBoost.melee.elemental[i]) * attackSpeedMultiplier * (1 + str + dex)),
    },
    spell: {
      neutral: (neutral * Math.max(0, 1 + idBoost.spell.neutral) * attackSpeedMultiplier + poison + rawSpell) * (1 + str + dex),
      elemental: elemental.map((base, i) => (base + rawRainbowSpell) * Math.max(0, 1 + idBoost.melee.elemental[i]) * attackSpeedMultiplier * (1 + str + dex)),
    }
  }
}

// returns maximum skill point requirement in the given build
export const spReq = (b: Build): number[] => {
  const spReq = [0, 0, 0, 0, 0]
  const spReqFieldNames = ['strength', 'dexterity', 'intelligence', 'defense', 'agility'] as const
  Object.values(b).forEach((item: Item) => {
    for (let i = 0; i < 5; i++) {
      spReq[i] = Math.max(spReq[i], item[spReqFieldNames[i]])
    }
  })
  return spReq
}

// returns the sum of skill point bonus in the given build
export const spBonus = (b: Build): number[] => {
  const spBonus = [0, 0, 0, 0, 0]
  const spBonusFieldNames = ['strengthPoints', 'dexterityPoints', 'intelligencePoints', 'defensePoints', 'agilityPoints'] as const
  Object.values(b).forEach((item: Item) => {
    for (let i = 0; i < 5; i++) {
      spBonus[i] += item[spBonusFieldNames[i]]
    }
  })
  return spBonus
}

// returns the final skill point in the given build
export const spFinal = (b: Build): number[] => {
  const req = spReq(b)
  const bonus = spBonus(b)
  // TODO: consider equip order and optimize final manual assign sp
  const manualAssign = req.map((_, i) => Math.max(req[i] - bonus[i], 0))
  return manualAssign.map((_, i) => manualAssign[i] + bonus[i])
}
