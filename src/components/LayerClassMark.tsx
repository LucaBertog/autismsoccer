import { getLayerClass } from '../lib/layerClass'
import type { IcebergLayer } from '../lib/icebergLayers'

type LayerClassMarkProps = {
  layer: IcebergLayer
  size?: 'sm' | 'md'
  showCode?: boolean
}

export function LayerClassMark({ layer, size = 'sm', showCode = false }: LayerClassMarkProps) {
  const item = getLayerClass(layer)
  const Icon = item.icon
  const iconSize = size === 'md' ? 18 : 14

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 ${item.tone}`}
      title={`${item.code} — ${item.label}`}
      aria-label={`Classe ${item.code}: ${item.label}`}
    >
      <Icon size={iconSize} className={item.glow} aria-hidden />
      {showCode && (
        <span className="font-mono text-[10px] font-semibold tracking-[0.14em]">{item.code}</span>
      )}
    </span>
  )
}
