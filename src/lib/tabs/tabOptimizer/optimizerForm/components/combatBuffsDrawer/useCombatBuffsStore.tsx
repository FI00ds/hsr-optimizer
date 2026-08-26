import { ActionIcon } from '@mantine/core'
import {
  IconFolder,
  IconFolderDown,
  IconFolderOff,
  IconFolderOpen,
  IconFolderPlus,
} from '@tabler/icons-react'
import { Message } from 'lib/interactions/message'
import {
  isAKeyValue,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { type OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { damageTagValues } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/DamageTagSelect'
import { targetTagValues } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/TargetTagSelect'
import { memo } from 'react'
import {
  type CombatBuff,
  type CombatBuffGroup,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { create } from 'zustand'

interface CombatBuffStoreState {
  // general purpose values
  buffBuilderMode: CombatBuffType
  selectedBuffs: Set<string>
  buffs: Map<string, CombatBuff>
  groups: Map<string, CombatBuffGroup>
  groupedBuffs: Map<string, CombatBuff>
  selectionState: SelectionState
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
  toggleBuffSelection: (id: string) => void
  folderIconClicked: () => void
  // stat buff builder methods
  setStat: (stat: CombatBuffStoreState['stat']) => void
  setValue: (value: CombatBuffStoreState['value']) => void
  setDamageTags: (damageTags: CombatBuffStoreState['damageTags']) => void
  setTargetTag: (targetTags: CombatBuffStoreState['targetTag']) => void
}

type CombatBuffStore = CombatBuffStoreActions & CombatBuffStoreState

function initialStoreState(): CombatBuffStoreState {
  const { buffs, groups, groupedBuffs } = deriveBuffStateFromOptimizerRequestState(useOptimizerRequestStore.getState())
  const selectedBuffs = new Set<string>()
  const selectionState = deriveSelectionMode(selectedBuffs, buffs, groups)
  return {
    buffBuilderMode: CombatBuffType.StatBuff,
    selectedBuffs,
    buffs,
    groups,
    groupedBuffs,
    selectionState,
    stat: null,
    value: 0,
    damageTags: [],
    targetTag: null,
  }
}

export const useCombatBuffStore = create<CombatBuffStore>()((set, get) => ({
  ...initialStoreState(),
  // general methods
  setBuffBuilderMode: (mode) => set({ buffBuilderMode: mode }),
  loadBuffFromClipboard: () => loadBuffFromClipboard(set),
  toggleBuffSelection: (id) => {
    const { selectedBuffs } = get()
    const next = new Set(selectedBuffs)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    set({ selectedBuffs: next })
  },
  folderIconClicked: () => {
    const { selectionState, selectedBuffs, groups } = get()
    console.log(SelectionState[selectionState], selectedBuffs, groups)
    switch (selectionState) {
      case SelectionState.NONE:
      case SelectionState.DELETE:
        // impossible due to action icon being disabled
        break
      case SelectionState.EXTRACT: {
        let combatBuffs = { ...useOptimizerRequestStore.getState().combatBuffs }
        const extractedBuffs = new Set<string>()
        const groupEntries = groups.entries()
        selectedBuffs.forEach((buffId) => {
          if (extractedBuffs.has(buffId)) return
          const [groupId, group] = groupEntries.find(([_, group]) => group.buffs.includes(buffId))!
          combatBuffs = {
            ...combatBuffs,
            [groupId]: {
              ...group,
              buffs: group.buffs.filter((buffId) => {
                if (!selectedBuffs.has(buffId)) return true
                extractedBuffs.add(buffId)
                return false
              }),
            },
          }
        })
        useOptimizerRequestStore.setState({ combatBuffs })
        break
      }
      case SelectionState.ADDTOGROUP: {
        const groupId = selectedBuffs[Symbol.iterator]().find((id) => groups.has(id))!
        const group = groups.get(groupId)!
        const newGroup = { ...group, buffs: [...group.buffs, ...selectedBuffs.values()] }
        useOptimizerRequestStore.getState().updateCombatBuff(groupId, newGroup)
        break
      }
      case SelectionState.CREATEGROUP: {
        const group: CombatBuffGroup = {
          name: '',
          type: CombatBuffType.Group,
          buffs: Array.from(selectedBuffs),
        }
        useOptimizerRequestStore.getState().addCombatBuff(group)
        break
      }
      case SelectionState.FLATTEN: {
        const combatBuffs = { ...useOptimizerRequestStore.getState().combatBuffs }
        selectedBuffs.forEach((id) => delete combatBuffs[id])
        useOptimizerRequestStore.setState({ combatBuffs })
        break
      }
    }
    set({ selectedBuffs: new Set() })
  },
  // stat buff builder
  setStat(stat) {
    if (stat !== null && !isHitAKey(stat)) {
      set({ stat, damageTags: [] })
    } else set({ stat })
  },
  setValue: (value) => set({ value: value }),
  setDamageTags: (damageTags) => set({ damageTags }),
  setTargetTag: (targetTag) => set({ targetTag }),
  // action modifier builder
}))

function loadBuffFromClipboard(set: { (partial: Partial<CombatBuffStore>): void }) {
  navigator.clipboard.readText()
    .then(JSON.parse)
    .then((maybeBuff) => {
      switch (maybeBuff.type as CombatBuffType | undefined) {
        case undefined:
          break
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

useOptimizerRequestStore.subscribe((state, prev) => {
  if (state.combatBuffs === prev.combatBuffs) return

  // buff deletion is handled in useOptimizerRequestStore, sub to prevent stale selection entries
  const selectedBuffs: CombatBuffStoreState['selectedBuffs'] = new Set(useCombatBuffStore.getState().selectedBuffs)
  useCombatBuffStore.getState().selectedBuffs.forEach((id) => {
    if (state.combatBuffs[id] === undefined) {
      selectedBuffs.delete(id)
    }
  })

  // sub because need metadata on buffs to enable selection state handling
  // CombatBuffsDrawer uses this store's values rather than those in useOptimizerRequestStore
  const { buffs, groups, groupedBuffs } = deriveBuffStateFromOptimizerRequestState(state)

  useCombatBuffStore.setState({ selectedBuffs, buffs, groups, groupedBuffs })
})

useCombatBuffStore.subscribe((state, prev) => {
  if (state.selectedBuffs !== prev.selectedBuffs) {
    useCombatBuffStore.setState({ selectionState: deriveSelectionMode(state.selectedBuffs, state.buffs, state.groups) })
  }
})

function deriveBuffStateFromOptimizerRequestState(state: OptimizerRequestState) {
  const buffs: CombatBuffStoreState['buffs'] = new Map()
  const groups: CombatBuffStoreState['groups'] = new Map()
  const grouped = new Set<string>()

  Object.entries(state.combatBuffs).forEach(([id, buff]) => {
    if (buff.type === CombatBuffType.Group) {
      groups.set(id, buff)
      buff.buffs.forEach((buffId) => {
        grouped.add(buffId)
        buffs.delete(buffId)
      })
    } else {
      if (!grouped.has(id)) buffs.set(id, buff)
    }
  })
  const groupedBuffs: CombatBuffStoreState['groupedBuffs'] = new Map(
    grouped
      .values()
      .map((id) => [id, state.combatBuffs[id] as CombatBuff]),
  )
  return { buffs, groups, groupedBuffs }
}

function deriveSelectionMode(
  selectedBuffs: CombatBuffStoreState['selectedBuffs'],
  buffs: CombatBuffStoreState['buffs'],
  groups: CombatBuffStoreState['groups'],
): SelectionState {
  let buffTally = 0, groupTally = 0, groupedBuffsTally = 0
  selectedBuffs.forEach((id) => {
    if (buffs.has(id)) buffTally++
    else if (groups.has(id)) {
      groupTally++
    } else groupedBuffsTally++
  })
  if (groupedBuffsTally) {
    if (buffTally || groupTally) return SelectionState.DELETE
    return SelectionState.EXTRACT
  }
  if (buffTally && groupTally === 1) {
    return SelectionState.ADDTOGROUP
  }
  if (buffTally && groupTally > 1) {
    return SelectionState.DELETE
  }
  if (buffTally) {
    return SelectionState.CREATEGROUP
  }
  if (groupTally) {
    return SelectionState.FLATTEN
  }
  return SelectionState.NONE
}

export const FolderIcon = memo(function FolderIcon({
  selectionState: state,
  onClick,
}: {
  selectionState: SelectionState,
  onClick: () => void,
}) {
  const icon = (() => {
    switch (state) {
      case SelectionState.NONE:
      case SelectionState.DELETE:
        return <IconFolder />
      case SelectionState.EXTRACT:
        return <IconFolderDown />
      case SelectionState.ADDTOGROUP:
        return <IconFolderPlus />
      case SelectionState.CREATEGROUP:
        return <IconFolderOpen />
      case SelectionState.FLATTEN:
        return <IconFolderOff />
    }
  })()
  return (
    <ActionIcon
      disabled={state === SelectionState.DELETE || state === SelectionState.NONE}
      onClick={onClick}
    >
      {icon}
    </ActionIcon>
  )
})

/**
 * @param DELETE general case\
 * folder disabled\
 * clear will remove buffs and flatten groups
 * @param EXTRACT only grouped buffs are selected\
 * folder extracts selected buffs from their groups\
 * clear removes selected
 * @param ADDTOGROUP ungrouped buffs and exactly 1 group are selected\
 * folder adds selected buffs to selected group\
 * clear deletes selected buffs and flattens selected group
 * @param CREATEGROUP only ungrouped buffs are selected\
 * folder creates a new unnamed group containing selected buffs\
 * clear deletes selected buffs
 * @param FLATTEN only groups are selected\
 * folder flattens group(s)\
 * clear flattens group(s)
 * @param NONE nothing is selected\
 * folder is disabled\
 * clear deletes all buffs and groups
 */
enum SelectionState {
  DELETE,
  EXTRACT,
  ADDTOGROUP,
  CREATEGROUP,
  FLATTEN,
  NONE,
}

// |              selection types               | folder click meaning | state variant |
// | :----------------------------------------: | :------------------: | :-----------: |
// | n buff(s) + n grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | n buff(s) + n grouped buff(s) + 1 group(s) |         n/a          |    DELETE     |
// | n buff(s) + n grouped buff(s) + 0 group(s) |         n/a          |    DELETE     |
// | 1 buff(s) + n grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | 1 buff(s) + n grouped buff(s) + 1 group(s) |         n/a          |    DELETE     |
// | 1 buff(s) + n grouped buff(s) + 0 group(s) |         n/a          |    DELETE     |
// | 0 buff(s) + n grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | 0 buff(s) + n grouped buff(s) + 1 group(s) |         n/a          |    DELETE     |
// | 0 buff(s) + n grouped buff(s) + 0 group(s) |  extract from group  |    EXTRACT    |
// |                                            |                      |               |
// | n buff(s) + 1 grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | n buff(s) + 1 grouped buff(s) + 1 group(s) |         n/a          |    DELETE     |
// | n buff(s) + 1 grouped buff(s) + 0 group(s) |         n/a          |    DELETE     |
// | 1 buff(s) + 1 grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | 1 buff(s) + 1 grouped buff(s) + 1 group(s) |         n/a          |    DELETE     |
// | 1 buff(s) + 1 grouped buff(s) + 0 group(s) |         n/a          |    DELETE     |
// | 0 buff(s) + 1 grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | 0 buff(s) + 1 grouped buff(s) + 1 group(s) |         n/a          |    DELETE     |
// | 0 buff(s) + 1 grouped buff(s) + 0 group(s) |  extract from group  |    EXTRACT    |
// |                                            |                      |               |
// | n buff(s) + 0 grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | n buff(s) + 0 grouped buff(s) + 1 group(s) |     add to group     |  ADDTOGROUP   |
// | n buff(s) + 0 grouped buff(s) + 0 group(s) |     create group     |  CREATEGROUP  |
// | 1 buff(s) + 0 grouped buff(s) + n group(s) |         n/a          |    DELETE     |
// | 1 buff(s) + 0 grouped buff(s) + 1 group(s) |     add to group     |  ADDTOGROUP   |
// | 1 buff(s) + 0 grouped buff(s) + 0 group(s) |     create group     |  CREATEGROUP  |
// | 0 buff(s) + 0 grouped buff(s) + n group(s) |   flatten group(s)   |    FLATTEN    |
// | 0 buff(s) + 0 grouped buff(s) + 1 group(s) |   flatten group(s)   |    FLATTEN    |
// | 0 buff(s) + 0 grouped buff(s) + 0 group(s) |         n/a          |     NONE      |

// |    state    | folder icon |   clear text   |
// | :---------: | :---------: | :------------: |
// |   DELETE    |     n/a     | clear selected |
// |   EXTRACT   | folder-down | clear selected |
// | ADDTOGROUP  | folder-plus | clear selected |
// | CREATEGROUP | folder-open | clear selected |
// |   FLATTEN   | folder-off  | clear selected |
// |    NONE     |     n/a     |     clear      |
