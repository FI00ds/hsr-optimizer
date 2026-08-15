import {
  MultiSelect,
  Popover,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'

import { DAMAGE_TAG_ENTRY_BY_TAG } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './CombatBuffsDrawer.module.css'

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

export function DamageTagSelect({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean,
  value: Array<DamageTag>,
  onChange(val: Array<DamageTag>): void,
}) {
  const [opened, { close, open }] = useDisclosure(false)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

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
  return (
    <Popover width={200} position='left' withArrow shadow='md' opened={opened} disabled={!disabled}>
      <Popover.Target>
        {/* div required to capture mouse events, these events arent captured by multiselect if it is disabled */}
        <div
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <MultiSelect
            value={value}
            onChange={onChange}
            data={damageTagValues}
            clearable
            renderPill={renderDamageTagPill}
            renderOption={renderDamageTagOption}
            classNames={{ dropdown: classes.dropdown, option: classes.option }}
            label='Damage tags'
            disabled={disabled}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size='sm'>selected stat cant be hit filtered, use flat equivalent instead</Text>
      </Popover.Dropdown>
    </Popover>
  )
}
