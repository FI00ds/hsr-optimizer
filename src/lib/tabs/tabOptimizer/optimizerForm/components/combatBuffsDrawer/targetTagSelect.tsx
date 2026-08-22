import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type CombatStatBuff } from 'types/form'
import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'
import { renderPill } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { PillMultiSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/PillMultiSelect'
import { type TFunction } from 'i18next'
import { Combobox, Select } from '@mantine/core'

export const targetTagValues = [
  // Self not meaningful?
  // TargetTag.Self,
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
  value: CombatStatBuff['targetTag'] | null,
  onChange: (tag: CombatStatBuff['targetTag'] | null) => void,
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

  const options = useMemo(() => {
    return targetTagValues.map((tag) => renderTargetTagPill(tag, t, false))
  }, [t])
  return (
    <Combobox></Combobox>
  )
}

//TODO: colours per target tag, target tag labels
export function renderTargetTagPill(tag: TargetTag, t: TFunction<"optimizerTab", "ExpandedDataPanel.DamageTags">, active?: boolean) {
  return renderPill(TargetTag[tag], '#fafa', TargetTag[tag], { active })
}