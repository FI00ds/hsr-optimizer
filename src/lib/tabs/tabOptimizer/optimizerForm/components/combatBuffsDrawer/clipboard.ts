import {
  isAKeyValue,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { uuid } from 'lib/utils/miscUtils'
import {
  type CombatActionModifier,
  type CombatBuff,
  type CombatBuffGroup,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { damageTagValues } from './DamageTagSelect'
import { targetTagValues } from './TargetTagSelect'

export type ParseError = StatBuffParseError | GenericParseError | ActionModifierParseError | BuffGroupParseError

export enum ClipboardError {
  NotAllowed,
  NotFound,
}

export enum GenericParseError {
  InvalidItem,
  SyntaxError,
  Unknown,
}

export enum StatBuffParseError {
  FieldsMissing,
  TargetTagInvalid,
  DamageTagInvalid,
  ValueInvalid,
  StatInvalid,
  ConfigInvalid,
  NameInvalid,
}

export enum ActionModifierParseError {
  FieldsMissing,
}

export enum BuffGroupParseError {
  FieldsMissing,
  NameInvalid,
  BuffsInvalid,
}

interface TypeToClipboardBuff {
  [CombatBuffType.StatBuff]: ClipboardStatBuff
  [CombatBuffType.ActionModifier]: ClipboardActionModifier
  [CombatBuffType.Group]: ClipboardBuffGroup
}

type ClipboardBuff = TypeToClipboardBuff[keyof TypeToClipboardBuff]

type ClipboardStatBuff = CombatStatBuff

type ClipboardActionModifier = { type: CombatBuffType.ActionModifier }

interface ClipboardBuffGroup {
  type: CombatBuffType.Group
  name: string
  buffs: Array<CombatStatBuff | CombatActionModifier>
}

export async function writeBuffToClipboard(buff: CombatBuff): Promise<boolean | ClipboardError.NotAllowed>
export async function writeBuffToClipboard(buff: CombatBuffGroup, buffs: Map<string, CombatBuff>): Promise<boolean | ClipboardError.NotAllowed>
export async function writeBuffToClipboard(buff: CombatBuff | CombatBuffGroup, buffs?: Map<string, CombatBuff>): Promise<boolean | ClipboardError.NotAllowed> {
  let blob: ClipboardBuff
  switch (buff.type) {
    case CombatBuffType.StatBuff:
      blob = buff
      break
    case CombatBuffType.ActionModifier:
      blob = { type: CombatBuffType.ActionModifier }
      break
    case CombatBuffType.Group:
      blob = {
        ...buff,
        buffs: buff.buffs.map((id) => buffs!.get(id)!),
      }
  }
  return await navigator.clipboard.writeText(JSON.stringify(blob))
    .then(() => {
      return true
    })
    .catch((e: DOMException) => {
      if (e.name === 'NotAllowedError') {
        return ClipboardError.NotAllowed
      } else {
        console.error(e)
        return false
      }
    })
}

export async function readBuffFromClipboard() {
  const result = await navigator.clipboard.readText()
    .then<ClipboardBuff>(JSON.parse)
    .then((maybeBuff) => {
      switch (maybeBuff.type) {
        case undefined:
          break
        case CombatBuffType.StatBuff: {
          return parseStatBuff(maybeBuff)
        }
        case CombatBuffType.Group: {
          return parseBuffGroup(maybeBuff)
        }
      }
      return GenericParseError.InvalidItem
    })
    .catch((e: DOMException | SyntaxError) => {
      if (e instanceof SyntaxError) {
        return GenericParseError.SyntaxError
      }
      if (e instanceof DOMException) {
        switch (e.name) {
          case 'NotAllowedError':
            return ClipboardError.NotAllowed
          case 'NotFoundError':
            return ClipboardError.NotFound
        }
      }
      return GenericParseError.Unknown
    })
  return result
}

function parseStatBuff({ statKey, value, damageTags, targetTag, name, type }: ClipboardStatBuff): CombatStatBuff | StatBuffParseError {
  if (
    statKey == undefined
    || value == undefined
    || damageTags == undefined
    || targetTag == undefined
    || name == undefined
  ) {
    return StatBuffParseError.FieldsMissing
  }
  if (!targetTagValues.includes(targetTag)) {
    return StatBuffParseError.TargetTagInvalid
  }
  if (!(damageTags instanceof Array) || !damageTags.reduce((acc, tag) => acc && damageTagValues.includes(tag), true)) {
    return StatBuffParseError.DamageTagInvalid
  }
  if (typeof value !== 'number') {
    return StatBuffParseError.ValueInvalid
  }
  if (!isAKeyValue(statKey)) {
    return StatBuffParseError.StatInvalid
  }
  if (damageTags.length && !isHitAKey(statKey)) {
    return StatBuffParseError.ConfigInvalid
  }
  if (typeof name !== 'string') {
    return StatBuffParseError.NameInvalid
  }
  return { statKey, value, damageTags, targetTag, name, type }
}

function parseBuffGroup(
  { name, buffs: clipboardBuffs, type }: ClipboardBuffGroup,
):
  | { group: CombatBuffGroup, buffs: Map<string, CombatBuff>, type: CombatBuffType.Group }
  | BuffGroupParseError
  | StatBuffParseError
  | ActionModifierParseError
{
  if (
    name == undefined
    || clipboardBuffs == undefined
  ) {
    return BuffGroupParseError.FieldsMissing
  }
  if (!(clipboardBuffs instanceof Array)) return BuffGroupParseError.BuffsInvalid
  if (typeof name !== 'string') return BuffGroupParseError.NameInvalid
  const group: CombatBuffGroup = { name, buffs: [], type }
  const buffs = new Map<string, CombatBuff>()
  for (const buff of clipboardBuffs) {
    switch (buff.type) {
      case CombatBuffType.StatBuff: {
        const parsed = parseStatBuff(buff)
        switch (parsed) {
          case StatBuffParseError.FieldsMissing:
          case StatBuffParseError.TargetTagInvalid:
          case StatBuffParseError.DamageTagInvalid:
          case StatBuffParseError.ValueInvalid:
          case StatBuffParseError.StatInvalid:
          case StatBuffParseError.ConfigInvalid:
          case StatBuffParseError.NameInvalid:
            return parsed
          default:
            const id = uuid()
            group.buffs.push(id)
            buffs.set(id, parsed)
        }
        break
      }
      case CombatBuffType.ActionModifier: {
        throw new Error('Not implemented yet: CombatBuffType.ActionModifier case')
      }
    }
  }
  return { group, buffs, type: CombatBuffType.Group }
}
