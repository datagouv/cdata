import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

type UseResizableOptions = {
  initialWidth: number
  minWidth: number
  maxWidth: number
}

// Drag-to-resize a horizontal panel. Returns the reactive width, a `resizing`
// flag (to disable width transitions while dragging) and a `startResize` handler
// to bind on a drag handle's `mousedown`. Encapsulates the drag math, clamping and
// the temporary body cursor / text-selection lock. VueUse has no ready-made panel
// resize (useResizeObserver only observes size), so we build it on `useEventListener`
// which handles listener cleanup and SSR for us.
export function useResizable({ initialWidth, minWidth, maxWidth }: UseResizableOptions) {
  const width = ref(initialWidth)
  const resizing = ref(false)
  let startX = 0
  let startWidth = 0

  const clamp = (value: number) => Math.min(maxWidth, Math.max(minWidth, Math.round(value)))

  function startResize(event: MouseEvent) {
    event.preventDefault()
    startX = event.clientX
    startWidth = width.value
    resizing.value = true
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  useEventListener('mousemove', (event: MouseEvent) => {
    if (!resizing.value) return
    width.value = clamp(startWidth + event.clientX - startX)
  })

  useEventListener('mouseup', () => {
    if (!resizing.value) return
    resizing.value = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  })

  return { width, resizing, startResize }
}
