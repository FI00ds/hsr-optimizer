import chroma from 'chroma-js'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import {
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'

// TODO: fix the default colours

const height = 280, width = 200, borderRadius = 6, transitionDuration = 250

interface RelicPreviewProps {
  relic?: Relic
  source?: ShowcaseSource
  characterId?: CharacterId
  score?: RelicScoringResult
  scoringType?: ScoringType
  setEditModalOpen?: (open: boolean) => void
  setAddModalOpen?: (open: boolean) => void
  setSelectedRelic: (relic: Relic) => void
  showcaseTheme?: ShowcaseTheme
  unhoverable?: boolean
}

export function CanvasRelicPreview(props: RelicPreviewProps) {
  const { relic, showcaseTheme, unhoverable } = props

  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null)
  const animationStage = useRef(0)
  const prevFrame = useRef(0)

  const [hovered, setHovered] = useState(false)

  const onMouseEnter = () => {
    if (animationStage.current === 0) {
      prevFrame.current = performance.now()
    }
    if (!unhoverable) setHovered(true)
  }
  const onMouseLeave = () => {
    if (animationStage.current === transitionDuration) {
      prevFrame.current = performance.now()
    }
    if (!unhoverable) setHovered(false)
  }

  const draw = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d')
    if (!context) return

    // we want to keep a pixel of margin to ensure the border doesn't get cropped
    canvas.width = width
    canvas.height = height

    context.beginPath()
    context.roundRect(0, 0, width, height, borderRadius)
    context.fillStyle = showcaseTheme!.cardBackgroundColor ?? '#000'
    context.fill()
    context.lineWidth = 0.5
    context.beginPath()
    context.roundRect(1, 1, width - 2, height - 2, borderRadius)
    context.strokeStyle = chroma.mix(showcaseTheme?.cardBorderColor!, '#FFF', Math.abs(animationStage.current / transitionDuration)).hex()
    context.stroke()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let animationFrame: number
    const render = () => {
      const deltaTime = performance.now() - prevFrame.current

      draw(canvas)

      if (hovered && animationStage.current < transitionDuration) {
        animationStage.current = Math.min(animationStage.current + deltaTime, transitionDuration)
        animationFrame = window.requestAnimationFrame(render)
      } else if (!hovered && animationStage.current > 0) {
        animationStage.current = Math.max(animationStage.current - deltaTime, 0)
        animationFrame = window.requestAnimationFrame(render)
      }

      prevFrame.current = performance.now()
    }
    render()
    return () => {
      window.cancelAnimationFrame(animationFrame)
    }
  }, [draw])

  return (
    <canvas
      style={{ height, width, zIndex: 20, borderRadius }}
      ref={canvasRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
    </canvas>
  )
}
