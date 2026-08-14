export const ICEBERG_LAYERS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export type IcebergLayer = (typeof ICEBERG_LAYERS)[number]

export const LAYER_COPY: Record<
  IcebergLayer,
  { title: string; hint: string; atmosphere: string; minHeight: string }
> = {
  1: {
    title: 'Camada 1',
    hint: 'Superfície',
    atmosphere: 'from-ink/35 via-ink/20 to-ink/40',
    minHeight: 'min(74vh, 42rem)',
  },
  2: {
    title: 'Camada 2',
    hint: 'Rasa',
    atmosphere: 'from-ink/30 via-ink/22 to-ink/42',
    minHeight: 'min(70vh, 40rem)',
  },
  3: {
    title: 'Camada 3',
    hint: 'Meia-água',
    atmosphere: 'from-ink/35 via-ink/32 to-ink/50',
    minHeight: 'min(76vh, 42rem)',
  },
  4: {
    title: 'Camada 4',
    hint: 'Termoclina',
    atmosphere: 'from-ink/20 via-ink/40 to-ink/52',
    minHeight: 'min(82vh, 46rem)',
  },
  5: {
    title: 'Camada 5',
    hint: 'Profunda',
    atmosphere: 'from-ink/45 via-ink/62 to-ink/74',
    minHeight: 'min(88vh, 50rem)',
  },
  6: {
    title: 'Camada 6',
    hint: 'Obscura',
    atmosphere: 'from-ink/58 via-ink/74 to-ink/84',
    minHeight: 'min(84vh, 48rem)',
  },
  7: {
    title: 'Camada 7',
    hint: 'Abissal',
    atmosphere: 'from-ink/72 via-ink/84 to-ink/92',
    minHeight: 'min(80vh, 46rem)',
  },
  8: {
    title: 'Camada 8',
    hint: 'Abismo',
    atmosphere: 'from-ink/70 via-ink/80 to-transparent',
    minHeight: 'min(78vh, 44rem)',
  },
}

export function toLayer(value: unknown): IcebergLayer {
  const n = Number(value)
  if (Number.isInteger(n) && n >= 1 && n <= 8) return n as IcebergLayer
  return 1
}

export function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}
