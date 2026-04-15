import {
  Divider,
  Flex,
} from '@mantine/core'
import {
  PartsArray,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { Assets } from 'lib/rendering/assets'
import { precisionRound } from 'lib/utils/mathUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { type CharacterId } from 'types/character'
import styles from './StatScoreRollSummary.module.css'

export const StatRollSummary = memo(function StatRollSummary({ displayRelics, characterId }: {
  displayRelics: SingleRelicByPart,
  characterId: CharacterId,
}) {
  const meta = useScoringMetadata(characterId)
  const rollInfoByStat = emptyRollInfoByStat()
  let totalRolls = 0
  for (const part of PartsArray) {
    const relic = displayRelics[part]
    if (!relic) continue
    for (const substat of relic.substats) {
      const rolls = substat.rolls
      if (!rolls) continue
      const stat = substat.stat
      rollInfoByStat[stat].rolls += rolls.high
      rollInfoByStat[stat].effectiveRolls += rolls.high * 1
      rollInfoByStat[stat].rolls += rolls.mid
      rollInfoByStat[stat].effectiveRolls += rolls.mid * 0.9
      rollInfoByStat[stat].rolls += rolls.low
      rollInfoByStat[stat].effectiveRolls += rolls.low * 0.8
      if (meta.stats[stat]) totalRolls += rolls.high + rolls.mid + rolls.low
    }
  }
  const orderedStats = Object.values(rollInfoByStat).sort((a, b) => meta.stats[b.stat] - meta.stats[a.stat])
  return (
    <Flex className={styles.container}>
      <div className={styles.totalRolls}>{totalRolls}</div>
      <Flex className={styles.statContainer}>
        {orderedStats.map((info) => (
          <StatQualityDisplay
            key={info.stat}
            {...info}
            weighted={meta.stats[info.stat] > 0}
          />
        ))}
      </Flex>
    </Flex>
  )
})

function StatQualityDisplay({ effectiveRolls, rolls, stat, weighted }: {
  effectiveRolls: number,
  rolls: number,
  stat: SubStats,
  weighted: boolean,
}) {
  const { t } = useTranslation('common')
  const isPercent = stat === Stats.ATK_P || stat === Stats.HP_P || stat === Stats.DEF_P
  const className = weighted ? styles.qualityDisplay : styles.unweightedQualityDisplay
  return (
    <Flex title={t(`ReadableStats.${stat}`)} style={{ opacity: weighted ? 1 : 0.2 }}>
      <img src={Assets.getStatIcon(stat, isPercent)} className={styles.statIcon} style={isPercent ? { position: 'relative', bottom: 3 } : undefined} />
      <div className={styles.qualityDisplay}>
        <span>{precisionRound(effectiveRolls)}</span>
        <Divider />
        <span>{rolls}</span>
      </div>
    </Flex>
  )
}

function emptyRollInfoByStat(): Record<SubStats, { effectiveRolls: number, rolls: number, stat: SubStats }> {
  return SubStats.reduce((acc, stat) => {
    acc[stat] = { effectiveRolls: 0, rolls: 0, stat }
    return acc
  }, {} as Record<SubStats, { effectiveRolls: number, rolls: number, stat: SubStats }>)
}
