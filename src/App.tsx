import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { Mall } from './scene/Mall'
import { Player } from './scene/Player'
import { Hud } from './ui/Hud'

export default function App() {
  const [locked, setLocked] = useState(false)
  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 70, near: 0.1, far: 120 }}>
        <Mall />
        <Player onLockChange={setLocked} />
      </Canvas>
      <Hud locked={locked} />
    </>
  )
}
