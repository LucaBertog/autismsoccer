import { LAYER_COPY } from '../lib/icebergLayers'
import { getLayerClass } from '../lib/layerClass'
import type { IcebergTopic } from '../types/iceberg'
import { LayerClassMark } from './LayerClassMark'

type TopicInfoboxProps = {
  topic: IcebergTopic
  onEdit?: () => void
}

export function TopicInfobox({ topic, onEdit }: TopicInfoboxProps) {
  const copy = LAYER_COPY[topic.layer]
  const layerClass = getLayerClass(topic.layer)

  return (
    <aside className="glass-strong overflow-hidden rounded-3xl lg:sticky lg:top-24">
      {topic.main_image_url && (
        <img
          src={topic.main_image_url}
          alt={topic.title}
          className="aspect-[4/3] w-full object-cover"
        />
      )}
      <div className="space-y-3 px-5 py-5">
        <div>
          <h2 className="font-display text-lg font-semibold leading-snug text-white">
            {topic.title}
          </h2>
          {topic.subtitle && (
            <p className="mt-1 text-sm leading-relaxed text-fog">{topic.subtitle}</p>
          )}
        </div>
        <dl className="space-y-3 border-t border-white/10 pt-3 text-sm">
          <div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-fog">Classe</dt>
              <dd>
                <LayerClassMark layer={topic.layer} size="md" showCode />
              </dd>
            </div>
            <p className="mt-1 text-xs text-fog/90">{layerClass.label}</p>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-fog">Camada do Iceberg</dt>
            <dd className="font-medium text-sky-bright">
              {topic.layer}
              <span className="ml-1.5 text-xs font-normal text-fog">· {copy.hint}</span>
            </dd>
          </div>
        </dl>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="focus-ring mt-1 w-full rounded-xl border border-sky-bright/30 bg-sky/10 px-3 py-2 text-sm text-sky-100 hover:bg-sky/20"
          >
            Editar tópico
          </button>
        )}
      </div>
    </aside>
  )
}
