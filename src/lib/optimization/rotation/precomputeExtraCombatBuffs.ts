import { Source } from 'lib/optimization/buffSource'
import {
  ALL_DAMAGE_TAGS,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  CombatBuffType,
  type Form,
} from 'types/form'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function precomputeExtraCombatBuffs(x: ComputedStatsContainer, request: Form): void {
  request.combatBuffs.forEach((buff) => {
    if (buff.type !== CombatBuffType.StatBuff) return
    const config = x.damageType(buff.damageTag ?? ALL_DAMAGE_TAGS)
      .targets(buff.targetTag ?? TargetTag.FullTeam)
      .source(Source.EXTRA_COMBAT_BUFFS)
    x.buff(buff.statKey, buff.value, config)
  })
}

export function precomputeExtraActionModifiers(request: Form, context: OptimizerContext) {
  request.combatBuffs.forEach((buff) => {
    if (buff.type !== CombatBuffType.ActionModifier) return
    const modify = (action: OptimizerAction, context: OptimizerContext) => {
      // TODO:
    }
    context.actionModifiers.push({ modify })
  })
}
