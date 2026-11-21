import { KEEPERS } from '../data/keepers'
import { storeById } from '../data/stores'
import { useUI } from '../lib/state'

/** The shopkeeper's greeting and today's tip, shown when you walk into a store (timing lives in the UI store). */
export function SpeechBubble() {
  const greeting = useUI((s) => s.greeting)
  if (!greeting) return null
  const keeper = KEEPERS[greeting.storeId]
  const store = storeById.get(greeting.storeId)!
  return (
    <div className="speech" style={{ borderColor: store.color }} key={greeting.n} role="status">
      <div className="speech-name" style={{ background: store.color }}>
        {keeper.name} · {store.name}
      </div>
      <div>
        <strong>{keeper.greeting}</strong> {keeper.deal}
      </div>
    </div>
  )
}
