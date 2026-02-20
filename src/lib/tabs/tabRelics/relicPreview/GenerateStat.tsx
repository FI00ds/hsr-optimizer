import { Flex } from 'antd'
import { RightIcon } from 'icons/RightIcon'
import {
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import { Renderer } from 'lib/rendering/renderer'
import { Utils } from 'lib/utils/utils'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Relic,
  StatRolls,
} from 'types/relic'

export type SubstatDetails = {
  stat: SubStats,
  value: number,
  rolls?: StatRolls,
  addedRolls?: number,
}

interface Colour {
  r: number
  g: number
  b: number
  a: number
}
const defaultColour: Colour = { r: 237, g: 221, b: 83, a: 0.4 }
const colour = (colour: Colour, alpha: number) => `rgba(${colour.r},${colour.g},${colour.b},${alpha * colour.a})`
function highlightGradient(baseColour: Colour = defaultColour) {
  return `linear-gradient(90deg,${colour(baseColour, 1)} 0%,${colour(baseColour, 0.125)} 15%,${colour(baseColour, 0.05)} 100%)`
}

interface GenerateStatOptions {
  isPreview?: boolean
  highLightStats?: Array<StatsValues>
}

export const GenerateStat = (stat: SubstatDetails, main: boolean, relic: Relic, options: GenerateStatOptions = {}) => {
  const { isPreview, highLightStats } = options
  const { t } = useTranslation('common')
  if (!stat?.stat || stat.value == null) {
    return (
      <img
        src={Assets.getBlank()}
        style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}
      />
    )
  }

  let displayValue
  if (main) {
    displayValue = Renderer.renderMainStatNumber(stat)
  } else {
    displayValue = Renderer.renderSubstatNumber(stat, relic)
  }
  displayValue += Utils.isFlat(stat.stat) ? '' : '%'

  return (
    <Flex
      justify='space-between'
      align='center'
      style={{
        opacity: isPreview ? 0.4 : 1,
        background: highLightStats?.includes(stat.stat)
          ? highlightGradient()
          : undefined,
        borderRadius: 3,
      }}
    >
      <Flex>
        <img
          src={Assets.getStatIcon(stat.stat)}
          style={{ width: iconSize, height: iconSize, marginRight: 2, marginLeft: -3 }}
        />
        {t(`ReadableStats.${stat.stat}`)}
      </Flex>
      {!main
        ? (
          <Flex justify='space-between' style={{ width: '41.5%' }}>
            <Flex gap={0} align='center'>
              {generateRolls(stat)}
            </Flex>
            {displayValue}
          </Flex>
        )
        : <>{displayValue}</>}
    </Flex>
  )
}

function generateRolls(stat: SubstatDetails) {
  if (!stat.addedRolls) {
    return <div></div>
  }
  const result: ReactElement[] = []
  for (let i = 0; i < stat.addedRolls; i++) {
    result.push(<RightIcon key={i} style={{ marginRight: -5, opacity: 0.75 }} />)
  }
  return result
}
