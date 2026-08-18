import { Source } from 'lib/optimization/buffSource'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  CombatBuffType,
  type Form,
} from 'types/form'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import {
  getAKeyConfig,
  isHitAKey,
} from '../engine/config/keys'

export function precomputeExtraCombatBuffs(x: ComputedStatsContainer, request: Form): void {
  Object.values(request.combatBuffs).forEach((buff) => {
    if (buff.type !== CombatBuffType.StatBuff) return

    const { statKey, value: preValue, targetTags, damageTags } = buff
    const value = getAKeyConfig(statKey).flat ? preValue : (preValue / 100)
    if (damageTags.length && isHitAKey(statKey)) {
      const config = x
        .damageType(damageTags.reduce((acc, cur) => acc |= cur))
        .targets(targetTags.reduce((acc, cur) => acc |= cur))
        .source(Source.EXTRA_COMBAT_BUFFS)
      x.buff(statKey, value, config)
    } else {
      const config = x
        .targets(targetTags.reduce((acc, cur) => acc |= cur))
        .source(Source.EXTRA_COMBAT_BUFFS)
      x.buff(statKey, value, config)
    }
  })
}

export function precomputeExtraActionModifiers(request: Form, context: OptimizerContext) {
  Object.values(request.combatBuffs).forEach((buff) => {
    if (buff.type !== CombatBuffType.ActionModifier) return
    const modify = (action: OptimizerAction, context: OptimizerContext) => {
      // TODO:
    }
    context.actionModifiers.push({ modify })
  })
}
