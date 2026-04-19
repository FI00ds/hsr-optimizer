import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { memo } from 'react'

export const DpsScoreTeammateUpgradesTable = memo(function DpsScoreTeammateUpgradesTable() {
  const result = useSimScoringContext(ScoringSelector.Upgrades)
})
