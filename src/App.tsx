import { Canvas } from '@react-three/fiber'
import { Mall } from './scene/Mall'
import { Player } from './scene/Player'
import { Products } from './scene/Products'
import { Hud } from './ui/Hud'

export default function App() {
  return (
    <>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 70, near: 0.1, far: 120 }}>
        <Mall />
        <Products />
        <Player />
      </Canvas>
      <Hud />
    </>
  )
}
