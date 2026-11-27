<template>
  <Disclosure
    v-slot="{ open }"
    as="section"
    class="text-xs [--trace-duration:250ms] [--trace-ease:cubic-bezier(0.22,1,0.36,1)]"
    :class="look.section"
  >
    <DisclosureButton
      class="flex w-full items-center gap-2 text-left"
      :class="look.button"
    >
      <component
        :is="icon"
        :class="look.icon"
        aria-hidden="true"
      />
      <span class="min-w-0 flex-1">
        <slot name="header" />
      </span>
      <slot name="status" />
      <RiArrowDownSLine
        :class="[look.icon, MOTION, 'transition-transform', { '-scale-y-100': open }]"
        aria-hidden="true"
        data-testid="trace-chevron"
      />
    </DisclosureButton>
    <!-- static keeps the panel rendered for the grid-rows transition; inert keeps it out of the accessibility tree while collapsed -->
    <DisclosurePanel
      static
      class="grid transition-[grid-template-rows]"
      :class="[MOTION, open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]']"
      :inert="!open || undefined"
    >
      <div
        class="min-h-0 overflow-hidden transition-[opacity,filter]"
        :class="[MOTION, open ? 'opacity-100 blur-none' : 'opacity-0 blur-[2px]']"
      >
        <div :class="look.content">
          <slot />
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RiArrowDownSLine } from '@remixicon/vue'
import { computed, type Component } from 'vue'

const props = defineProps<{
  icon: Component
  card?: boolean
}>()

const MOTION = 'duration-(--trace-duration) ease-(--trace-ease) motion-reduce:transition-none'

const CARD = {
  section: 'overflow-hidden rounded-md border border-new-gray-light',
  button: 'px-2.5 py-2 hover:bg-gray-100',
  icon: 'size-3.5 shrink-0 text-new-gray-medium',
  content: 'border-t border-new-gray-light px-2.5 pb-2.5 pt-2',
}

// DSFR tints every hovered button: the header darkens its text instead.
const DISCLOSURE = {
  section: 'text-gray-medium',
  button: `py-1 font-medium transition-colors ${MOTION} hover:bg-transparent hover:text-new-gray-dark`,
  icon: 'size-4 shrink-0',
  content: 'pb-2 pl-6 pt-1',
}

const look = computed(() => (props.card ? CARD : DISCLOSURE))
</script>
