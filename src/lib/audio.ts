import { player } from './input'

/**
 * All sound is generated in the browser (no audio files): a soft chord pad for music,
 * filtered noise for the fountain, and short thuds for footsteps.
 * Browsers only allow audio after a click, so start() is called from "Enter the mall".
 */

const MUTE_KEY = 'mall-shop-muted'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let fountainGain: GainNode | null = null
let noise: AudioBuffer | null = null
let nextStep = 0

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

let muted = readMuted()
const listeners = new Set<() => void>()

export const audio = {
  get muted() {
    return muted
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => void listeners.delete(fn)
  },
  setMuted(m: boolean) {
    muted = m
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0')
    } catch {
      /* private mode: just don't remember */
    }
    if (ctx && master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.1)
    listeners.forEach((fn) => fn())
  },
  start,
  update,
}

function start() {
  if (ctx) return void ctx.resume()
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = muted ? 0 : 1
  master.connect(ctx.destination)

  // One second of white noise, reused for the fountain and footsteps.
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  startFountain()
  startMusic()
}

function startFountain() {
  if (!ctx || !master || !noise) return
  const src = ctx.createBufferSource()
  src.buffer = noise
  src.loop = true
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1400
  band.Q.value = 0.6
  fountainGain = ctx.createGain()
  fountainGain.gain.value = 0
  src.connect(band).connect(fountainGain).connect(master)
  src.start()
}

/** I–vi–IV–V in C, played as slow, quiet pads. Frequencies in Hz. */
const CHORDS = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [196.0, 246.94, 293.66, 392.0],
]

function startMusic() {
  if (!ctx || !master) return
  const music = ctx.createGain()
  music.gain.value = 0.035
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 1200
  music.connect(tone).connect(master)
  let i = 0
  const play = () => {
    if (!ctx || muted) return
    const t = ctx.currentTime
    for (const f of CHORDS[i % CHORDS.length]) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = f
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.25, t + 1.2)
      g.gain.linearRampToValueAtTime(0, t + 4.4)
      osc.connect(g).connect(music)
      osc.start(t)
      osc.stop(t + 4.5)
    }
    i++
  }
  play()
  setInterval(play, 4000)
}

function footstep(run: boolean) {
  if (!ctx || !master || !noise || muted) return
  const t = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = noise
  const low = ctx.createBiquadFilter()
  low.type = 'lowpass'
  low.frequency.value = 500
  const g = ctx.createGain()
  g.gain.setValueAtTime(run ? 0.22 : 0.16, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
  src.connect(low).connect(g).connect(master)
  src.start(t, Math.random() * 0.8, 0.1)
}

/** Called every frame: fountain gets louder as you approach it; footsteps follow your walking speed. */
function update(dt: number) {
  if (!ctx || ctx.state !== 'running') return
  if (fountainGain) {
    const d = Math.hypot(player.x, player.z)
    fountainGain.gain.setTargetAtTime(0.12 * Math.max(0, 1 - d / 16), ctx.currentTime, 0.2)
  }
  if (player.speed > 0.5) {
    nextStep -= dt
    if (nextStep <= 0) {
      const run = player.speed > 6
      footstep(run)
      nextStep = run ? 0.3 : 0.45
    }
  } else {
    nextStep = 0.1
  }
}

