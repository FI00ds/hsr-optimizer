import { Message } from 'lib/interactions/message'
import {
  isAKeyValue,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { damageTagValues } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/DamageTagSelect'
import { targetTagValues } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/TargetTagSelect'
import {
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { create } from 'zustand'

interface CombatBuffStoreState {
  // general purpose values
  buffBuilderMode: CombatBuffType
  // stat buff builder values
  stat: CombatStatBuff['statKey'] | null
  value: CombatStatBuff['value'] | string
  damageTags: CombatStatBuff['damageTags']
  targetTag: CombatStatBuff['targetTag'] | null
  // action modifier builder values
}

interface CombatBuffStoreActions {
  // general purpose methods
  setBuffBuilderMode: (mode: CombatBuffStoreState['buffBuilderMode']) => void
  loadBuffFromClipboard: () => void
  // stat buff builder methods
  setStat: (stat: CombatBuffStoreState['stat']) => void
  setValue: (value: CombatBuffStoreState['value']) => void
  setDamageTags: (damageTags: CombatBuffStoreState['damageTags']) => void
  setTargetTag: (targetTags: CombatBuffStoreState['targetTag']) => void
}

type CombatBuffStore = CombatBuffStoreActions & CombatBuffStoreState

function initialStoreState(): CombatBuffStoreState {
  return {
    buffBuilderMode: CombatBuffType.StatBuff,
    stat: null,
    value: 0,
    damageTags: [],
    targetTag: null,
  }
}

export const useCombatBuffStore = create<CombatBuffStore>()((set) => ({
  ...initialStoreState(),
  // general methods
  setBuffBuilderMode: (mode) => set({ buffBuilderMode: mode }),
  loadBuffFromClipboard: () => loadBuffFromClipboard(set),
  // stat buff builder
  setStat(stat) {
    if (stat !== null && !isHitAKey(stat)) {
      set({ stat, damageTags: [] })
    } else set({ stat })
  },
  setValue: (value) => ({ value: value }),
  setDamageTags: (damageTags) => set({ damageTags }),
  setTargetTag: (targetTag) => set({ targetTag }),
  // action modifier builder
}))

function loadBuffFromClipboard(set: {
  (partial: CombatBuffStore | Partial<CombatBuffStore> | ((state: CombatBuffStore) => CombatBuffStore | Partial<CombatBuffStore>), replace?: false): void,
  (state: CombatBuffStore | ((state: CombatBuffStore) => CombatBuffStore), replace: true): void,
}) {
  navigator.clipboard.readText()
    .then(JSON.parse)
    .then((maybeBuff) => {
      const buffType = maybeBuff.type
      if (buffType == undefined) return Message.error('Clipboard item is not a combat buff')
      switch (buffType as CombatBuffType) {
        case CombatBuffType.StatBuff:
          const { statKey: stat, value, damageTags, targetTag } = maybeBuff
          if (stat == undefined || value == undefined || !(damageTags instanceof Array) || (targetTag == undefined)) {
            return Message.error('Clipboard item is missing fields')
          }
          if (!targetTagValues.includes(targetTag)) {
            return Message.error('Target tag field is invalid')
          }
          if (!damageTags.reduce((acc, tag) => acc && damageTagValues.includes(tag), true)) {
            return Message.error('Damage tag field is invalid')
          }
          if (typeof value !== 'number') {
            return Message.error('Value field is invalid')
          }
          if (!isAKeyValue(stat)) {
            return Message.error('Stat field is invalid')
          }
          if (damageTags.length && !isHitAKey(stat)) {
            return Message.error('Buff includes damage type filtering but stat is incompatible')
          }
          return set({ stat, value, damageTags, targetTag })
          // TODO: action modifier safe parsing
      }
      Message.error('Clipboard item is not a combat buff')
    })
    .catch((e: DOMException | SyntaxError) => {
      if (e instanceof SyntaxError) {
        return Message.error('Item in clipboard is not valid JSON')
      }
      if (e instanceof DOMException) {
        switch (e.name) {
          case 'NotAllowedError':
            return Message.error('Clipboard permissions denied, please ensure the website has clipboard permissions.')
          case 'NotFoundError':
            return Message.error('No suitable clipboard entry was detected.')
        }
      }
      return Message.error('Unknown error while attempting to parse buff from clipboard.')
    })
}
