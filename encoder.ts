import { Build } from './types/build'
import { Item } from './types/wynn'

const encodeWynnDataURL = (b: Build): string => {
  const buildKeys: (keyof Build)[] = ['helmet', 'chestplate', 'leggings', 'boots', 'ring1', 'ring2', 'bracelet', 'necklace', 'weapon']
  return `https://www.wynndata.tk/builder/?${
    buildKeys.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(`${b[key]?.displayName ?? b[key]?.name ?? ''}`)).join('&')
  }`
}

export type WynnBuilderItemMap = { [name: string]: number }

const encodeWynnBuilderV4URL = (b: Build, level: number, idMap: WynnBuilderItemMap): string => {
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
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-'.split('')
  const fromIntN = (int32: number, n: number) => {
    let result = ''
    for (let i = 0; i < n; ++i) {
      result = digits[int32 & 0x3f] + result
      int32 >>= 6
    }
    return result
  }
  // TODO: powder encoding
  return `https://wynnbuilder.github.io/#4_${
    [b.helmet?.name, b.chestplate?.name, b.leggings?.name, b.boots?.name,
      b.ring1?.name, b.ring2?.name, b.bracelet?.name, b.necklace?.name, b.weapon?.name]
      .map((name, i) => name ? idMap[name] : 10000 + i)
      .map((id) => fromIntN(id, 3))
      .join('')
  }${
    spReq.map((req) => fromIntN(req, 2)).join('')
  }${
    fromIntN(level, 2)
  }`
}

export const printBuild = (b: Build, level: number, idMap: WynnBuilderItemMap) => {
  const buildKeys: (keyof Build)[] = ['helmet', 'chestplate', 'leggings', 'boots', 'ring1', 'ring2', 'bracelet', 'necklace', 'weapon']
  buildKeys
    .filter((key) => b[key] !== undefined)
    .forEach((key) => console.log(`${key}: ${b[key]!.displayName ?? b[key]!.name}`))

  console.log(`WynnData: ${encodeWynnDataURL(b)}`)
  console.log(`WynnBuilder: ${encodeWynnBuilderV4URL(b, level, idMap)}`)
}
