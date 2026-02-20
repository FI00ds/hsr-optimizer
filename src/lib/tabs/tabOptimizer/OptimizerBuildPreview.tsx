import { Flex } from 'antd'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'

import RelicModal from 'lib/overlays/modals/RelicModal'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { AppPages } from 'lib/state/db'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { useState } from 'react'
import { Relic } from 'types/relic'

const partToIndex: Record<Parts, number> = {
  [Parts.Head]: 0,
  [Parts.Hands]: 1,
  [Parts.Body]: 2,
  [Parts.Feet]: 3,
  [Parts.PlanarSphere]: 4,
  [Parts.LinkRope]: 5,
}

const indexToPart: Record<number, Parts> = {
  0: Parts.Head,
  1: Parts.Hands,
  2: Parts.Body,
  3: Parts.Feet,
  4: Parts.PlanarSphere,
  5: Parts.LinkRope,
}

export default function OptimizerBuildPreview() {
  const {
    optimizerBuild,
    activeKey,
    optimizerTabFocusCharacter: characterId,
    relicsById,
  } = window.store()

  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)

  if (activeKey !== AppPages.OPTIMIZER || characterId == undefined) {
    return <></>
  }

  function onEditOk(relic: Relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic!, relic)
    setSelectedRelic(updatedRelic)
  }

  const next = () => {
    if (!selectedRelic || !optimizerBuild) {
      return
    }
    let startingIndex = partToIndex[selectedRelic.part] + 1
    let nextRelic: Relic | undefined
    for (let i = startingIndex; i < startingIndex + 6; i++) {
      nextRelic = relicsById[optimizerBuild[indexToPart[i % 6]]!]
      if (nextRelic) {
        return setSelectedRelic(nextRelic)
      }
    }
  }
  const prev = () => {
    if (!selectedRelic || !optimizerBuild) {
      return
    }
    let startingIndex = partToIndex[selectedRelic.part] + 5
    let nextRelic: Relic | undefined
    for (let i = startingIndex; i > startingIndex - 6; i--) {
      nextRelic = relicsById[optimizerBuild[indexToPart[i % 6]]!]
      if (nextRelic) {
        return setSelectedRelic(nextRelic)
      }
    }
  }

  const relicPreviews = Object.values(Constants.Parts).map((part) => {
    const id = optimizerBuild?.[part]
    const relic = id ? relicsById[id] : null
    const score = relic ? RelicScorer.scoreCurrentRelic(relic, characterId) : undefined
    return (
      <RelicPreview
        key={part}
        characterId={characterId}
        setEditModalOpen={setEditModalOpen}
        setSelectedRelic={setSelectedRelic}
        relic={relic}
        score={score}
        highlightDesiredStats
      />
    )
  })

  return (
    <div>
      <Flex gap={5} id='optimizerBuildPreviewContainer' justify='space-between' style={{ paddingLeft: 1, paddingRight: 1 }}>
        {relicPreviews}
      </Flex>
      <RelicModal selectedRelic={selectedRelic} onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} next={next} prev={prev} />
    </div>
  )
}
