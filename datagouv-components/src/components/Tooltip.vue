<template>
  <component
    :is="as"
    class="relative"
    @focusin="open"
    @mouseenter="open"
    @focusout="show = false"
    @mouseleave="closeSoon"
    @keydown.esc="dismiss"
  >
    <span
      ref="reference"
      v-bind="$attrs"
      :tabindex="needsFocus ? 0 : undefined"
    >
      <slot />
    </span>

    <Teleport
      v-if="show"
      to="#tooltips"
    >
      <div
        :id
        ref="floating"
        role="tooltip"
        class="z-[900] pt-2"
        :class="tooltipClass"
        :style="floatingStyles"
        @mouseenter="open"
        @mouseleave="closeSoon"
      >
        <div class="w-max max-w-[min(22rem,calc(100vw-2rem))] p-3 rounded border border-gray-default bg-white shadow-overlay text-sm/[22px] text-gray-title [overflow-wrap:anywhere]">
          <slot name="tooltip" />
        </div>
      </div>
    </Teleport>
  </component>
</template>

<script setup lang="ts">
import { useFloating, autoUpdate, autoPlacement, shift } from '@floating-ui/vue'
import { useEventListener } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watchEffect } from 'vue'

withDefaults(defineProps<{
  tooltipClass?: string
  as?: string
}>(), {
  as: 'div',
})

const id = useId()
const show = ref(false)

const referenceRef = useTemplateRef<HTMLElement>('reference')
const floatingRef = useTemplateRef<HTMLElement>('floating')
const { floatingStyles } = useFloating(referenceRef, floatingRef, {
  strategy: 'fixed',
  middleware: [
    autoPlacement({
      allowedPlacements: ['bottom-start', 'bottom', 'bottom-end'],
      crossAxis: true,
    }),
    shift({ padding: 16 }),
  ],
  whileElementsMounted: autoUpdate,
})

// Inside a link or a button, the focus lands on that element, never on the tooltip itself:
// the tooltip follows its keyboard focus instead.
const focusableParent = ref<HTMLElement | null>(null)
// Around a plain icon or text, nothing could take the focus: the tooltip would stay out of
// reach of the keyboard, so its content becomes focusable itself.
const needsFocus = ref(false)
let focusedWithPointer = false

function onParentFocus(event: FocusEvent) {
  show.value = !focusedWithPointer && (event.currentTarget as HTMLElement).matches(':focus-visible')
}
function onParentPointerDown() {
  focusedWithPointer = true
  show.value = false
}
function onParentBlur() {
  focusedWithPointer = false
  show.value = false
}
function onParentKeydown(event: KeyboardEvent) {
  focusedWithPointer = false
  // Activating the parent opens what it controls, which the tooltip would cover.
  if (event.key === 'Enter' || event.key === ' ') show.value = false
  if (event.key === 'Escape') dismiss(event)
}

useEventListener(focusableParent, 'focus', onParentFocus)
useEventListener(focusableParent, 'pointerdown', onParentPointerDown)
useEventListener(focusableParent, 'blur', onParentBlur)
useEventListener(focusableParent, 'keydown', onParentKeydown)

onMounted(() => {
  const parent = referenceRef.value?.parentElement?.closest<HTMLElement>('a, button') ?? null
  focusableParent.value = parent
  needsFocus.value = !parent && !referenceRef.value?.querySelector('a, button, input, select, textarea, [tabindex]')
})

// The tooltip is teleported out of the reference: moving the pointer from one to the other
// leaves the reference first, so closing waits for the pointer to reach the tooltip, whose
// content (a link for instance) must stay usable.
let closeTimeout: ReturnType<typeof setTimeout> | undefined
function open() {
  clearTimeout(closeTimeout)
  show.value = true
}
function closeSoon() {
  clearTimeout(closeTimeout)
  closeTimeout = setTimeout(() => show.value = false, 100)
}
onBeforeUnmount(() => clearTimeout(closeTimeout))

// Describe the element that holds the focus, and only while the tooltip is rendered:
// a reference to a missing id is ignored by screen readers.
watchEffect((onCleanup) => {
  const described = focusableParent.value ?? referenceRef.value
  if (!described || !show.value) return
  const ids = new Set(described.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean))
  ids.add(id)
  described.setAttribute('aria-describedby', [...ids].join(' '))
  onCleanup(() => {
    const remaining = described.getAttribute('aria-describedby')?.split(/\s+/).filter(value => value !== id).join(' ')
    if (remaining) described.setAttribute('aria-describedby', remaining)
    else described.removeAttribute('aria-describedby')
  })
})

function dismiss(event: KeyboardEvent) {
  if (!show.value) return
  event.stopPropagation()
  show.value = false
}
</script>
