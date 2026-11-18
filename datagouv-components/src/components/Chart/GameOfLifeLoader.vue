<template>
  <canvas
    ref="canvasRef"
    aria-hidden="true"
    class="block size-full text-new-primary"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const CELL_SIZE = 14
const GAP = 3
const DENSITY = 0.24
const MAX_OPACITY = 0.13
const FADE_MS = 900
const STEP_MS = 620

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrame: number | undefined
let resizeObserver: ResizeObserver | undefined
let animate = true
let cells = new Uint8Array()
let nextCells = new Uint8Array()
let opacities = new Float32Array()
let columns = 0
let rows = 0
let lastStep = 0
let previousTime = 0
let fillColor = ''

// Deterministic seed: the same pattern on every load, no flicker between renders.
function seeded(index: number): number {
  const value = Math.sin(index * 12.9898 + 20260716) * 43758.5453
  return value - Math.floor(value)
}

function pixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, 2)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = Math.max(1, Math.round(width * pixelRatio()))
  canvas.height = Math.max(1, Math.round(height * pixelRatio()))
  columns = Math.max(1, Math.ceil(width / CELL_SIZE))
  rows = Math.max(1, Math.ceil(height / CELL_SIZE))
  const length = columns * rows
  cells = Uint8Array.from({ length }, (_, index) => (seeded(index) < DENSITY ? 1 : 0))
  nextCells = new Uint8Array(length)
  opacities = new Float32Array(length)
  fillColor = getComputedStyle(canvas).color
  if (!animate) draw(0)
}

function step() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      let neighbours = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          neighbours += cells[((y + dy + rows) % rows) * columns + ((x + dx + columns) % columns)] ?? 0
        }
      }
      const index = y * columns + x
      nextCells[index] = neighbours === 3 || (cells[index] === 1 && neighbours === 2) ? 1 : 0
    }
  }
  [cells, nextCells] = [nextCells, cells]
}

function draw(time: number) {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return
  const ratio = pixelRatio()
  const delta = previousTime ? Math.min(time - previousTime, 64) : 0
  previousTime = time
  if (animate && time - lastStep >= STEP_MS) {
    step()
    lastStep = time
  }
  // The still frame shows the seed at full opacity instead of fading it in.
  const fade = animate ? Math.min(1, delta / FADE_MS) : 1

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = fillColor
  for (let index = 0; index < cells.length; index++) {
    const current = opacities[index] ?? 0
    const opacity = current + ((cells[index] ? MAX_OPACITY : 0) - current) * fade
    opacities[index] = opacity
    if (opacity < 0.002) continue
    const x = (index % columns) * CELL_SIZE + GAP / 2
    const y = Math.floor(index / columns) * CELL_SIZE + GAP / 2
    context.globalAlpha = opacity
    context.beginPath()
    context.roundRect(x * ratio, y * ratio, (CELL_SIZE - GAP) * ratio, (CELL_SIZE - GAP) * ratio, 2 * ratio)
    context.fill()
  }
  context.globalAlpha = 1
}

function tick(time: number) {
  animationFrame = requestAnimationFrame(tick)
  draw(time)
}

// Browser APIs are only touched once mounted: the server renders an empty canvas.
onMounted(() => {
  animate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  if (canvasRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvasRef.value)
  }
  if (animate) animationFrame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
})
</script>
