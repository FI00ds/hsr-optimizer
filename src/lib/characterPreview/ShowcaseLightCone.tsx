import {
  Flex,
  Typography,
} from 'antd'
import {
  showcaseBackdropFilter,
  showcaseOutline,
  showcaseShadow,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  ShowcaseDisplayDimensions,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import StatText, { StatTextEllipses } from 'lib/characterPreview/StatText'
import { parentW } from 'lib/constants/constantsUi'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'

const { Text } = Typography

export function ShowcaseLightConeSmall(props: {
  source: ShowcaseSource,
  character: Character,
  displayDimensions: ShowcaseDisplayDimensions,
  setOriginalCharacterModalInitialCharacter: (c: Character) => void,
  setOriginalCharacterModalOpen: (b: boolean) => void,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    source,
    character,
    displayDimensions,
    setOriginalCharacterModalInitialCharacter,
    setOriginalCharacterModalOpen,
    showcaseMetadata,
  } = props

  const {
    tempLcParentW,
    tempLcParentH,
    tempLcInnerW,
    tempLcInnerH,
    newLcHeight,
    lcCenter,
  } = displayDimensions

  const {
    lightConeSrc,
    lightConeName,
    lightConeLevel,
    lightConeSuperimposition,
  } = showcaseMetadata

  return (
    <Flex vertical>
      {lightConeName && (
        <Flex
          vertical
          style={{
            position: 'relative',
            height: 0,
            top: newLcHeight - 35,
            paddingRight: 5,
          }}
          align='flex-end'
        >
          <Text
            style={{
              position: 'absolute',
              height: 30,
              backgroundColor: 'rgb(0 0 0 / 70%)',
              padding: '3px 12px',
              borderRadius: 8,
              fontSize: 14,
              maxWidth: parentW - 50,
              width: 'fit-content',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              zIndex: 21,
              textShadow: '0px 0px 10px black',
              border: showcaseOutline,
              boxShadow: showcaseShadow,
              backdropFilter: showcaseBackdropFilter,
            }}
          >
            {`${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })} - ${lightConeName}`}
          </Text>
        </Flex>
      )}
      <Flex
        className='lightConeCard'
        style={{
          width: `${tempLcParentW}px`,
          height: `${tempLcParentH}px`,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 20,
          borderRadius: '8px',
          border: showcaseOutline,
          boxShadow: showcaseShadow,
        }}
        onClick={() => {
          if (source == ShowcaseSource.SHOWCASE_TAB) {
            setOriginalCharacterModalInitialCharacter(character)
            setOriginalCharacterModalOpen(true)
          } else {
            setOriginalCharacterModalInitialCharacter(character)
            setOriginalCharacterModalOpen(true)
          }
        }}
      >
        <LoadingBlurredImage
          src={lightConeSrc}
          style={{
            position: 'absolute',
            width: 420,
            top: -lcCenter + newLcHeight / 2,
            left: -8,
          }}
        />
      </Flex>
    </Flex>
  )
}

export function ShowcaseLightConeLarge(props: {
  source: ShowcaseSource,
  character: Character,
  displayDimensions: ShowcaseDisplayDimensions,
  setOriginalCharacterModalInitialCharacter: (c: Character) => void,
  setOriginalCharacterModalOpen: (b: boolean) => void,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    source,
    character,
    displayDimensions,
    setOriginalCharacterModalInitialCharacter,
    setOriginalCharacterModalOpen,
    showcaseMetadata,
  } = props

  const {
    tempLcParentW,
    tempLcParentH,
    tempLcInnerW,
    tempLcInnerH,
  } = displayDimensions

  const {
    lightConeSrc,
    lightConeName,
    lightConeLevel,
    lightConeSuperimposition,
  } = showcaseMetadata

  return (
    <div
      className='lightConeCard'
      style={{
        width: `${tempLcParentW}px`,
        height: `${tempLcParentH}px`,
        overflow: 'hidden',
        borderRadius: '8px',
        zIndex: 20,
        border: showcaseOutline,
        boxShadow: showcaseShadow,
      }}
      onClick={() => {
        if (source == ShowcaseSource.SHOWCASE_TAB) {
          setOriginalCharacterModalInitialCharacter(character)
          setOriginalCharacterModalOpen(true)
        } else {
          setOriginalCharacterModalInitialCharacter(character)
          setOriginalCharacterModalOpen(true)
        }
      }}
    >
      <LoadingBlurredImage
        src={lightConeSrc}
        style={{
          width: tempLcInnerW,
          // Magic # 8 to fit certain LCs
          transform: `translate(${(tempLcInnerW - tempLcParentW) / 2 / tempLcInnerW * -100}%, ${
            (tempLcInnerH - tempLcParentH) / 2 / tempLcInnerH * -100 + 8
          }%)`,
        }}
      />
    </div>
  )
}

export function ShowcaseLightConeLargeName(props: {
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const {
    showcaseMetadata,
  } = props

  const {
    lightConeSrc,
    lightConeName,
    lightConeLevel,
    lightConeSuperimposition,
  } = showcaseMetadata

  return (
    <Flex vertical>
      <StatTextEllipses
        style={{ fontSize: 18, fontWeight: 400, marginLeft: 10, marginRight: 10, textAlign: 'center' }}
      >
        {`${lightConeName}`}
      </StatTextEllipses>
      <StatText style={{ fontSize: 16, fontWeight: 400, marginBottom: 5, textAlign: 'center' }}>
        {
          `${t('common:LevelShort', { level: lightConeLevel })} ${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })}`
          /* Lv 80 S5 */
        }
      </StatText>
    </Flex>
  )
}
