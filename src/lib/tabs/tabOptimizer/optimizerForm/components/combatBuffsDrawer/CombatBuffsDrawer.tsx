import {
  Button,
  Drawer,
  Flex,
  NumberInput,
  SegmentedControl,
  type SegmentedControlItem,
} from '@mantine/core'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import {
  isFlatStat,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import {
  type JSX,
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  type CombatBuff,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { useShallow } from 'zustand/react/shallow'

import { DamageTagSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/DamageTagSelect'
import { TargetTagSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/TargetTagSelect'
import { StatSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/StatSelect'

export function CombatBuffsDrawer() {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  return (
    <Drawer
      title={t('Title')} // 'Extra combat buffs'
      position='right'
      onClose={closeBuffsDrawer}
      opened={isOpenBuffsDrawer}
      size={300}
    >
      {isOpenBuffsDrawer && <CombatBuffsDrawerContent />}
    </Drawer>
  )
}

function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  const { clearCombatBuffs, addCombatBuff, removeCombatBuff, combatBuffs } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
    combatBuffs: s.combatBuffs,
  })))

  return (
    <Flex direction='column' gap={defaultGap}>
      <Button
        fullWidth
        variant='default'
        onClick={clearCombatBuffs}
      >
        {t('Clear')}
      </Button>
      <Flex direction='column' gap={optimizerTabDefaultGap}>
        <BuffBuilder addBuff={addCombatBuff} />
        {Object.entries(combatBuffs)
          .map(([id, buff]) => (
            <BuffPanel
              key={id}
              id={id}
              buff={buff}
              addBuff={addCombatBuff}
              removeBuff={removeCombatBuff}
            />
          ))}
      </Flex>
    </Flex>
  )
}

function BuffBuilder({
  addBuff,
}: {
  addBuff(buff: CombatBuff): void,
}) {
  const [mode, setMode] = useState<CombatBuffType>(CombatBuffType.StatBuff)

  const options: Array<SegmentedControlItem<CombatBuffType>> = [
    { value: CombatBuffType.StatBuff, label: 'Stat buff' },
    { value: CombatBuffType.ActionModifier, label: 'Action modifier', disabled: true },
  ]

  const activeBuilder: JSX.Element = (() => {
    switch (mode) {
      case CombatBuffType.StatBuff:
        return <StatBuffBuilder addBuff={addBuff} />
      case CombatBuffType.ActionModifier:
        return <ActionModifierBuilder addBuff={addBuff} />
    }
  })()

  return (
    <div style={{ borderColor: 'red', borderRadius: 4, borderWidth: 1, borderStyle: 'solid' }}>
      <SegmentedControl fullWidth value={mode} onChange={setMode} data={options} />
      {activeBuilder}
    </div>
  )
}

function StatBuffBuilder({
  addBuff,
}: {
  addBuff(buff: CombatBuff): void,
}) {
  const [stat, setStat] = useState<CombatStatBuff['statKey'] | null>(null)
  // string used rather than undefined beacuse of cases such as empty field which mantine returns as ''
  const [value, setValue] = useState<CombatStatBuff['value'] | string>('')
  const [damageTags, setDamageTags] = useState<CombatStatBuff['damageTags']>([])
  const [targetTag, setTargetTag] = useState<CombatStatBuff['targetTags']>([])

  const suffix = getSuffix(stat)

  const damageTagsDisabled = stat !== null && isHitAKey(stat)

  return (
    <div>
      <Flex direction='row' gap={8}>
        <StatSelect value={stat} onChange={setStat} style={{ flex: 7 }} />
        <NumberInput
          flex={2}
          suffix={suffix}
          value={value}
          onChange={setValue}
          label='value'
          hideControls
        />
      </Flex>
      <TargetTagSelect value={targetTag} onChange={setTargetTag} />
      <DamageTagSelect disabled={damageTagsDisabled} value={damageTags} onChange={setDamageTags} />
    </div>
  )
}

function getSuffix(stat: CombatStatBuff['statKey'] | null): string | undefined {
  if (stat === null || isFlatStat(stat)) return
  return '%'
}

function ActionModifierBuilder({
  addBuff,
}: {
  addBuff(buff: CombatBuff): void,
}) {
  return <></>
}

function BuffPanel({
  id,
  buff,
  addBuff,
  removeBuff,
}: {
  id: string,
  buff: CombatBuff,
  addBuff(buff: CombatBuff): void,
  removeBuff(key: string): void,
}) {
  const remove = useCallback(() => removeBuff(id), [removeBuff, id])
  return <></>
}
