import { Link } from 'react-router-dom'
import { hashString } from '../lib/icebergLayers'
import { getLayerClass } from '../lib/layerClass'
import { saveIcebergReturn, topicAnchorId } from '../lib/icebergReturn'
import type { IcebergTopic } from '../types/iceberg'
import { LayerClassMark } from './LayerClassMark'

type TopicLabelProps = {
  topic: IcebergTopic
  dimmed?: boolean
}

const OFFSETS = [
  'ml-[2%] sm:ml-[6%]',
  'mr-[4%] sm:mr-[10%] ml-auto',
  'mx-auto',
  'ml-[12%] sm:ml-[22%]',
  'mr-[8%] sm:mr-[18%] ml-auto',
  'ml-[7%] sm:ml-[14%]',
]

export function TopicLabel({ topic, dimmed = false }: TopicLabelProps) {
  const offset = OFFSETS[hashString(topic.id) % OFFSETS.length]
  const lift = (hashString(topic.id + topic.title) % 3) * 6
  const layerClass = getLayerClass(topic.layer)

  return (
    <Link
      id={topicAnchorId(topic.id)}
      to={`/topico/${topic.id}`}
      aria-label={`Abrir tópico ${topic.title}, classe ${layerClass.code}`}
      style={{ marginTop: lift }}
      onClick={() => saveIcebergReturn(topic.id)}
      className={[
        'topic-label focus-ring inline-flex max-w-[min(100%,22rem)] items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium tracking-wide',
        'backdrop-blur-md transition duration-200',
        offset,
        dimmed
          ? 'pointer-events-none scale-95 border-white/5 bg-ink/20 text-fog/40 opacity-20'
          : 'border-sky-bright/25 bg-ink/55 text-slate-100 shadow-[0_8px_24px_rgba(2,6,23,0.35)] hover:-translate-y-0.5 hover:border-sky-bright/55 hover:bg-sky/20 hover:text-white hover:shadow-[0_0_22px_rgba(56,189,248,0.28)]',
      ].join(' ')}
    >
      <LayerClassMark layer={topic.layer} />
      <span className="truncate">{topic.title}</span>
    </Link>
  )
}
