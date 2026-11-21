import type { ModelKind } from '../data/products'

const ICON: Record<ModelKind, string> = {
  tshirt: '👕', jeans: '👖', dress: '👗', shoe: '👟',
  phone: '📱', tablet: '📱', laptop: '💻', headphones: '🎧', watch: '⌚', speaker: '🔊',
  lamp: '💡', mug: '☕', cushion: '🛋️', vase: '🏺', candle: '🕯️', clock: '🕰️',
  book: '📕',
  ball: '⚽', dumbbell: '🏋️', bottle: '🧴', racket: '🏸',
  perfume: '🌸', lipstick: '💄', jar: '🫙',
  teddy: '🧸', car: '🚗', blocks: '🧱',
  apple: '🍎', carton: '🥛', bread: '🍞',
}

/** Small tile for cart lines: the product's colour with an icon. A real photo can replace this later. */
export function ProductThumb({ kind, colour }: { kind: ModelKind; colour: string }) {
  return (
    <div className="thumb" style={{ background: colour }}>
      <span>{ICON[kind]}</span>
    </div>
  )
}
