import { Select } from "@mantine/core";
import i18next from "i18next";
import { AKey, type AKeyValue, type AKeyType } from "lib/optimization/engine/config/keys";
import { newStatsConfig } from "lib/optimization/engine/config/statsConfig";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

const statOptions = (Object.keys(newStatsConfig) as AKeyType[])

function generateStatOptions(): Array<{ value: AKeyValue, label: string }> {
  return statOptions.map((statKey) => {
    const { label } = newStatsConfig[statKey]
    return {
      value: AKey[statKey],
      label: i18next.t(label.key, '', { ns: label.ns, ...label.args }) as string
    }
  })
}

export function StatSelect({
  value,
  onChange,
  style
}: {
  value: AKeyValue | null
  onChange(value: AKeyValue | null): void
  style?: React.CSSProperties
}) {
  const { i18n } = useTranslation()
  const statOptions = useMemo(() => generateStatOptions(), [i18n.resolvedLanguage])

  return (
    <Select
      style={style}
      data={statOptions}
      value={value}
      onChange={onChange}
      clearable
      searchable
      label='Stat'
    />
  )
}