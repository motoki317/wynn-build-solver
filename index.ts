import * as fs from "fs";

type Tier = 'Normal' | 'Unique' | 'Rare' | 'Legendary' | 'Fabled' | 'Mythic' | 'Set'
type ArmorType = 'Helmet' | 'Chestplate' | 'Leggings' | 'Boots'
type WeaponType = 'Bow' | 'Wand' | 'Spear' | 'Dagger' | 'Relik'
type Type = ArmorType | WeaponType
type AccessoryType = 'Ring' | 'Bracelet' | 'Necklace'
type Category = 'armor' | 'weapon' | 'accessory'
type AttackSpeed = 'SUPER_SLOW' | 'VERY_SLOW' | 'SLOW' | 'NORMAL' | 'FAST' | 'VERY_FAST' | 'SUPER_FAST'

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

type GearType = Type | AccessoryType

interface ItemDB {
    items: Item[]
    request: {
        timestamp: number,
        version: string
    }
}

// ------

const randomIntn = (n: number): number => Math.floor(Math.random() * n)
const randomPickOne = <T>(a: readonly T[]): T => {
    if (a.length === 0) throw new Error('array is empty')
    return a[randomIntn(a.length)]
}

// ------

interface Build {
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

const encodeWynnBuilderV4URL = (b: Build, level: number): string => {
    // sp requirements
    const spReq = [0, 0, 0, 0, 0]
    const spReqFieldNames = ['strength', 'dexterity', 'intelligence', 'defense', 'agility'] as const
    Object.values(b).forEach((item: Item) => {
        for (let i = 0; i < 5; i++) {
            spReq[i] = Math.max(spReq[i], item[spReqFieldNames[i]])
        }
    })

    // https://github.com/hppeng-wynn/hppeng-wynn.github.io
    const digits =
        //   0       8       16      24      32      40      48      56     63
        //   v       v       v       v       v       v       v       v      v
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-".split('')
    const fromIntN = (int32: number, n: number) =>  {
        let result = ''
        for (let i = 0; i < n; ++i) {
            result = digits[int32 & 0x3f] + result;
            int32 >>= 6;
        }
        return result;
    }
    // TODO: powder encoding
    return `https://wynnbuilder.github.io/#4_${
        [b.helmet?.name, b.chestplate?.name, b.leggings?.name, b.boots?.name,
        b.ring1?.name, b.ring2?.name, b.bracelet?.name, b.necklace?.name, b.weapon?.name]
            .map((name, i) => name ? wynnBuilderItemMap[name] : 10000 + i)
            .map((id) => fromIntN(id, 3))
            .join('')
    }${
        spReq.map((req) => fromIntN(req, 2)).join('')
    }${
        fromIntN(level, 2)
    }`
}

const printBuild = (b: Build, level: number) => {
    const buildKeys: (keyof Build)[] = ['helmet', 'chestplate', 'leggings', 'boots', 'ring1', 'ring2', 'bracelet', 'necklace', 'weapon']

    buildKeys
        .filter((key) => b[key] !== undefined)
        .forEach((key) => console.log(`${key}: ${b[key]!.displayName ?? b[key]!.name}`))

    const wynnDataURL = `https://www.wynndata.tk/builder/?${
        buildKeys.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(`${b[key]?.displayName ?? b[key]?.name ?? ''}`)).join('&')
    }`
    console.log(`WynnData: ${wynnDataURL}`)
    console.log(`WynnBuilder: ${encodeWynnBuilderV4URL(b, level)}`)
}

const buildKeyToGearType: { [key in Exclude<keyof Build, undefined>]: GearType } = {
    'helmet': 'Helmet',
    'chestplate': 'Chestplate',
    'leggings': 'Leggings',
    'boots': 'Boots',
    'ring1': 'Ring',
    'ring2': 'Ring',
    'bracelet': 'Bracelet',
    'necklace': 'Necklace',
    'weapon': 'Bow', // replace by randomPickOne(weaponTypes)
}

type Gears = { [key in GearType]?: Item[] }

type Class = 'Archer' | 'Mage' | 'Warrior' | 'Assassin' | 'Shaman'

const classToWeaponType: { [key in Class]: WeaponType } = {
    'Archer': 'Bow',
    'Mage': 'Wand',
    'Warrior': 'Spear',
    'Assassin': 'Dagger',
    'Shaman': 'Relik',
}
const weaponTypeToClass = Object.fromEntries(
    Object.entries(classToWeaponType)
        .map(([cls, weapon]) => [weapon, cls as Class])) as { [key in WeaponType]: Class }

const attackSpeedToMultiplier: { [key in AttackSpeed]: number } = {
    'SUPER_SLOW': 0.51,
    'VERY_SLOW': 0.83,
    'SLOW': 1.5,
    'NORMAL': 2.05,
    'FAST': 2.5,
    'VERY_FAST': 3.1,
    'SUPER_FAST': 4.3,
}

const damageStringToMinMax = (s: string): [min: number, max: number] => {
    const damages = s.split('-').map((ss) => +ss)
    if (damages.length !== 2) throw new Error(`malformed damage string: ${s}`)
    return [damages[0], damages[1]]
}
const damageStringToAvg = (s: string): number => {
    const [min, max] = damageStringToMinMax(s)
    return (min + max) / 2
}

type UtilityFunc = (b: Build) => number

interface HyperParameters {
    name: string
    utilityFunc: UtilityFunc
    maxIterations: number
    initialTemperature: number
}

const parameterPresets: HyperParameters[] = [
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
        initialTemperature: 2000,
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
                damageStringToAvg(b.weapon.airDamage ?? ''),
            ].reduce((acc, cur) => acc + cur, 0)
            return totalDamage * attackSpeedToMultiplier[b.weapon.attackSpeed]
        },
        maxIterations: 20000,
        initialTemperature: 500,
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
        initialTemperature: 500,
    },
]

