import {
  Flex,
  Table,
} from '@mantine/core'
import { TeammateSetImageWithTooltip } from 'lib/characterPreview/summary/DpsScoreTeammateUpgradesTable'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import {
  calculateTeammateUpgrades,
  type OptimizerResultAnalysis,
  type TeammateSetUpgrade,
} from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { memo } from 'react'

import { useToggle } from 'lib/hooks/useToggle'
import { GlobalRegister } from 'lib/optimization/engine/config/keys'
import { Caret } from 'lib/ui/Caret'
import { useTranslation } from 'react-i18next'
import styles from './TeammateUpgrades.module.css'

export const TeammateUpgrades = memo(function TeammateUpgrades({ analysis }: { analysis: OptimizerResultAnalysis }) {
  const groupedUpgrades = calculateTeammateUpgrades(analysis)
  const [showOptionRows, toggleOptionRows] = useToggle()
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.TeammateUpgrades.ColumnHeaders' })

  const baseSimScore = analysis.newX.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)

  const alwaysRows = groupedUpgrades.slice(0, 4)
  const optionRows = groupedUpgrades.slice(4)

  return (
    <Table className={styles.upgradeTable}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={styles.setsHeader} onClick={toggleOptionRows}>
            <Caret active={showOptionRows} />
            {t('Ornaments')}
          </Table.Th>
          <Table.Th className={styles.columnHeader}>{t('COMBO_DMG_P')}</Table.Th>
          <Table.Th className={styles.columnHeader}>{t('COMBO_DMG')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {alwaysRows.map((group, idx) => <Row group={group} comboDamage={baseSimScore} key={idx} />)}
        {showOptionRows && optionRows.map((group, idx) => <Row group={group} comboDamage={baseSimScore} key={idx} />)}
      </Table.Tbody>
    </Table>
  )
})

function Row({ comboDamage, group }: { comboDamage: number, group: TeammateSetUpgrade }) {
  return (
    <Table.Tr>
      <Table.Td>
        <Flex gap={8} className={styles.iconRow}>
          <span style={{ height: iconSize }}>
            {Array.from(group.ids).map((id) => <img src={Assets.getCharacterAvatarById(id)} key={id} height={iconSize} />)}
          </span>
          {group.oldSet && <TeammateSetImageWithTooltip value={group.oldSet} removed />}
          ➔
          <Flex>
            {Array.from(group.set).map((set) => <TeammateSetImageWithTooltip value={set} key={set} />)}
          </Flex>
        </Flex>
      </Table.Td>
      <Table.Td className={styles.centeredCell}>{(100 * (group.simScore - comboDamage) / comboDamage).toFixed(2)}%</Table.Td>
      <Table.Td className={styles.centeredCell}>{(group.simScore - comboDamage).toFixed(1)}</Table.Td>
    </Table.Tr>
  )
}
