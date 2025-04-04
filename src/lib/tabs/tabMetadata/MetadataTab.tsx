import { Collapse, Flex } from 'antd'
import gameData from 'data/game_data.json'
import { Sets, Stats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { AppPages, DB } from 'lib/state/db'
import React, { useState } from 'react'
import { StringToNumberMap } from 'types/common'
import { ReactElement } from 'types/components'
import { DBMetadataCharacter } from 'types/metadata'

const setToIndex: StringToNumberMap = {}
const iconSize = 40

export default function MetadataTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.METADATA_TEST) {
    // Don't load unless tab active
    return (<></>)
  }

  return (
    <Flex vertical style={{ width: 3000, height: 'fit-content' }}>
      <h1 style={{ marginLeft: 20 }}>
        Metadata viewer
      </h1>
      <Collapse
        items={[
          {
            key: '1',
            label: 'Simulation sets',
            children: <SimulationEquivalentSetsDashboard/>,
          },
          {
            key: '2',
            label: 'Conditional sets presets',
            children: <ConditionalSetsPresetsDashboard/>,
          },
          {
            key: '3',
            label: 'Substat weight dashboard',
            children: <SubstatWeightDashboard/>,
          },
        ]}
      />
    </Flex>
  )
}

// =========================================== SubstatWeightDashboard ===========================================

function SubstatWeightDashboard() {
  // @ts-ignore
  const sets = gameData.relics.slice().reverse()
  const characters = Object.values(DB.getMetadata().characters)

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }

  return (
    <Flex vertical gap={10}>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Destruction'), sets)}/>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Hunt'), sets)}/>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Erudition'), sets)}/>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Nihility'), sets)}/>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Remembrance'), sets)}/>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Preservation'), sets)}/>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Harmony'), sets)}/>
      <GridDisplay grid={generateSubstatWeightGrid(characters.filter((x) => x.path == 'Abundance'), sets)}/>
    </Flex>
  )
}

function generateSubstatWeightGrid(characters: DBMetadataCharacter[], sets: (typeof gameData.relics)) {
  const weightedStats = [
    Stats.ATK_P,
    Stats.DEF_P,
    Stats.HP_P,
    Stats.SPD,
    Stats.CR,
    Stats.CD,
    Stats.EHR,
    Stats.RES,
    Stats.BE,
  ]

  const substatAssets = weightedStats.map((x) => Assets.getStatIcon(x))
  substatAssets.unshift(Assets.getBlank())

  const assetByCharacterThenStat: ReactElement[][] = [[]]

  for (let j = 0; j < weightedStats.length + 1; j++) {
    assetByCharacterThenStat[0][j] = <Icon src={substatAssets[j]}/>
  }

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
    const rowAssets: ReactElement[] = []

    rowAssets.push(<Icon src={Assets.getCharacterAvatarById(character.id)}/>)
    for (const stat of weightedStats) {
      const value = character.scoringMetadata.stats[stat]
      rowAssets.push(<div>{value || ''}</div>)
    }

    assetByCharacterThenStat.push(rowAssets)
  }

  return assetByCharacterThenStat
}

// =========================================== ConditionalSetsPresetsDashboard ===========================================

const presetToSetMapping: Record<string, string> = {
  fnAshblazingSet: Sets.TheAshblazingGrandDuke,
  fnPioneerSet: Sets.PioneerDiverOfDeadWaters,
  fnSacerdosSet: Sets.SacerdosRelivedOrdeal,
  PRISONER_SET: Sets.PrisonerInDeepConfinement,
  WASTELANDER_SET: Sets.WastelanderOfBanditryDesert,
  VALOROUS_SET: Sets.TheWindSoaringValorous,
  BANANA_SET: Sets.TheWondrousBananAmusementPark,
}

function ConditionalSetsPresetsDashboard() {
  // @ts-ignore
  const sets = gameData.relics.slice().reverse()
  const characters = Object.values(DB.getMetadata().characters)

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }

  return (
    <Flex vertical gap={10}>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Destruction'), sets)}/>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Hunt'), sets)}/>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Erudition'), sets)}/>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Nihility'), sets)}/>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Remembrance'), sets)}/>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Preservation'), sets)}/>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Harmony'), sets)}/>
      <GridDisplay grid={generateConditionalSetsGrid(characters.filter((x) => x.path == 'Abundance'), sets)}/>
    </Flex>
  )
}

