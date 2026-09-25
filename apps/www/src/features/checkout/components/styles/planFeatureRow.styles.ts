import type { FeatureType } from '../../types'

type Variant = 'new' | 'current'

export const ICON_CLS: Record<Variant, Record<FeatureType, string>> = {
  new: {
    check:     'text-white/70',
    upgrade:   'text-white/90',
    downgrade: 'text-white/60',
    removed:   'text-white/50',
    neutral:   'text-white/50',
  },
  current: {
    check:     'text-primary',
    upgrade:   'text-success',
    downgrade: 'text-amber-500',
    removed:   'text-error',
    neutral:   'text-fg-muted',
  },
}

export const TEXT_CLS: Record<Variant, string> = {
  new:     'text-white/85',
  current: 'text-fg-muted',
}

export const VALUE_CLS: Record<Variant, string> = {
  new:     'text-white font-medium',
  current: 'font-medium text-fg',
}
