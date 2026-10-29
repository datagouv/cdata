<script setup lang="ts">
import '../../assets/cards.css'
import { ref, onMounted, useId, useTemplateRef } from 'vue'
import { useFloating, autoUpdate, autoPlacement, shift, offset } from '@floating-ui/vue'

defineOptions({ inheritAttrs: false })
const id = useId()
const show = ref(false)
const standalone = ref(false)
const reference = useTemplateRef<HTMLElement>('reference')
const floating = useTemplateRef<HTMLElement>('floating')
const { floatingStyles } = useFloating(reference, floating, {
  strategy: 'fixed',
  middleware: [offset(8), autoPlacement({ allowedPlacements: ['bottom-start', 'bottom', 'top-start', 'top'] }), shift({ padding: 16 })],
  whileElementsMounted: autoUpdate,
})
onMounted(() => {
  standalone.value = !reference.value?.closest('a, button')
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
      :aria-describedby="show ? id : undefined"
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
