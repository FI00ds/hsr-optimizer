import {
  Flex,
  Typography,
} from 'antd'
import ScoringModal from 'lib/overlays/modals/ScoringModal'
import {
  AppPage,
  AppPages,
  PageToRoute,
} from 'lib/state/db'
import BenchmarksTab from 'lib/tabs/tabBenchmarks/BenchmarksTab'
import ChangelogTab from 'lib/tabs/tabChangelog/ChangelogTab'
import CharacterTab from 'lib/tabs/tabCharacters/CharacterTab'
import HomeTab from 'lib/tabs/tabHome/HomeTab'
import ImportTab from 'lib/tabs/tabImport/ImportTab'
import MetadataTab from 'lib/tabs/tabMetadata/MetadataTab'
import OptimizerTab from 'lib/tabs/tabOptimizer/OptimizerTab'
import RelicsTab from 'lib/tabs/tabRelics/RelicsTab'
import ShowcaseTab from 'lib/tabs/tabShowcase/ShowcaseTab'
import WarpCalculatorTab from 'lib/tabs/tabWarp/WarpCalculatorTab'
import WebgpuTab from 'lib/tabs/tabWebgpu/WebgpuTab'
import { WorkerPool } from 'lib/worker/workerPool'
import React, {
  ReactElement,
  useEffect,
} from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const defaultErrorRender = ({ error: { message } }: {
  error: {
    message: string,
  },
}) => <Typography>Something went wrong: {message}</Typography>

let optimizerInitialized = false

const Tabs = () => {
  const activeKey = window.store((s) => s.activeKey).split('?')[0] as AppPage

  const homeTab = React.useMemo(() => <HomeTab />, [])
  const optimizerTab = React.useMemo(() => <OptimizerTab />, [])
  const characterTab = React.useMemo(() => <CharacterTab />, [])
  const relicsTab = React.useMemo(() => <RelicsTab />, [])
  const importTab = React.useMemo(() => <ImportTab />, [])
  const showcaseTab = React.useMemo(() => <ShowcaseTab />, [])
  const warpCalculatorTab = React.useMemo(() => <WarpCalculatorTab />, [])
  const changelogTab = React.useMemo(() => <ChangelogTab />, [])
  const webgpuTab = React.useMemo(() => <WebgpuTab />, [])
  const metadataTab = React.useMemo(() => <MetadataTab />, [])
  const benchmarksTab = React.useMemo(() => <BenchmarksTab />, [])

  useEffect(() => {
    let route = PageToRoute[activeKey]
    if (activeKey == AppPages.SHOWCASE) {
      const id = window.location.hash.split('?')[1]?.split('id=')[1]?.split('&')[0]
      if (id) {
        route += `?id=${id}`
      }
    }
    console.log('Navigating activekey to route', activeKey, route)
    window.history.pushState({}, window.title, route)

    if (activeKey == AppPages.OPTIMIZER) {
      // Only kick off the workers on the first load of OptimizerTab. Skips this for scorer-only users.
      if (!optimizerInitialized) {
        optimizerInitialized = true
        WorkerPool.initializeAllWorkers()
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [activeKey])

  return (
    <Flex justify='space-around' style={{ width: '100%' }}>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.HOME} content={homeTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.OPTIMIZER} content={optimizerTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHARACTERS} content={characterTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.RELICS} content={relicsTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.IMPORT} content={importTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.SHOWCASE} content={showcaseTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.WARP} content={warpCalculatorTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.BENCHMARKS} content={benchmarksTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHANGELOG} content={changelogTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.WEBGPU_TEST} content={webgpuTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.METADATA_TEST} content={metadataTab} />

      <ErrorBoundary fallbackRender={defaultErrorRender}>
        <ScoringModal />
      </ErrorBoundary>
    </Flex>
  )
}

export default Tabs

function TabRenderer(props: {
  activeKey: AppPage,
  tabKey: AppPage,
  content: ReactElement,
}) {
  return (
    <ErrorBoundary fallbackRender={defaultErrorRender}>
      <div style={{ display: props.activeKey === props.tabKey ? 'contents' : 'none' }} id={props.tabKey}>
        {props.content}
      </div>
    </ErrorBoundary>
  )
}
