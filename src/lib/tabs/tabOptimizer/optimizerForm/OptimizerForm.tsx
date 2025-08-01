import {
  Flex,
  Form as AntDForm,
} from 'antd'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { OpenCloseIDs } from 'lib/hooks/useOpenClose'
import { Optimizer } from 'lib/optimization/optimizer'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import {
  generateConditionalResolverMetadata,
  updateConditionalChange,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import { AdvancedOptionsPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/AdvancedOptionsPanel'
import CharacterSelectorDisplay from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelectorDisplay'
import { CombatBuffsDrawer } from 'lib/tabs/tabOptimizer/optimizerForm/components/CombatBuffsDrawer'
import { ComboFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/ComboFilter'
import { EnemyConfigurationsDrawer } from 'lib/tabs/tabOptimizer/optimizerForm/components/EnemyConfigurationsDrawer'
import { FormSetConditionals } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormSetConditionals'
import OptimizerOptionsDisplay from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerOptionsDisplay'
import { OptimizerTabCharacterPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/OptimizerTabCharacterPanel'
import RelicMainSetFilters from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicMainSetFilters'
import {
  MinMaxRatingFilters,
  MinMaxStatFilters,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/ResultFilters'
import { StatSimulationDisplay } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { SubstatWeightFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/SubstatWeightFilters'
import TeammateCard from 'lib/tabs/tabOptimizer/optimizerForm/components/TeammateCard'
import FilterContainer from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterContainer'
import FormCard from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import {
  FormRow,
  OptimizerMenuIds,
  TeammateFormRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { Utils } from 'lib/utils/utils'
import {
  useEffect,
  useMemo,
} from 'react'
import { Form } from 'types/form'
import { DBMetadata } from 'types/metadata'

export const optimizerFormCache: Record<string, Form> = {}

export default function OptimizerForm() {
  console.log('======================================================================= RENDER OptimizerForm')
  const [optimizerForm] = AntDForm.useForm<Form>()
  window.optimizerForm = optimizerForm

  // On first load, load from last session, else display the first character from the roster
  useEffect(() => {
    const characters = DB.getCharacters() || []
    const savedSessionCharacterId = window.store.getState().savedSession[SavedSessionKeys.optimizerCharacterId]
    OptimizerTabController.updateCharacter(savedSessionCharacterId ?? characters[0]?.id)
  }, [])

  const dbMetadata = useMemo(() => DB.getMetadata(), [])

  const onValuesChange = (changedValues: Form, allValues: Form, bypass: boolean = false) => {
    if (!changedValues || !allValues?.characterId) return
    const keys = Object.keys(changedValues)

    if (
      keys.length == 1
      && (keys[0] == 'characterConditionals' || keys[0] == 'lightConeConditionals' || keys[0] == 'setConditionals' || keys[0].startsWith('teammate'))
    ) {
      updateConditionalChange(changedValues)
    }

    if (bypass) {
      // Only allow certain values to refresh permutations.
      // Sliders should only update at the end of the drag
    } else if (
      keys.length == 1 && (
        keys[0].startsWith('min')
        || keys[0].startsWith('max')
        || keys[0].startsWith('buff')
        || keys[0].startsWith('statDisplay')
        || keys[0].startsWith('statSim')
        || keys[0].startsWith('teammate')
        || keys[0].startsWith('combatBuffs')
        || keys[0] == 'characterConditionals'
        || keys[0] == 'lightConeConditionals'
      )
    ) {
      return
    }

    const request = allValues
    // console.log('@onValuesChange', request, changedValues)

    if (keys[0] === 'characterId') {
      window.store.getState().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, changedValues.characterId)
      SaveState.delayedSave()
    }

    // Add any new characters to the list only if the user changed any value other than the characterId
    if (!DB.getCharacterById(allValues.characterId) && keys[0] != 'characterId') {
      DB.addFromForm(allValues)
    }

    // If the rank changes, re-order the characters priority list
    if (changedValues.rank != null && DB.getCharacterById(allValues.characterId)!.rank != allValues.rank) {
      DB.insertCharacter(allValues.characterId, allValues.rank)
      DB.refreshCharacters()
    }

    // Update permutation counts
    const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request)

    const permutationDetails = {
      Head: relics.Head.length,
      Hands: relics.Hands.length,
      Body: relics.Body.length,
      Feet: relics.Feet.length,
      PlanarSphere: relics.PlanarSphere.length,
      LinkRope: relics.LinkRope.length,
      HeadTotal: preFilteredRelicsByPart.Head.length,
      HandsTotal: preFilteredRelicsByPart.Hands.length,
      BodyTotal: preFilteredRelicsByPart.Body.length,
      FeetTotal: preFilteredRelicsByPart.Feet.length,
      PlanarSphereTotal: preFilteredRelicsByPart.PlanarSphere.length,
      LinkRopeTotal: preFilteredRelicsByPart.LinkRope.length,
    }
    window.store.getState().setPermutationDetails(permutationDetails)
    window.store.getState()
      .setPermutations(relics.Head.length * relics.Hands.length * relics.Body.length * relics.Feet.length * relics.PlanarSphere.length * relics.LinkRope.length)
  }
  window.onOptimizerFormValuesChange = onValuesChange

  function startClicked() {
    console.log('Start clicked')

    // We don't actually want to submit the form as it would kick off a re-render
    // Intercept the event and just call the optimizer directly
    const form = OptimizerTabController.getForm()

    if (!OptimizerTabController.validateForm(form)) {
      return
    }

    window.store.getState().setPermutationsSearched(0)
    window.store.getState().setPermutationsResults(0)
    window.store.getState().setOptimizationInProgress(true)

    setTimeout(() => {
      // Delay the state update since this rerenders the characters tab
      DB.addFromForm(form)
    }, 2000)
    SaveState.delayedSave()

    const optimizationId = Utils.randomId()
    window.store.getState().setOptimizationId(optimizationId)
    form.optimizationId = optimizationId
    form.statDisplay = window.store.getState().statDisplay

    optimizerFormCache[optimizationId] = form

    console.log('Form finished', form)

    setTimeout(() => Optimizer.optimize(form), 50)
  }

  window.optimizerStartClicked = startClicked

  return (
    <div style={{ position: 'relative' }}>
      <AntDForm
        form={optimizerForm}
        layout='vertical'
        onValuesChange={onValuesChange}
      >
        <FormSetConditionals id={OpenCloseIDs.OPTIMIZER_SETS_DRAWER} />

        <FilterContainer>
          <FormRow id={OptimizerMenuIds.characterOptions}>
            <FormCard style={{ overflow: 'hidden', padding: 'none' }} size='narrow'>
              <OptimizerTabCharacterPanel />
            </FormCard>

            <FormCard>
              <CharacterSelectorDisplay />
            </FormCard>

            <FormCard>
              <CharacterConditionalDisplayWrapper />
            </FormCard>

            <FormCard justify='space-between'>
              <LightConeConditionalDisplayWrapper metadata={dbMetadata} />
            </FormCard>

            <FormCard>
              <OptimizerOptionsDisplay />
            </FormCard>
          </FormRow>

          <FormRow id={OptimizerMenuIds.relicAndStatFilters}>
            <FormCard>
              <RelicMainSetFilters />
            </FormCard>

            <FormCard>
              <SubstatWeightFilters />
            </FormCard>

            <FormCard>
              <MinMaxStatFilters />
            </FormCard>

            <FormCard>
              <MinMaxRatingFilters />
            </FormCard>

            <FormCard>
              <ComboFilters />
              <CombatBuffsDrawer />
              <EnemyConfigurationsDrawer />
            </FormCard>
          </FormRow>

          <TeammateFormRow id={OptimizerMenuIds.teammates}>
            <TeammateCard index={0} dbMetadata={dbMetadata} />
            <TeammateCard index={1} dbMetadata={dbMetadata} />
            <TeammateCard index={2} dbMetadata={dbMetadata} />
          </TeammateFormRow>

          <FormRow id={OptimizerMenuIds.characterStatsSimulation}>
            <StatSimulationDisplay />
          </FormRow>
        </FilterContainer>
      </AntDForm>
    </div>
  )
}

// Wrap these and use local state to limit rerenders
function CharacterConditionalDisplayWrapper() {
  const charId = AntDForm.useWatch(['characterId'], window.optimizerForm)
  const eidolon = AntDForm.useWatch(['characterEidolon'], window.optimizerForm)

  return (
    <CharacterConditionalsDisplay
      id={charId}
      eidolon={eidolon}
    />
  )
}

function LightConeConditionalDisplayWrapper(props: { metadata: DBMetadata }) {
  const { metadata } = props
  const lcId = AntDForm.useWatch(['lightCone'], window.optimizerForm)
  const superimposition = AntDForm.useWatch(['lightConeSuperimposition'], window.optimizerForm)
  const charId = AntDForm.useWatch(['characterId'], window.optimizerForm)

  // Hook into light cone changes to set defaults
  useEffect(() => {
    const conditionalResolverMetadata = generateConditionalResolverMetadata({
      characterId: charId,
      characterEidolon: 0, // Assuming eidolon is not needed for light cone metadata
      lightCone: lcId,
      lightConeSuperimposition: superimposition,
    }, metadata)
    const controller = LightConeConditionalsResolver.get(conditionalResolverMetadata)
    const defaults = controller.defaults()
    const lightConeForm = DB.getCharacterById(charId)?.form.lightConeConditionals || {}
    Utils.mergeDefinedValues(defaults, lightConeForm)

    // console.log('Loaded light cone conditional values', defaults)

    window.optimizerForm.setFieldValue('lightConeConditionals', defaults)
  }, [lcId, superimposition, charId])

  return (
    <Flex vertical justify='space-between' style={{ height: '100%', marginBottom: 8 }}>
      <LightConeConditionalDisplay
        id={lcId}
        superImposition={superimposition}
        dbMetadata={metadata}
      />
      <AdvancedOptionsPanel />
    </Flex>
  )
}
