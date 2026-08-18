import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type CombatStatBuff } from 'types/form'
import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { PillMultiSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/PillMultiSelect'
import { type TFunction } from 'i18next'

const targetTagValues = [
  // Self not meaningful?
  // TargetTag.Self,
  TargetTag.Pet,
  TargetTag.Memosprite,
  TargetTag.Summon,
  TargetTag.FullTeam,
  TargetTag.SingleTarget,
  // redundant tags just make it more messy?
  // TargetTag.SelfAndPet,
  // TargetTag.SelfAndMemosprite,
  // TargetTag.SelfAndSummon
]

export function TargetTagSelect({
  value,
  onChange,
}: {
  value: CombatStatBuff['targetTags'],
  onChange(tag: CombatStatBuff['targetTags']): void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const renderDamageTagPill = useCallback(({ value }: { value?: TargetTag }) => {
    const key = value
    if (!key) return null
    return renderTargetTagPill(key, t, true)
  }, [t])

  const renderDamageTagOption = useCallback(({ option: { value }, checked }: { option: { value: TargetTag }, checked?: boolean }) => {
    const key = value
    if (!key) return null
    return renderTargetTagPill(key, t, checked)
  }, [t])
  return (
    <PillMultiSelect
      value={value}
      onChange={onChange}
      options={targetTagValues}
      renderPills={renderDamageTagPill}
      renderOptions={renderDamageTagOption}
      label='Target tags'
    />
  )
}

//TODO: colours per target tag, target tag labels
export function renderTargetTagPill(tag: TargetTag, t: TFunction<"optimizerTab", "ExpandedDataPanel.DamageTags">, active?: boolean) {
  return renderPill(TargetTag[tag], '#fafa', TargetTag[tag], { active })
}