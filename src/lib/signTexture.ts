import * as THREE from 'three'

/** Draws a store sign onto a canvas so no web font or network request is needed. */
export function makeSignTexture(title: string, subtitle: string, bg: string, fg = '#ffffff') {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = fg
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = 'bold 110px "Segoe UI", Helvetica, Arial, sans-serif'
  ctx.fillText(title, 512, 110)
  ctx.globalAlpha = 0.85
  ctx.font = '500 44px "Segoe UI", Helvetica, Arial, sans-serif'
  ctx.fillText(subtitle.toUpperCase(), 512, 205)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** A simple checker tile texture for the mall floor. */
export function makeFloorTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#e8e4de'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = '#d9d3ca'
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillRect(128, 128, 128, 128)
  ctx.strokeStyle = '#c9c2b8'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  return tex
}