const neighbor = (b: Build, gears: Gears, classConstraint: Class | undefined): Build => {
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

const clamp = (n: number, min: number, max: number): number => Math.max(Math.min(n, max), min)
const levelToSP = (level: number): number => (clamp(level, 1, 101) - 1) * 2

const isValidBuild = (b: Build, classConstraint: Class | undefined, level: number): boolean => {
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

// ------

const itemDB: ItemDB = JSON.parse(fs.readFileSync('itemDB.json', 'utf-8'))

interface WynnBuilderItem {
    name: string
    id: number
}
const wynnBuilderDB: WynnBuilderItem[] = JSON.parse(fs.readFileSync('wynn_builder_compress.json', 'utf-8'))
const wynnBuilderItemMap: { [name: string]: number } = Object.fromEntries(wynnBuilderDB.map((item) => [item.name, item.id]))

const gears = itemDB.items.reduce<Gears>((obj, item) => {
    const gearType = item.type || item.accessoryType
    if (gearType === undefined) throw new Error('an item has neither type or accessoryType field')
    if (obj.hasOwnProperty(gearType)) {
        obj[gearType]?.push(item)
    } else {
        obj[gearType] = [item]
    }
    return obj
}, {})

// ------

const nextTemperature = (initialTemperature: number, progress: number): number => {
    // TODO: better cooling
    return initialTemperature * progress
}

const accept = (cur: Build, next: Build, temperature: number, utilityFunc: UtilityFunc): boolean => {
    const uc = utilityFunc(cur)
    const un = utilityFunc(next)
    const acceptProb = uc < un ? 1 : Math.exp(-(uc - un) / temperature)
    return acceptProb >= Math.random()
}

const simulatedAnnealing = (hp: HyperParameters, gears: Gears, classConstraint: Class | undefined, level: number): Build => {
    const maxInvalidRetry = 100

    let cur: Build = {}
    let best: Build = {}
    let temperature = hp.initialTemperature
    for (let k = 0; k < hp.maxIterations; k++) {
        temperature = nextTemperature(hp.initialTemperature, 1 - (k + 1) / hp.maxIterations)

        let next: Build = neighbor(cur, gears, classConstraint)
        let retry = 0
        while (!isValidBuild(next, classConstraint, level)) {
            next = neighbor(cur, gears, classConstraint)
            retry++
            if (maxInvalidRetry < retry) {
                console.warn(`no valid neighbor found within ${maxInvalidRetry} retries, current iter: ${k}, temp: ${temperature}`)
                return best
            }
        }
        if (accept(cur, next, temperature, hp.utilityFunc)) {
            cur = next
        }
        const cu = hp.utilityFunc(cur)
        const cb = hp.utilityFunc(best)
        if (cb < cu) {
            best = cur
        }

        console.log(`${k}: current utility ${cu}, best utility ${Math.max(cu, cb)}`)
    }
    return best
}

// TODO: better initial temperature according to utility func
const level = 106
const best = simulatedAnnealing(parameterPresets[0], gears, 'Archer', level)
printBuild(best, level)
