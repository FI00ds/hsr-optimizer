import { MultiSelect } from '@mantine/core'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type CombatStatBuff } from 'types/form'

import classes from './CombatBuffsDrawer.module.css'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'

const targetTagValues = [
  TargetTag.Self,
  TargetTag.Pet,
  TargetTag.Memosprite,
  TargetTag.Summon,
  TargetTag.FullTeam,
  TargetTag.SingleTarget,
  TargetTag.SelfAndPet,
  TargetTag.SelfAndMemosprite,
  TargetTag.SelfAndSummon
]

export function TargetTagSelect({
  value,
  onChange,
}: {
  value: CombatStatBuff['targetTags'],
  onChange(tag: CombatStatBuff['targetTags']): void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  //TODO: colours per target tag, target tag labels
  const renderDamageTagPill = useCallback(({ value }: { value?: TargetTag }) => {
    const key = value
    if (!key) return null
    const label = TargetTag[key]
    const colour = '#fafa'
    if (!colour) return null
    return renderPill(TargetTag[key], colour, label, { active: true })
  }, [t])

  const renderDamageTagOption = useCallback(({ option: { value }, checked }: { option: { value: TargetTag }, checked?: boolean }) => {
    const key = value
    if (!key) return null
    const label = TargetTag[key]
    const colour = '#fafa'
    if (!colour) return null
    return renderPill(TargetTag[key], colour, label, { active: checked })
  }, [t])
  return (
    <MultiSelect
      value={value}
      onChange={onChange}
      data={targetTagValues}
      clearable
      renderPill={renderDamageTagPill}
      renderOption={renderDamageTagOption}
      classNames={{ dropdown: classes.dropdown, option: classes.option }}
      label='Target tags'
    />
  )
}
