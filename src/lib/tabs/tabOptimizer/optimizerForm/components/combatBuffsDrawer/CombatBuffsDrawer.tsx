import {
  Badge,
  Box,
  Button,
  Drawer,
  Flex,
  Group,
  HoverCard,
  NumberInput,
  SegmentedControl,
  Stack,
  TextInput,
  ActionIcon,
  Checkbox,
  type FloatingPosition,
  type SegmentedControlItem,
} from '@mantine/core'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import {
  getAKeyConfig,
  isFlatStat,
  isHitAKey,
} from 'lib/optimization/engine/config/keys'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import {
  Children,
  type PropsWithChildren,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  CombatBuffType,
  type CombatBuff,
  type CombatStatBuff,
} from 'types/form'
import { useShallow } from 'zustand/react/shallow'
import { DamageTagSelect, renderDamageTagPill } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/DamageTagSelect'
import { renderTargetTagPill, TargetTagSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/TargetTagSelect'
import { StatSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/StatSelect'
import { Message } from 'lib/interactions/message'
import { IconClipboard, IconCopy, IconFolderPlus, IconTrashFilled } from '@tabler/icons-react'
import { labelToString } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type TFunction } from 'i18next'
import { useCombatBuffStore } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'

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
      <CombatBuffsDrawerContent />
    </Drawer>
  )
}

function CombatBuffsDrawerContent() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'CombatBuffs' })
  const { t: tBuffPanel } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })

  const { clearCombatBuffs, addCombatBuff, removeCombatBuff, renameCombatBuff, combatBuffs } = useOptimizerRequestStore(useShallow((s) => ({
    clearCombatBuffs: s.clearCombatBuffs,
    addCombatBuff: s.addCombatBuff,
    renameCombatBuff: s.nameCombatBuff,
    removeCombatBuff: s.removeCombatBuff,
    combatBuffs: s.combatBuffs,
  })))

  const { loadBuffFromClipboard } = useCombatBuffStore(useShallow(s => ({
    loadBuffFromClipboard: s.loadBuffFromClipboard
  })))

  return (
    <Stack gap={defaultGap}>
      <Group >
        <Button
          flex={1}
          variant='default'
          onClick={clearCombatBuffs}
        >
          {t('Clear')}
        </Button>
        {/* TODO: handler*/}
        <ActionIcon ><IconFolderPlus /></ActionIcon>
        <ActionIcon onClick={loadBuffFromClipboard} ><IconClipboard /></ActionIcon>
      </Group>
      <Stack gap={optimizerTabDefaultGap}>
        <BuffBuilder addBuff={addCombatBuff} />
        {Object.entries(combatBuffs)
          .map(([id, buff]) => (
            <BuffPanel
              key={id}
              id={id}
              buff={buff}
              removeBuff={removeCombatBuff}
              renameBuff={renameCombatBuff}
              t={tBuffPanel}
            />
          ))}
      </Stack>
    </Stack>
  )
}

function BuffBuilder({
  addBuff,
}: {
  addBuff: (buff: CombatBuff) => void,
}) {
  const options: Array<SegmentedControlItem<CombatBuffType>> = [
    { value: CombatBuffType.StatBuff, label: 'Stat buff' },
    { value: CombatBuffType.ActionModifier, label: 'Action modifier', disabled: true },
  ]

  const { mode, setMode } = useCombatBuffStore(useShallow((s) => ({
    mode: s.buffBuilderMode,
    setMode: s.setBuffBuilderMode
  })))

  return (
    <div style={{ borderColor: 'red', borderRadius: 4, borderWidth: 1, borderStyle: 'solid', padding: 4 }}>
      <SegmentedControl fullWidth value={mode} onChange={setMode} data={options} data-autofocus />
      <StatBuffBuilder addBuff={addBuff} hidden={mode !== CombatBuffType.StatBuff} />
      <ActionModifierBuilder addBuff={addBuff} hidden={mode !== CombatBuffType.ActionModifier} />
    </div>
  )
}

function StatBuffBuilder({
  addBuff,
  hidden
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean
}) {
  const {
    stat,
    setStat,
    value,
    setValue,
    targetTag,
    setTargetTag,
    damageTags,
    setDamageTags
  } = useCombatBuffStore(useShallow((s) => ({
    stat: s.stat,
    setStat: s.setStat,
    value: s.value,
    setValue: s.setValue,
    targetTag: s.targetTag,
    setTargetTag: s.setTargetTag,
    damageTags: s.damageTags,
    setDamageTags: s.setDamageTags
  })))

  const suffix = getSuffix(stat)

  const damageTagsDisabled = stat !== null && !isHitAKey(stat)

  return (
    //TODO: add <Hint/> to the various selects
    <Stack gap={4} style={{ display: hidden ? 'none' : undefined }}>
      <Group gap={8}>
        <StatSelect value={stat} onChange={setStat} style={{ flex: 7 }} />
        <NumberInput
          flex={2}
          suffix={suffix}
          value={value}
          onChange={setValue}
          label='value'
          hideControls
        />
      </Group>
      <TargetTagSelect value={targetTag} onChange={setTargetTag} />
      <DamageTagSelect disabled={damageTagsDisabled} value={damageTags} onChange={setDamageTags} />
      <Button
        onClick={() => {
          const buff = validateStatBuff(stat, value, damageTags, targetTag)
          if (!buff) return
          addBuff(buff)
        }}
      >
        Apply buff
      </Button>
    </Stack>
  )
}