function generateConditionalSetsGrid(characters: DBMetadataCharacter[], sets: (typeof gameData.relics)) {
  const relicAssets = sets.map((x) => Assets.getSetImage(x.name))
  relicAssets.unshift(Assets.getBlank())

  const assetByCharacterThenSet: ReactElement[][] = [[]]

  for (let j = 0; j < sets.length + 1; j++) {
    assetByCharacterThenSet[0][j] = <Icon src={relicAssets[j]}/>
  }

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
    const rowAssets: ReactElement[] = []
    rowAssets.push(<Icon src={Assets.getCharacterAvatarById(character.id)}/>)

    for (const preset of character.scoringMetadata.presets) {
      const set = presetToSetMapping[preset.name]
      const setIndex = setToIndex[set]

      rowAssets[setIndex + 1] = <div>{preset.value === true ? '⚪' : preset.value}</div>
    }

    assetByCharacterThenSet.push(rowAssets)
  }

  return assetByCharacterThenSet
}

// =========================================== SimulationEquivalentSetsDashboard ===========================================

function SimulationEquivalentSetsDashboard() {
  // @ts-ignore
  const sets = gameData.relics.slice().reverse()
  const characters = Object.values(DB.getMetadata().characters)
  const simulationCharacters = characters.filter((x) => x.scoringMetadata.simulation)

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }

  return (
    <Flex vertical gap={50}>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Destruction'), sets)}/>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Hunt'), sets)}/>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Erudition'), sets)}/>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Nihility'), sets)}/>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Remembrance'), sets)}/>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Preservation'), sets)}/>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Harmony'), sets)}/>
      <GridDisplay grid={generateEquivalentSetsGrid(simulationCharacters.filter((x) => x.path == 'Abundance'), sets)}/>
    </Flex>
  )
}

function generateEquivalentSetsGrid(characters: DBMetadataCharacter[], sets: (typeof gameData.relics)) {
  const relicAssets = sets.map((x) => Assets.getSetImage(x.name))
  relicAssets.unshift(Assets.getBlank())

  const assetByCharacterThenSet: ReactElement[][] = [[]]

  for (let j = 0; j < sets.length + 1; j++) {
    assetByCharacterThenSet[0][j] = <Icon src={relicAssets[j]}/>
  }

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
    const rowAssets: ReactElement[] = []
    rowAssets.push(<Icon src={Assets.getCharacterAvatarById(character.id)}/>)

    for (const allowedSets of character.scoringMetadata.simulation!.relicSets) {
      if (allowedSets.length == 2) {
        // 4p
        const setIndex = setToIndex[allowedSets[0]]
        rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(allowedSets[0])}/>
      } else {
        // 2p2p
        for (const p2 of allowedSets) {
          const setIndex = setToIndex[p2]
          rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(p2)}/>
        }
      }
    }

    for (const p2 of character.scoringMetadata.simulation!.ornamentSets) {
      const setIndex = setToIndex[p2]
      rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(p2)}/>
    }

    assetByCharacterThenSet.push(rowAssets)
  }

  return assetByCharacterThenSet
}

// =========================================== Utils ===========================================

function Icon(props: {
  src: string
}): ReactElement {
  return (
    <img src={props.src} style={{ width: 40 }}/>
  )
}

function GridDisplay(props: {
  grid: (ReactElement | string)[][]
}) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)

  for (const row of props.grid) {
    for (let i = 0; i < Object.values(setToIndex).length + 1; i++) {
      if (!row[i]) {
        // @ts-ignore
        row[i] = null
      }
    }
  }

  return (
    <table style={{ borderCollapse: 'collapse', width: 'fit-content', lineHeight: '0px' }}>
      <tbody>
        {props.grid.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.11)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            {row.map((cell, colIndex) => (
              <td
                key={`${rowIndex}-${colIndex}`}
                style={{
                  height: iconSize,
                  width: iconSize,
                  border: '1px solid #464d6bc4',
                  padding: 0,
                  textAlign: 'center',
                  backgroundColor: hoveredColumn === colIndex ? 'rgba(255,255,255,0.11)' : '', // Apply background on hover
                }}
                onMouseEnter={() => setHoveredColumn(colIndex)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <div>
                  {cell || ''}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
