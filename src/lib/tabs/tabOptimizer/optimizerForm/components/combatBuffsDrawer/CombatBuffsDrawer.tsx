import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Stack,
} from '@mantine/core'
import {
  IconClipboard,
  IconTrash,
} from '@tabler/icons-react'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { BuffBuilder } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffBuilder'
import {
  FolderIcon,
  useCombatBuffStore,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { BuffGroupPanel } from './BuffGroupPanel'
import { BuffPanel } from './BuffPanel'

export function CombatBuffsDrawer() {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  return (
    <Drawer
      title={t('Title')} // 'Extra combat buffs'
      position='right'
      onClose={closeBuffsDrawer}
      opened={isOpenBuffsDrawer}
      size={400}
    >
      <CombatBuffsDrawerContent />
    </Drawer>
  )
}

function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })
  const { t: tBuffPanel } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const {
    clearCombatBuffs,
    addCombatBuff,
    removeCombatBuff,
    renameCombatBuff,
  } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
    renameCombatBuff: s.nameCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
  })))

  const {
    loadBuffFromClipboard,
    toggleBuffSelection,
    selectedBuffs,
    buffs,
    groups,
    groupedBuffs,
    folderIconClicked,
    selectionState,
  } = useCombatBuffStore(
    useShallow((s) => ({
      loadBuffFromClipboard: s.loadBuffFromClipboard,
      toggleBuffSelection: s.toggleBuffSelection,
      selectedBuffs: s.selectedBuffs,
      buffs: s.buffs,
      groups: s.groups,
      groupedBuffs: s.groupedBuffs,
      folderIconClicked: s.folderIconClicked,
      selectionState: s.selectionState,
    })),
  )

  const clearSelectedBuffs = () => {}

  return (
    <Stack gap={defaultGap}>
      <Group>
        <Button
          flex={1}
          onClick={selectedBuffs.size ? clearSelectedBuffs : clearCombatBuffs}
          variant='default'
          leftSection={<IconTrash />}
        >
          {selectedBuffs.size ? 'Clear Selected' : t('Clear')}
        </Button>
        <FolderIcon selectionState={selectionState} onClick={folderIconClicked} />
        <ActionIcon onClick={loadBuffFromClipboard}>
          <IconClipboard />
        </ActionIcon>
      </Group>
      <Stack gap={optimizerTabDefaultGap}>
        <BuffBuilder addBuff={addCombatBuff} />
        {groups.entries()
          .map(([id, group]) => (
            <BuffGroupPanel
              key={id}
              id={id}
              group={group}
              buffs={groupedBuffs}
              removeBuff={removeCombatBuff}
              renameBuff={renameCombatBuff}
              t={tBuffPanel}
              checked={selectedBuffs.has(id)}
              toggleSelection={toggleBuffSelection}
            />
          ))}
        {buffs.entries()
          .map(([id, buff]) => (
            <BuffPanel
              key={id}
              id={id}
              buff={buff}
              removeBuff={removeCombatBuff}
              renameBuff={renameCombatBuff}
              t={tBuffPanel}
              checked={selectedBuffs.has(id)}
              toggleSelection={toggleBuffSelection}
            />
          ))}
      </Stack>
    </Stack>
  )
}
