import {
  Button,
  Drawer,
  Flex,
} from '@mantine/core'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import {
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  type CombatBuff,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import { useShallow } from 'zustand/react/shallow'

export function CombatBuffsDrawer() {
  const { close: closeBuffsDrawer, isOpen: isOpenBuffsDrawer } = useOpenClose(OpenCloseIDs.COMBAT_BUFFS_DRAWER)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  return (
    <Drawer
      title={t('Title')} // 'Extra combat buffs'
      position='right'
      onClose={closeBuffsDrawer}
      opened={isOpenBuffsDrawer}
      size={300}
    >
      {isOpenBuffsDrawer && <CombatBuffsDrawerContent />}
    </Drawer>
  )
}

function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })

  const { clearCombatBuffs, addCombatBuff, removeCombatBuff, combatBuffs } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
    combatBuffs: s.combatBuffs,
  })))

  return (
    <Flex direction='column' gap={defaultGap}>
      <Button
        fullWidth
        variant='default'
        onClick={clearCombatBuffs}
      >
        {t('Clear')}
      </Button>
      <Flex direction='column' gap={optimizerTabDefaultGap}>
        <BuffBuilder addBuff={addCombatBuff} />
        {combatBuffs
          .entries()
          .map(([id, buff]) => (
            <BuffPanel
              key={id}
              id={id}
              buff={buff}
              addBuff={addCombatBuff}
              removeBuff={removeCombatBuff}
            />
          ))}
      </Flex>
    </Flex>
  )
}

function validateStatBuff(
  stat: CombatStatBuff['statKey'] | undefined,
  value: CombatStatBuff['value'] | undefined,
): boolean {
  return stat != undefined && value != undefined
}

function BuffBuilder({
  addBuff,
}: {
  addBuff(buff: CombatBuff): void,
}) {
  const [mode, setMode] = useState<CombatBuffType>(CombatBuffType.StatBuff)

  // stat buff state
  const [stat, setStat] = useState<CombatStatBuff['statKey'] | undefined>()
  const [value, setValue] = useState<CombatStatBuff['value'] | undefined>()
  const [damageTag, setDamageTag] = useState<CombatStatBuff['damageTag'] | undefined>()
  const [targetTag, setTargetTag] = useState<CombatStatBuff['targetTag'] | undefined>()

  // action modifier state

  const addClicked = (() => {})()
  switch (mode) {
    case CombatBuffType.StatBuff:
      return <></>
    case CombatBuffType.ActionModifier:
      return <></>
  }
}

function BuffPanel({
  id,
  buff,
  addBuff,
  removeBuff,
}: {
  id: string,
  buff: CombatBuff,
  addBuff(buff: CombatBuff): void,
  removeBuff(key: string): void,
}) {
  const remove = useCallback(() => removeBuff(id), [removeBuff, id])
  return <></>
}
