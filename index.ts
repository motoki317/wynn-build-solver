import * as fs from 'fs'
import { simulatedAnnealing } from './annealing'
import { parameterPresets } from './wynn_logic/parameter_presets'
import { printBuild } from './encoder'
import { ItemDB } from './types/wynn'
import { Gears } from './types/build'
import { dps, effectiveHP, idBoosts, spFinal } from './wynn_logic/build'

// Load data

const itemDB: ItemDB = JSON.parse(fs.readFileSync('itemDB.json', 'utf-8'))
const gears = itemDB.items.reduce<Gears>((obj, item) => {
  const gearType = item.type || item.accessoryType
  if (gearType === undefined) throw new Error('an item has neither type or accessoryType field')
  if (Object.prototype.hasOwnProperty.call(obj, gearType)) {
    obj[gearType]?.push(item)
  } else {
    obj[gearType] = [item]
  }
  return obj
}, {})

interface WynnBuilderItem {
  name: string
  id: number
}

const wynnBuilderDB: WynnBuilderItem[] = JSON.parse(fs.readFileSync('wynn_builder_compress.json', 'utf-8'))
const wynnBuilderItemMap: { [name: string]: number } = Object.fromEntries(wynnBuilderDB.map((item) => [item.name, item.id]))

// Run

const level = 106
const best = simulatedAnnealing(parameterPresets[4], gears, 'Warrior', level, false)
printBuild(best, level, wynnBuilderItemMap)
console.log(idBoosts(best))
console.log(dps(best))
console.log(`sp: ${spFinal(best)}`)
console.log(`ehp: ${effectiveHP(best)}`)
