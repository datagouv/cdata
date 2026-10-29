<script setup lang="ts">
import '../../assets/cards.css'
import { computed, nextTick, useTemplateRef } from 'vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { autoPlacement, autoUpdate, offset, shift, useFloating } from '@floating-ui/vue'
import ClientOnly from './ClientOnly.vue'
import ValueWatcher from './ValueWatcher.vue'
// Local quality composition: the public Toggletip component remains unchanged.
const props = defineProps<{
  buttonProps?: Record<string, unknown>
  buttonClass?: string
}>()
const emit = defineEmits<{ opened: [] }>()
const accessibleButtonProps = computed(() => {
  const { title, ...rest } = props.buttonProps || {}
  return { ...rest, ...(title && !rest['aria-label'] ? { 'aria-label': title } : {}) }
})
const reference = useTemplateRef<InstanceType<typeof Popover>>('reference')
const panel = useTemplateRef<InstanceType<typeof PopoverPanel>>('panel')
const { floatingStyles, update } = useFloating(reference, panel, {
  middleware: [
    offset(8),
    autoPlacement({ alignment: 'end', crossAxis: true, padding: 16 }),
    shift({ padding: 16 }),
  ],
  whileElementsMounted: autoUpdate,
})
async function refresh(open: unknown) {
  if (open) emit('opened')
  await nextTick()
  update()
}
</script>

<template>
  <Popover
    ref="reference"
    v-slot="{ open, close }"
    class="dg-quality-popover"
  >
    <ValueWatcher
      :value="open"
      @changed="refresh"
    />
    <PopoverButton
      v-bind="accessibleButtonProps"
      :class="buttonClass"
      data-link-kind="details"
    >
      <slot />
    </PopoverButton>
    <ClientOnly>
      <Teleport to="#tooltips">
        <PopoverPanel
          v-show="open"
          ref="panel"
          class="dg-quality-panel"
          :style="floatingStyles"
          static
        >
          <slot
            name="toggletip"
            :close="close"
          />
        </PopoverPanel>
      </Teleport>
    </ClientOnly>
  </Popover>
</template>
