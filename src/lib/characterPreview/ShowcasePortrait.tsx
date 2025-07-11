import { EditOutlined } from '@ant-design/icons'
import {
  Button,
  ConfigProvider,
  Flex,
  Typography,
} from 'antd'
import CharacterCustomPortrait from 'lib/characterPreview/CharacterCustomPortrait'
import {
  showcaseBackdropFilter,
  showcaseButtonStyle,
  showcaseOutline,
  showcaseOutlineLight,
  showcaseShadow,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { ShowcaseDisplayDimensions } from 'lib/characterPreview/characterPreviewController'
import {
  parentH,
  parentW,
} from 'lib/constants/constantsUi'
import EditImageModal from 'lib/overlays/modals/EditImageModal'
import { Assets } from 'lib/rendering/assets'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import {
  CustomImageConfig,
  CustomImagePayload,
} from 'types/customImage'

const { Text } = Typography

export function ShowcasePortrait(props: {
  source: ShowcaseSource,
  character: Character,
  displayDimensions: ShowcaseDisplayDimensions,
  customPortrait: CustomImageConfig | undefined,
  editPortraitModalOpen: boolean,
  setEditPortraitModalOpen: (b: boolean) => void,
  onEditPortraitOk: (p: CustomImagePayload) => void,
  artistName: string | undefined,
  setOriginalCharacterModalInitialCharacter: (c: Character) => void,
  setOriginalCharacterModalOpen: (b: boolean) => void,
  onPortraitLoad: (img: string) => void,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const globalThemeConfig = window.store((s) => s.globalThemeConfig)
  const showcaseUID = window.store((s) => s.savedSession.showcaseUID)
  const uid = useShowcaseTabStore((s) => s.savedSession.scorerId)

  const showUid = props.source == ShowcaseSource.SHOWCASE_TAB && showcaseUID

  const {
    source,
    character,
    displayDimensions,
    customPortrait,
    editPortraitModalOpen,
    setEditPortraitModalOpen,
    onEditPortraitOk,
    artistName,
    setOriginalCharacterModalInitialCharacter,
    setOriginalCharacterModalOpen,
    onPortraitLoad,
  } = props

  const {
    tempLcParentW,
    tempLcParentH,
    tempLcInnerW,
    tempLcInnerH,
    tempInnerW,
    tempParentH,
    newLcHeight,
    newLcMargin,
    lcCenter,
    charCenter,
  } = displayDimensions

  return (
    <div
      style={{
        width: `${parentW}px`,
        height: `${tempParentH}px`,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        border: showcaseOutline,
        boxShadow: showcaseShadow,
      }}
    >
      {(character.portrait ?? customPortrait)
        ? (
          <CharacterCustomPortrait
            customPortrait={customPortrait ?? character.portrait!}
            parentW={parentW}
            onPortraitLoad={onPortraitLoad}
          />
        )
        : (
          <LoadingBlurredImage
            src={Assets.getCharacterPortraitById(character.id)}
            style={{
              position: 'absolute',
              left: -charCenter.x * charCenter.z / 2 * tempInnerW / 1024 + parentW / 2,
              top: -charCenter.y * charCenter.z / 2 * tempInnerW / 1024 + tempParentH / 2,
              width: tempInnerW * charCenter.z,
            }}
            callback={onPortraitLoad}
          />
        )}

      <ConfigProvider theme={globalThemeConfig}>
        <Flex vertical style={{ width: 'max-content', marginLeft: 6, marginTop: 6 }} gap={7}>
          {source != ShowcaseSource.SHOWCASE_TAB && (
            <Button
              style={showcaseButtonStyle}
              className='character-build-portrait-button'
              icon={<EditOutlined />}
              onClick={() => {
                setOriginalCharacterModalInitialCharacter(character)
                setOriginalCharacterModalOpen(true)
              }}
              type='primary'
            >
              {t('CharacterPreview.EditCharacter') /* Edit character */}
            </Button>
          )}
          {source == ShowcaseSource.SHOWCASE_TAB && (
            <Button
              style={showcaseButtonStyle}
              className='character-build-portrait-button'
              icon={<EditOutlined />}
              onClick={() => {
                setOriginalCharacterModalInitialCharacter(character)
                setOriginalCharacterModalOpen(true)
              }}
              type='primary'
            >
              {t('CharacterPreview.EditCharacter') /* Edit character */}
            </Button>
          )}
          <Button
            style={showcaseButtonStyle}
            className='character-build-portrait-button'
            icon={<EditOutlined />}
            onClick={() => setEditPortraitModalOpen(true)}
            type='primary'
          >
            {t('CharacterPreview.EditPortrait') /* Edit portrait */}
          </Button>
        </Flex>
      </ConfigProvider>
      <ConfigProvider theme={globalThemeConfig}>
        <EditImageModal
          title={t('CharacterPreview.EditPortrait') /* Edit portrait */}
          aspectRatio={parentW / parentH}
          existingConfig={customPortrait ?? character.portrait}
          open={editPortraitModalOpen}
          setOpen={setEditPortraitModalOpen}
          onOk={onEditPortraitOk}
          defaultImageUrl={Assets.getCharacterPortraitById(character.id)}
          width={500}
        />
      </ConfigProvider>
      <Flex
        vertical
        gap={3}
        style={{
          marginBottom: 3,
          paddingLeft: 3,
          position: 'absolute',
          bottom: 0,
        }}
      >
        <span
          style={{
            display: showUid ? 'inline' : 'none',
            backgroundColor: 'rgb(20 20 20 / 30%)',
            color: 'rgb(255 255 255 / 80%)',
            padding: '4px 12px',
            borderRadius: 8,
            border: showcaseOutlineLight,
            backdropFilter: showcaseBackdropFilter,
            fontSize: 14,
            width: 'fit-content',
            maxWidth: parentW - 150,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            zIndex: 2,
            textShadow: '0px 0px 10px black',
          }}
        >
          {uid}
        </span>
        <span
          style={{
            display: artistName ? 'inline' : 'none',
            backgroundColor: 'rgb(20 20 20 / 30%)',
            color: 'rgb(255 255 255 / 80%)',
            padding: '4px 12px',
            borderRadius: 8,
            border: showcaseOutlineLight,
            backdropFilter: showcaseBackdropFilter,
            fontSize: 14,
            width: 'fit-content',
            maxWidth: parentW - 150,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            zIndex: 2,
            textShadow: '0px 0px 10px black',
          }}
        >
          {t('CharacterPreview.ArtBy', { artistName: artistName ?? '' }) /* Art by {{artistName}} */}
        </span>
      </Flex>
    </div>
  )
}
