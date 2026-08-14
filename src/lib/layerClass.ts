import type { LucideIcon } from 'lucide-react'
import {
  EyeOff,
  Infinity as InfinityIcon,
  Moon,
  ScanSearch,
  Skull,
  Sun,
  TriangleAlert,
  Waves,
} from 'lucide-react'
import type { IcebergLayer } from './icebergLayers'

export type LayerClass = {
  code: string
  label: string
  icon: LucideIcon
  tone: string
  glow: string
}

export const LAYER_CLASS: Record<IcebergLayer, LayerClass> = {
  1: {
    code: 'SAFE',
    label: 'Conhecimento comum',
    icon: Sun,
    tone: 'text-emerald-300',
    glow: 'drop-shadow-[0_0_8px_rgba(110,231,183,0.55)]',
  },
  2: {
    code: 'NOTICE',
    label: 'Ainda na superfície',
    icon: Waves,
    tone: 'text-sky-300',
    glow: 'drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]',
  },
  3: {
    code: 'EUCLID',
    label: 'Luz falhando',
    icon: ScanSearch,
    tone: 'text-cyan-300',
    glow: 'drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]',
  },
  4: {
    code: 'KETER',
    label: 'A fronteira',
    icon: TriangleAlert,
    tone: 'text-amber-300',
    glow: 'drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]',
  },
  5: {
    code: 'OCCULT',
    label: 'Pouco falado',
    icon: Moon,
    tone: 'text-violet-300',
    glow: 'drop-shadow-[0_0_8px_rgba(196,181,253,0.5)]',
  },
  6: {
    code: 'SIGIL',
    label: 'Quase esquecido',
    icon: EyeOff,
    tone: 'text-fuchsia-300',
    glow: 'drop-shadow-[0_0_8px_rgba(240,171,252,0.45)]',
  },
  7: {
    code: 'DEADZONE',
    label: 'Território hostil',
    icon: Skull,
    tone: 'text-rose-300',
    glow: 'drop-shadow-[0_0_8px_rgba(253,164,175,0.5)]',
  },
  8: {
    code: 'APOLLYON',
    label: 'Não deveria existir',
    icon: InfinityIcon,
    tone: 'text-red-400',
    glow: 'drop-shadow-[0_0_10px_rgba(248,113,113,0.65)]',
  },
}

export function getLayerClass(layer: IcebergLayer): LayerClass {
  return LAYER_CLASS[layer]
}
