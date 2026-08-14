import { LAYER_COPY, type IcebergLayer } from '../lib/icebergLayers'
import { getLayerClass } from '../lib/layerClass'
import { topicMatchesQuery } from '../lib/topicSearch'
import type { IcebergTopic } from '../types/iceberg'
import { LayerClassMark } from './LayerClassMark'
import { Reveal } from './Reveal'
import { TopicLabel } from './TopicLabel'

type IcebergLayerSectionProps = {
  layer: IcebergLayer
  topics: IcebergTopic[]
  query: string
}

export function IcebergLayerSection({ layer, topics, query }: IcebergLayerSectionProps) {
  const copy = LAYER_COPY[layer]
  const layerClass = getLayerClass(layer)
  const searching = query.trim().length > 0
  const visibleTopics = searching
    ? topics.filter((topic) => topicMatchesQuery(topic, query))
    : topics

  if (searching && visibleTopics.length === 0) return null

  return (
    <section
      className="iceberg-layer relative px-4 py-8 sm:px-8 sm:py-12"
      style={{ minHeight: copy.minHeight }}
      aria-labelledby={`layer-${layer}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${copy.atmosphere}`}
        aria-hidden
      />
      {layer > 4 && (
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.45)_100%)]"
          aria-hidden
        />
      )}

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col pt-4 sm:pt-6">
        <Reveal>
          <header className="mb-7 text-center sm:mb-10">
            <div className="flex items-center justify-center">
              <LayerClassMark layer={layer} size="md" showCode />
            </div>
            <h2
              id={`layer-${layer}`}
              className="mt-2 font-display text-2xl font-semibold text-white text-glow sm:text-3xl"
            >
              {copy.title}
            </h2>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-bright/70">
              {copy.hint} · {layerClass.label}
            </p>
          </header>
        </Reveal>

        {visibleTopics.length > 0 && (
          <div className="flex flex-1 flex-col justify-center gap-3 sm:gap-4">
            {visibleTopics.map((topic, index) => (
              <Reveal key={topic.id} delayMs={Math.min(index * 70, 420)}>
                <div className="flex w-full">
                  <TopicLabel topic={topic} />
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
