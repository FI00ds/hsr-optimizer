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
} from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { memo } from 'react'

import { GlobalRegister } from 'lib/optimization/engine/config/keys'
import styles from './TeammateUpgrades.module.css'

export const TeammateUpgrades = memo(function TeammateUpgrades({ analysis }: { analysis: OptimizerResultAnalysis }) {
  const groupedUpgrades = calculateTeammateUpgrades(analysis)

  const baseSimScore = analysis.newX.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)

  return (
    <Table className={styles.upgradeTable}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th className={styles.setsHeader}>a</Table.Th>
          <Table.Th className={styles.columnHeader}>b</Table.Th>
          <Table.Th className={styles.columnHeader}>c</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {groupedUpgrades.map((group, idx) => (
          <Table.Tr key={idx}>
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
            <Table.Td className={styles.centeredCell}>{(100 * (group.simScore - baseSimScore) / baseSimScore).toFixed(2)}%</Table.Td>
            <Table.Td className={styles.centeredCell}>{(group.simScore - baseSimScore).toFixed(1)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
})
