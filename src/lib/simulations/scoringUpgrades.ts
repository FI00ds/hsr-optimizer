import type { MainStatParts } from 'lib/constants/constants'
import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { applyScoringFunction } from 'lib/scoring/simScoringUtils'
import type {
  ScoringParams,
  SimulationFlags,
} from 'lib/scoring/simScoringUtils'
import { teammateOrnamentOptions } from 'lib/sets/setConfigRegistry'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import type {
  RunStatSimulationsResult,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import { partsToFilterMapping } from 'lib/simulations/utils/benchmarkUtils'
import { clone } from 'lib/utils/objectUtils'
import type { Form } from 'types/form'
import type { SimulationMetadata } from 'types/metadata'
import type { OptimizerContext } from 'types/optimizer'

export type SimulationStatUpgrade = {
  simulation: Simulation,
  simulationResult: RunStatSimulationsResult,
  // part and stat used for mainstatUpgrades
  part?: MainStatParts,
  stat?: string,
  // set and teammate used for teammateOrnamentUpgrades
  set?: string,
  teammate?: typeof teammateKeys[number],
  // not present for teammateOrnamentUpgrades
  percent?: number,
}

export function generateStatImprovements(
  originalSim: Simulation,
  benchmarkRequest: SimulationRequest,
  simulationForm: Form,
  context: OptimizerContext,
  metadata: SimulationMetadata,
  flags: SimulationFlags,
  scoringParams: ScoringParams,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,
) {
  // Upgrade substats
  const substatUpgradeResults: SimulationStatUpgrade[] = []
  for (const substatType of metadata.substats) {
    const stat: string = substatType
    const originalSimClone: Simulation = clone(originalSim)
    originalSimClone.request.stats[stat] = (originalSimClone.request.stats[stat] ?? 0) + 1.0

    const statImprovementResult = runStatSimulations([originalSimClone], simulationForm, context, {
      ...scoringParams,
      substatRollsModifier: (num: number) => num,
    })[0]

    applyScoringFunction(statImprovementResult, metadata, true, true)
    substatUpgradeResults.push({
      stat: stat,
      simulation: originalSimClone,
      simulationResult: statImprovementResult,
    })
  }

  // Upgrade set
  const setUpgradeResults: SimulationStatUpgrade[] = []
  const originalSimClone: Simulation = clone(originalSim)
  originalSimClone.request.simRelicSet1 = benchmarkRequest.simRelicSet1
  originalSimClone.request.simRelicSet2 = benchmarkRequest.simRelicSet2
  originalSimClone.request.simOrnamentSet = benchmarkRequest.simOrnamentSet

  const setUpgradeResult = runStatSimulations([originalSimClone], simulationForm, context, {
    ...scoringParams,
    substatRollsModifier: (num: number) => num,
  })[0]

  applyScoringFunction(setUpgradeResult, metadata, true, true)
  setUpgradeResults.push({
    simulation: originalSimClone,
    simulationResult: setUpgradeResult,
  })

  // Upgrade mains
  const mainUpgradeResults: SimulationStatUpgrade[] = []

  function upgradeMain(part: MainStatParts) {
    for (const upgradeMainStat of metadata.parts[part]) {
      const originalSimClone: Simulation = clone(originalSim)
      const simMainName = partsToFilterMapping[part]
      const simMainStat: string = originalSimClone.request[simMainName]
      if (flags.forceErrRope && simMainStat === Stats.ERR) continue
      if (upgradeMainStat === simMainStat) continue
      if (upgradeMainStat === Stats.SPD) continue
      if (simMainStat === Stats.SPD) continue

      originalSimClone.request[simMainName] = upgradeMainStat
      const mainUpgradeResult = runStatSimulations([originalSimClone], simulationForm, context, {
        ...scoringParams,
        substatRollsModifier: (num: number) => num,
      })[0]

      applyScoringFunction(mainUpgradeResult, metadata, true, true)
      const simulationStatUpgrade = {
        stat: upgradeMainStat,
        part: part,
        simulation: originalSimClone,
        simulationResult: mainUpgradeResult,
      }
      mainUpgradeResults.push(simulationStatUpgrade)
    }
  }

  upgradeMain(Parts.Body)
  upgradeMain(Parts.Feet)
  upgradeMain(Parts.PlanarSphere)
  upgradeMain(Parts.LinkRope)

  for (const upgrade of [...substatUpgradeResults, ...setUpgradeResults, ...mainUpgradeResults]) {
    const upgradeSimScore = upgrade.simulationResult.simScore
    const percent = upgradeSimScore >= benchmarkSimScore
      ? 1 + (upgradeSimScore - benchmarkSimScore) / (maximumSimScore - benchmarkSimScore)
      : (upgradeSimScore - baselineSimScore) / (benchmarkSimScore - baselineSimScore)
    upgrade.percent = percent
  }

  // Sort upgrades descending
  substatUpgradeResults.sort((a, b) => b.percent! - a.percent!)
  setUpgradeResults.sort((a, b) => b.percent! - a.percent!)
  mainUpgradeResults.sort((a, b) => b.percent! - a.percent!)

  return { substatUpgradeResults, setUpgradeResults, mainUpgradeResults }
}

export function generateTeammateImprovements(
  originalSim: Simulation,
  simulationForm: Form,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,
): SimulationStatUpgrade[] {
  const teamOrnamentUpgradeResults: SimulationStatUpgrade[] = []

  teammateKeys.forEach((teammateKey) => {
    teammateOrnamentOptions.forEach((ornament) => {
      if (simulationForm[teammateKey].teamOrnamentSet === ornament.value) return
      const originalSimClone = clone(originalSim)
      const form = {
        ...simulationForm,
        [teammateKey]: {
          ...simulationForm[teammateKey],
          teamOrnamentSet: ornament.value,
        },
        trace: true,
      }
      const context = generateContext(form)
      const upgradeResult = runStatSimulations([originalSimClone], form, context, {
        ...scoringParams,
        substatRollsModifier: (num: number) => num,
      })[0]
      applyScoringFunction(upgradeResult, metadata, true, true)
      const teammateOrnamentUpgrade = {
        set: ornament.value,
        teammate: teammateKey,
        simulation: originalSimClone,
        simulationResult: upgradeResult,
      }
      teamOrnamentUpgradeResults.push(teammateOrnamentUpgrade)
    })
  })

  const maximumDelta = maximumSimScore - benchmarkSimScore
  const benchmarkDelta = benchmarkSimScore - baselineSimScore

  teamOrnamentUpgradeResults.forEach((result) => {
    const resultSimScore = result.simulationResult.simScore
    result.percent = resultSimScore > benchmarkSimScore
      ? 1 + (resultSimScore - benchmarkSimScore) / maximumDelta
      : (resultSimScore - baselineSimScore) / benchmarkDelta
  })

  teamOrnamentUpgradeResults.sort((a, b) => {
    const simScoreDelta = b.simulationResult.simScore - a.simulationResult.simScore
    if (simScoreDelta) return simScoreDelta
    const setDelta = a.set!.localeCompare(b.set!)
    if (setDelta) return setDelta
    return -1
  })

  return teamOrnamentUpgradeResults
}

const teammateKeys = ['teammate0', 'teammate1', 'teammate2'] as const
