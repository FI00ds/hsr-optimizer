import {
  Flex,
  Table,
  Tooltip,
} from '@mantine/core'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import {
  type DataIndex,
  type SharedScoreColumn,
  sharedScoreUpgradeColumns,
} from 'lib/characterPreview/summary/DpsScoreMainStatUpgradesTable'
import type { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import {
  memo,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'

import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import {
  getTeammateOption,
  isRelicOption,
} from 'lib/sets/setConfigRegistry'
import { Caret } from 'lib/ui/Caret'
import styles from './DpsScoreTeammateUpgradesTable.module.css'

const emptyGroupedUpgrade: GroupedUpgrade = {
  ids: new Set(),
  set: new Set(),
  simScore: 0,
  data: {
    damagePercentUpgrade: null,
    damageValueUpgrade: null,
    scorePercentUpgrade: null,
    scoreValueUpgrade: null,
  },
}

const alwaysRowsLength = 4
const emptyRows = Array.from<GroupedUpgrade>({ length: alwaysRowsLength }).fill(emptyGroupedUpgrade)

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable() {
  const result = useSimScoringContext(ScoringSelector.Upgrades)

  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.SubstatUpgradeComparisons' })

  const [showOptionRows, setShowOptionRows] = useState(false)

  const sharedCols = useMemo(() => sharedScoreUpgradeColumns(t), [t])

  const tableHead = (
    <Table.Thead>
      <Table.Tr>
        <Table.Th
          className={styles.headerCell}
          onClick={() => {
            if (result) setShowOptionRows(!showOptionRows)
          }}
        >
          <Flex style={{ gap: 16, marginLeft: 8, cursor: result === null ? undefined : 'pointer' }}>
            <Caret active={showOptionRows} />
            <span>{t('TeammateUpgrade') /* Teammate Upgrade */}</span>
          </Flex>
        </Table.Th>
        {sharedCols.map((col) => <Table.Th key={col.key} className={styles.centeredCell}>{col.title}</Table.Th>)}
      </Table.Tr>
    </Table.Thead>
  )

  if (!result) {
    return (
      <>
        <Table className={styles.table}>
          {tableHead}
          <Table.Tbody>
            {emptyRows.map((row, idx) => <Row key={idx} row={row} sharedCols={sharedCols} />)}
          </Table.Tbody>
        </Table>
      </>
    )
  }

  const form = result.simulationForm

  const groupedUpgrades = groupUpgrades(result.teammateOrnamentUpgradeResults, form, result.originalSimScore)

  const alwaysRows = groupedUpgrades.slice(0, alwaysRowsLength)
  const optionRows = groupedUpgrades.slice(alwaysRowsLength)

  return (
    <Table className={styles.table}>
      {tableHead}
      <Table.Tbody>
        {alwaysRows.map((row, idx) => <Row key={idx} row={row} sharedCols={sharedCols} />)}
        {showOptionRows && optionRows.map((row, idx) => <Row key={idx} row={row} sharedCols={sharedCols} />)}
      </Table.Tbody>
    </Table>
  )
})

function Row({ row, sharedCols }: { row: GroupedUpgrade, sharedCols: SharedScoreColumn[] }) {
  return (
    <Table.Tr>
      <Table.Td className={styles.centeredCell}>
        <Flex gap={8}>
          <span>
            {Array.from(row.ids).map((id) => <img src={Assets.getCharacterAvatarById(id)} key={id} height={iconSize} />)}
          </span>
          {row.oldSet && <TeammateSetImageWithTooltip value={row.oldSet} removed />}
          ➔
          <Flex>
            {Array.from(row.set).map((set) => <TeammateSetImageWithTooltip value={set} key={set} />)}
          </Flex>
        </Flex>
      </Table.Td>
      {sharedCols.map((col) => (
        <Table.Td key={col.key} className={styles.centeredCell}>
          {col.render(row.data[col.dataIndex])}
        </Table.Td>
      ))}
    </Table.Tr>
  )
}

interface GroupedUpgrade {
  ids: Set<CharacterId>
  set: Set<string>
  oldSet?: string
  simScore: number
  data: Record<DataIndex, number | null>
}

function groupUpgrades(upgrades: Array<SimulationStatUpgrade>, form: Form, originalSimScore: number): Array<GroupedUpgrade> {
  const groupedUpgrades: Array<GroupedUpgrade> = []
  upgrades.forEach((upgrade) => {
    const key = isRelicOption(upgrade.set!) ? 'teamRelicSet' : 'teamOrnamentSet'
    const simScore = upgrade.simulationResult.simScore
    const previousUpgrade = groupedUpgrades.at(-1)
    if (
      simScore === previousUpgrade?.simScore
      && form[upgrade.teammate!][key] === previousUpgrade.oldSet
    ) {
      previousUpgrade.ids.add(form[upgrade.teammate!].characterId)
      previousUpgrade.set.add(upgrade.set!)
    } else {
      groupedUpgrades.push({
        simScore,
        set: new Set([upgrade.set!]),
        ids: new Set([form[upgrade.teammate!].characterId]),
        oldSet: form[upgrade.teammate!][key],
        data: {
          scorePercentUpgrade: null,
          scoreValueUpgrade: null,
          damageValueUpgrade: simScore - originalSimScore,
          damagePercentUpgrade: 100 * (simScore - originalSimScore) / originalSimScore,
        },
      })
    }
  })
  return groupedUpgrades
}

function TeammateSetImageWithTooltip({ value, removed }: { value: string, removed?: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const height = iconSize
  const width = iconSize
  const option = getTeammateOption(value)
  if (!option) return null
  const desc = option.desc(t)
  return (
    <Tooltip label={desc}>
      <div style={{ display: 'flex', gap: 3, opacity: removed ? 0.4 : undefined }}>
        <img src={Assets.getSetImage(value)} style={{ width, height }} />
        {isRelicOption(value) && <img src={Assets.getSetImage(value)} style={{ width, height }} />}
      </div>
    </Tooltip>
  )
}
