import { SettingOutlined } from '@ant-design/icons'
import {
  Button,
  Cascader,
  ConfigProvider,
  Flex,
  Form,
  Select,
} from 'antd'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { OrnamentSetTagRenderer } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentSetTagRenderer'
import GenerateOrnamentsOptions from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { RelicSetTagRenderer } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicSetTagRenderer'
import GenerateSetsOptions from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { SHOW_CHILD } = Cascader

export default function RelicMainSetFilters() {
  const { t } = useTranslation(['optimizerTab', 'common'])

  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('MainStats') /* Main stats */}</HeaderText>
        <TooltipImage type={Hint.mainStats()} />
      </Flex>
      <Flex vertical gap={7}>
        <Form.Item name='mainBody'>
          <Select
            mode='multiple'
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder={t('common:Parts.Body')}
            optionLabelProp='label'
            maxTagCount='responsive'
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.Body)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label={t('common:ShortStats.HP%')}>{t('common:Stats.HP%')}</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label={t('common:ShortStats.ATK%')}>{t('common:Stats.ATK%')}</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label={t('common:ShortStats.DEF%')}>{t('common:Stats.DEF%')}</Select.Option>
            <Select.Option value={Constants.Stats.CR} label={t('common:ShortStats.CRIT Rate')}>{t('common:Stats.CRIT Rate')}</Select.Option>
            <Select.Option value={Constants.Stats.CD} label={t('common:ShortStats.CRIT DMG')}>{t('common:Stats.CRIT DMG')}</Select.Option>
            <Select.Option value={Constants.Stats.EHR} label={t('common:ShortStats.Effect Hit Rate')}>{t('common:Stats.Effect Hit Rate')}</Select.Option>
            <Select.Option value={Constants.Stats.OHB} label={t('common:ShortStats.Outgoing Healing Boost')}>
              {t('common:Stats.Outgoing Healing Boost')}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name='mainFeet'>
          <Select
            mode='multiple'
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder={t('common:Parts.Feet')}
            optionLabelProp='label'
            maxTagCount='responsive'
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.Feet)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label={t('common:ShortStats.HP%')}>{t('common:Stats.HP%')}</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label={t('common:ShortStats.ATK%')}>{t('common:Stats.ATK%')}</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label={t('common:ShortStats.DEF%')}>{t('common:Stats.DEF%')}</Select.Option>
            <Select.Option value={Constants.Stats.SPD} label={t('common:ShortStats.SPD')}>{t('common:Stats.SPD')}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name='mainPlanarSphere'>
          <Select
            mode='multiple'
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder={t('common:Parts.PlanarSphere')}
            optionLabelProp='label'
            listHeight={400}
            maxTagCount='responsive'
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.PlanarSphere)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label={t('common:ShortStats.HP%')}>{t('common:Stats.HP%')}</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label={t('common:ShortStats.ATK%')}>{t('common:Stats.ATK%')}</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label={t('common:ShortStats.DEF%')}>{t('common:Stats.DEF%')}</Select.Option>
            <Select.Option value={Constants.Stats.Physical_DMG} label={t('common:ShortStats.Physical DMG Boost')}>
              {t('common:Stats.Physical DMG Boost')}
            </Select.Option>
            <Select.Option value={Constants.Stats.Fire_DMG} label={t('common:ShortStats.Fire DMG Boost')}>{t('common:Stats.Fire DMG Boost')}</Select.Option>
            <Select.Option value={Constants.Stats.Ice_DMG} label={t('common:ShortStats.Ice DMG Boost')}>{t('common:Stats.Ice DMG Boost')}</Select.Option>
            <Select.Option value={Constants.Stats.Lightning_DMG} label={t('common:ShortStats.Lightning DMG Boost')}>
              {t('common:Stats.Lightning DMG Boost')}
            </Select.Option>
            <Select.Option value={Constants.Stats.Wind_DMG} label={t('common:ShortStats.Wind DMG Boost')}>{t('common:Stats.Wind DMG Boost')}</Select.Option>
            <Select.Option value={Constants.Stats.Quantum_DMG} label={t('common:ShortStats.Quantum DMG Boost')}>
              {t('common:Stats.Quantum DMG Boost')}
            </Select.Option>
            <Select.Option value={Constants.Stats.Imaginary_DMG} label={t('common:ShortStats.Imaginary DMG Boost')}>
              {t('common:Stats.Imaginary DMG Boost')}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name='mainLinkRope'>
          <Select
            mode='multiple'
            allowClear
            style={{
              width: panelWidth,
            }}
            placeholder={t('common:Parts.LinkRope')}
            optionLabelProp='label'
            maxTagCount='responsive'
            suffixIcon={<img style={{ width: 16 }} src={Assets.getPart(Parts.LinkRope)} />}
          >
            <Select.Option value={Constants.Stats.HP_P} label={t('common:ShortStats.HP%')}>{t('common:Stats.HP%')}</Select.Option>
            <Select.Option value={Constants.Stats.ATK_P} label={t('common:ShortStats.ATK%')}>{t('common:Stats.ATK%')}</Select.Option>
            <Select.Option value={Constants.Stats.DEF_P} label={t('common:ShortStats.DEF%')}>{t('common:Stats.DEF%')}</Select.Option>
            <Select.Option value={Constants.Stats.BE} label={t('common:ShortStats.Break Effect')}>{t('common:Stats.Break Effect')}</Select.Option>
            <Select.Option value={Constants.Stats.ERR} label={t('common:ShortStats.Energy Regeneration Rate')}>
              {t('common:Stats.Energy Regeneration Rate')}
            </Select.Option>
          </Select>
        </Form.Item>
      </Flex>

      <Flex justify='space-between' align='center' style={{ marginTop: 30 }}>
        <HeaderText>{t('Sets') /* Sets */}</HeaderText>
        <TooltipImage type={Hint.sets()} />
      </Flex>

      <Flex vertical gap={7}>
        <ConfigProvider
          theme={{
            components: {
              Cascader: {
                dropdownHeight: 700,
                controlItemWidth: 150,
                controlWidth: 150,
                optionPadding: '0px 12px',
              },
            },
          }}
        >
          <Form.Item name='relicSets'>
            <Cascader
              popupClassName='relic-sets-cascader'
              placeholder={t('RelicSetSelector.Placeholder')}
              options={useMemo(() => GenerateSetsOptions(), [t])}
              showCheckedStrategy={SHOW_CHILD}
              tagRender={RelicSetTagRenderer}
              placement='bottomLeft'
              maxTagCount='responsive'
              multiple={true}
              expandTrigger='hover'
            />
          </Form.Item>
        </ConfigProvider>

        <Form.Item name='ornamentSets'>
          <Select
            dropdownStyle={{
              width: 250,
            }}
            listHeight={800}
            mode='multiple'
            allowClear
            style={{
              width: panelWidth,
            }}
            options={useMemo(() => GenerateOrnamentsOptions(), [t])}
            tagRender={OrnamentSetTagRenderer}
            placeholder={t('OrnamentSetSelector.Placeholder')}
            maxTagCount='responsive'
          >
          </Select>
        </Form.Item>
        <Button
          onClick={() => setOpen(OpenCloseIDs.OPTIMIZER_SETS_DRAWER)}
          icon={<SettingOutlined />}
        >
          {t('SetConditionals.Title') /* Conditional set effects */}
        </Button>
      </Flex>
    </Flex>
  )
}
