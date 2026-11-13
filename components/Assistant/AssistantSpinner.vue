<template>
  <span
    aria-hidden="true"
    class="inline-flex w-[4.5ch] shrink-0 justify-center font-mono leading-none tabular-nums"
  >{{ FRAMES[frameIndex] }}</span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// The "dna" braille spinner of unicode-animations (MIT), inlined to avoid the dependency.
const FRAMES = ['⠋⠉⠙⠚', '⠉⠙⠚⠒', '⠙⠚⠒⠂', '⠚⠒⠂⠂', '⠒⠂⠂⠒', '⠂⠂⠒⠲', '⠂⠒⠲⠴', '⠒⠲⠴⠤', '⠲⠴⠤⠄', '⠴⠤⠄⠋', '⠤⠄⠋⠉', '⠄⠋⠉⠙']
const INTERVAL_MS = 80
const STILL_FRAME = Math.floor(FRAMES.length / 2)

const frameIndex = ref(STILL_FRAME)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  frameIndex.value = 0
  timer = setInterval(() => {
    frameIndex.value = (frameIndex.value + 1) % FRAMES.length
  }, INTERVAL_MS)
})

onBeforeUnmount(() => clearInterval(timer))
</script>
