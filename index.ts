import * as fs from 'fs'
import { simulatedAnnealing } from './annealing'
import { parameterPresets } from './wynn_logic'
import { printBuild } from './encoder'
import { ItemDB } from './types/wynn'
import { Gears } from './types/build'

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
const best = simulatedAnnealing(parameterPresets[0], gears, 'Archer', level)
printBuild(best, level, wynnBuilderItemMap)