function validateStatBuff(
  statKey: CombatStatBuff['statKey'] | null,
  value: CombatStatBuff['value'] | string,
  damageTags: CombatStatBuff['damageTags'],
  targetTag: CombatStatBuff['targetTag'] | null
): CombatStatBuff | null {
  if (statKey === null) {
    Message.error('stat is missing')
    return null
  }
  if (typeof value === 'string') {
    Message.error('invalid value')
    return null
  }
  if (damageTags.length && !isHitAKey(statKey)) {
    // this shouldn't fire due to the special handling setStat, but just to be safe
    Message.error('stat not compatible with damage type filtering')
    return null
  }
  return {
    statKey,
    value,
    damageTags,
    targetTag: targetTag ?? TargetTag.FullTeam,
    type: CombatBuffType.StatBuff,
    name: ''
  }
}

function getSuffix(stat: CombatStatBuff['statKey'] | null): string | undefined {
  if (stat === null || isFlatStat(stat)) return
  return '%'
}

function ActionModifierBuilder({
  addBuff,
  hidden
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean
}) {
  return <Flex style={{ display: hidden ? 'none' : undefined }}></Flex>
}

function BuffPanel({
  id,
  buff,
  removeBuff,
  renameBuff,
  t
}: {
  id: string
  buff: CombatBuff,
  removeBuff: (key: string) => void,
  renameBuff: (id: string, name: string) => void
  t: TFunction<"optimizerTab", "ExpandedDataPanel.DamageTags">
}) {
  return buff.type === CombatBuffType.StatBuff
    ? <StatBuffPanel id={id} buff={buff} removeBuff={removeBuff} renameBuff={renameBuff} t={t} />
    : (
      <></>
    )
}

function StatBuffPanel({
  id,
  buff,
  removeBuff,
  renameBuff,
  t
}: {
  id: string,
  buff: CombatStatBuff,
  removeBuff: (key: string) => void
  renameBuff: (id: string, name: string) => void
  t: TFunction<"optimizerTab", "ExpandedDataPanel.DamageTags">
}) {
  const remove = () => removeBuff(id)
  const { label, flat } = getAKeyConfig(buff.statKey)
  const statLabel = labelToString(label)
  return (
    <Group gap='xs' justify='space-between' style={{ borderColor: 'red', borderRadius: 4, borderWidth: 1, borderStyle: 'solid', padding: 4 }}>
      <Checkbox />
      <Stack flex={1}>
        <TextInput value={buff.name} onChange={(e) => renameBuff(id, e.currentTarget.value)} placeholder='name this buff?' />
        <Group>
          <span>{statLabel}</span>
          <span>{`${buff.value}${flat ? '' : '%'}`}</span>
          {renderTargetTagPill(buff.targetTag, t, true)}
          <TagContainer>
            {buff.damageTags.map((tag) => renderDamageTagPill(tag, t, true))}
          </TagContainer>
        </Group>
      </Stack>
      <Stack>
        <ActionIcon aria-label='Copy buff'>
          <IconCopy onClick={() => copyBuffToClipboard(buff)} />
        </ActionIcon>
        <ActionIcon aria-label='Delete buff' onClick={remove}>
          <IconTrashFilled />
        </ActionIcon>
      </Stack>
    </Group>
  )
}

interface TagContainerProps extends PropsWithChildren {
  popoverPosition?: FloatingPosition
}

function TagContainer({ children, popoverPosition }: TagContainerProps) {
  const [first, ...rest] = Children.toArray(children)
  if (!first) return null
  const target = (
    <Group gap={4} wrap="nowrap">
      {first}

      {rest.length && (
        <Badge
          size="xs"
          variant="light"
          color="gray"
          px={5}
        >
          +{rest.length}
        </Badge>
      )}
    </Group>
  )
  if (!rest.length) return target
  return (
    <HoverCard
      width="max-content"
      position={popoverPosition}
      withArrow
      shadow="md"
    >
      <HoverCard.Target>
        {target}
      </HoverCard.Target>
      <HoverCard.Dropdown p='xs'>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
            justifyItems: 'center'
          }}
        >
          {rest}
        </Box>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}

async function copyBuffToClipboard(buff: CombatBuff) {
  await navigator.clipboard.writeText(JSON.stringify(buff))
    .then(() => {
      Message.success('Copied to clipboard successfully')
    })
    .catch((e: DOMException) => {
      if (e.name === 'NotAllowedError') {
        Message.error('browser denied clipboard access, please ensure the website has clipboard permissions.')
      } else {
        Message.error(`Copy to clipboard failed with error ${e.name} with message ${e.message}`)
      }
    })
}