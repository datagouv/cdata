<script setup lang="ts">
import '../../assets/cards.css'
import { ref, onMounted, onBeforeUnmount, watchEffect, useId, useTemplateRef } from 'vue'
import { useFloating, autoUpdate, autoPlacement, shift, offset } from '@floating-ui/vue'

defineOptions({ inheritAttrs: false })
const id = useId()
const show = ref(false)
const standalone = ref(false)
const keyboardTrigger = ref<HTMLElement | null>(null)
let pointerFocus = false
const reference = useTemplateRef<HTMLElement>('reference')
const floating = useTemplateRef<HTMLElement>('floating')
const { floatingStyles } = useFloating(reference, floating, {
  strategy: 'fixed',
  middleware: [offset(8), autoPlacement({ allowedPlacements: ['bottom-start', 'bottom', 'top-start', 'top'] }), shift({ padding: 16 })],
  whileElementsMounted: autoUpdate,
})
onMounted(() => {
  const parent = reference.value?.closest<HTMLElement>('a, button') ?? null
  standalone.value = !parent
  keyboardTrigger.value = parent ?? reference.value
  parent?.addEventListener('focus', onParentFocus)
  parent?.addEventListener('pointerdown', onParentPointerDown)
  parent?.addEventListener('blur', onParentBlur)
  parent?.addEventListener('keydown', onParentKeydown)
})
function onParentFocus(event: FocusEvent) {
  show.value = !pointerFocus && (event.currentTarget as HTMLElement).matches(':focus-visible')
}
function onParentPointerDown() {
  pointerFocus = true
  close()
}
function onParentBlur() {
  pointerFocus = false
  close()
}
function close() {
  show.value = false
}
function onParentKeydown(event: KeyboardEvent) {
  pointerFocus = false
  if (event.key === 'Escape') dismiss(event)
}
onBeforeUnmount(() => {
  const parent = keyboardTrigger.value
  parent?.removeEventListener('focus', onParentFocus)
  parent?.removeEventListener('pointerdown', onParentPointerDown)
  parent?.removeEventListener('blur', onParentBlur)
  parent?.removeEventListener('keydown', onParentKeydown)
})
watchEffect((onCleanup) => {
  const trigger = keyboardTrigger.value
  if (!trigger || !show.value) return
  const ids = new Set(trigger.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean))
  ids.add(id)
  trigger.setAttribute('aria-describedby', [...ids].join(' '))
  onCleanup(() => {
    const remaining = trigger.getAttribute('aria-describedby')?.split(/\s+/).filter(value => value !== id).join(' ')
    if (remaining) trigger.setAttribute('aria-describedby', remaining)
    else trigger.removeAttribute('aria-describedby')
  })
})
function dismiss(event: KeyboardEvent) {
  if (!show.value) return
  event.stopPropagation()
  show.value = false
}
</script>

<template>
  <span
    class="dg-card-tooltip"
    @mouseenter="show = true"
    @mouseleave="show = false"
    @focusin="show = true"
    @focusout="show = false"
    @keydown.esc="dismiss"
  >
    <span
      ref="reference"
      v-bind="$attrs"
      :tabindex="standalone ? 0 : undefined"
    ><slot /></span>
    <Teleport
      v-if="show"
      to="#tooltips"
    >
      <span
        :id="id"
        ref="floating"
        role="tooltip"
        class="dg-card-tooltip-panel"
        :style="floatingStyles"
      ><slot name="tooltip" /></span>
    </Teleport>
  </span>
</template>
