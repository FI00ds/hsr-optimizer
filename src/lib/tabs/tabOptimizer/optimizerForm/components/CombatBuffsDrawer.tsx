import {
  Button,
  Drawer,
  Flex,
  MultiSelect,
  NumberInput,
  Popover,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  Text,
} from '@mantine/core'
import { DAMAGE_TAG_ENTRY_BY_TAG } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import {
  isFlatStat,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import {
  JSX,
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

import { useDisclosure } from '@mantine/hooks'
import classes from './CombatBuffsDrawer.module.css'

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
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const [stat, setStat] = useState<CombatStatBuff['statKey'] | undefined>()
  // string used rather than undefined beacuse of cases such as empty field which mantine returns as ''
  const [value, setValue] = useState<CombatStatBuff['value'] | string>('')
  const [damageTags, setDamageTags] = useState<CombatStatBuff['damageTags']>([])
  const [targetTag, setTargetTag] = useState<CombatStatBuff['targetTag'] | null>(null)

  const [opened, { close, open }] = useDisclosure(false)

  const suffix = getSuffix(stat)

  const renderDamageTagPill = useCallback(({ value }: { value?: DamageTag }) => {
    const key = value
    if (!key) return null
    const label = t(DamageTag[key])
    const colour = DAMAGE_TAG_ENTRY_BY_TAG.get(key)?.color
    if (!colour) return null
    return renderPill(DamageTag[key], colour, label, { active: true })
  }, [t])

  const renderDamageTagOption = useCallback(({ option: { value }, checked }: { option: { value: DamageTag }, checked?: boolean }) => {
    const key = value
    if (!key) return null
    const label = t(DamageTag[key])
    const colour = DAMAGE_TAG_ENTRY_BY_TAG.get(key)?.color
    if (!colour) return null
    return renderPill(DamageTag[key], colour, label, { active: checked })
  }, [t])

  const damageTagsDisabled = stat && isHitAKey(stat)

  return (
    <div>
      <Flex direction='row'>
        stat
        <NumberInput
          suffix={suffix}
          value={value}
          onChange={setValue}
          label='value'
          hideControls
        />
      </Flex>
      <Select
        value={targetTag}
        onChange={setTargetTag}
        data={targetTagValues}
        clearable
        renderOption={({ option: { value, label, disabled }, checked }) => `foo${value}`}
      />
      <Popover width={200} position='left' withArrow shadow='md' opened={opened} disabled={!damageTagsDisabled}>
        <Popover.Target>
          {/* div required to capture mouse events, these events arent captured by multiselect if it is disabled */}
          <div
            onMouseEnter={open}
            onMouseLeave={close}
          >
            <MultiSelect
              value={damageTags}
              onChange={setDamageTags}
              data={damageTagValues}
              clearable
              renderPill={renderDamageTagPill}
              renderOption={renderDamageTagOption}
              classNames={{ dropdown: classes.dropdown, option: classes.option }}
              label='Damage tags'
              disabled={damageTagsDisabled}
            />
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <Text size='sm'>selected stat cant be hit filtered, use flat equivalent instead</Text>
        </Popover.Dropdown>
      </Popover>
    </div>
  )
}

function getSuffix(stat: CombatStatBuff['statKey'] | undefined): string | undefined {
  if (!stat || isFlatStat(stat)) return
  return '%'
}

const damageTagValues = [
  DamageTag.BASIC,
  DamageTag.SKILL,
  DamageTag.ULT,
  DamageTag.FUA,
  DamageTag.DOT,
  DamageTag.BREAK,
  DamageTag.SUPER_BREAK,
  DamageTag.MEMO,
  DamageTag.ADDITIONAL,
  DamageTag.ELATION,
  DamageTag.ASSIST,
]

const targetTagValues = [
  // Atomic entity flags
  TargetTag.Self,
  TargetTag.Pet,
  TargetTag.Memosprite,
  TargetTag.Summon,
  TargetTag.FullTeam,
  TargetTag.SingleTarget,
  // Composed
  TargetTag.SelfAndPet,
  TargetTag.SelfAndMemosprite,
  TargetTag.SelfAndSummon,
]

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
