import { useRef } from 'react'
import { ICEBERG_LAYERS } from '../lib/icebergLayers'
import { useParallax } from '../hooks/useParallax'
import type { IcebergTopic } from '../types/iceberg'
import { IcebergLayerSection } from './IcebergLayer'

const ICEBERG_SRC = '/iceberg-parallax.avif'

type IcebergParallaxProps = {
  topics: IcebergTopic[]
  query: string
}

export function IcebergParallax({ topics, query }: IcebergParallaxProps) {
  const bgRef = useRef<HTMLDivElement>(null)
  useParallax(bgRef)

  const byLayer = ICEBERG_LAYERS.map((layer) =>
    topics.filter((topic) => topic.layer === layer),
  )

  return (
    <div className="iceberg-parallax-scene relative anim-fade-in">
      <div className="iceberg-parallax-bg" aria-hidden>
        <div ref={bgRef} className="iceberg-parallax-shift">
          <div className="iceberg-parallax-figure">
            <img src={ICEBERG_SRC} alt="" className="iceberg-parallax-image" />
            <div className="iceberg-parallax-fade" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10">
        {ICEBERG_LAYERS.map((layer, index) => (
          <IcebergLayerSection
            key={layer}
            layer={layer}
            topics={byLayer[index]}
            query={query}
          />
        ))}
      </div>
    </div>
  )
}
