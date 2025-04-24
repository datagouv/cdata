<template>
  <Disclosure
    as="div"
    class="fr-accordion"
    data-type="accordion"
  >
    <component
      :is="heading"
      :id="titleAccordionId"
      class="fr-accordion__title !mb-0"
    >
      <DisclosureButton
        class="fr-accordion__btn !text-neutral-900"
        :aria-expanded="isOpen(titleAccordionId)"
        :aria-controls="accordionId"
        @click="toggle(titleAccordionId)"
      >
        <component
          :is="icon"
          v-if="withIcon"
          class="fr-mr-2w shrink-0"
          :class="iconColor"
          size="24px"
        />
        {{ title }}
      </DisclosureButton>
    </component>
    <DisclosurePanel
      v-show="isOpen(titleAccordionId)"
      :id="accordionId"
      class="px-4 pt-4 pb-6"
      static
    >
      <slot />
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiCheckLine, RiCloseLine, RiErrorWarningLine, RiInformationLine, RiSubtractLine } from '@remixicon/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import type { AccordionState } from '~/types/form'
import { key, type AccordionRegister } from '~/components/Accordion/injectionKey'

const props = withDefaults(defineProps<{
  id?: string | undefined
  title: string
  state?: AccordionState
  heading?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}>(), {
  state: 'default',
  heading: 'h3',
})

const { isOpen, open, toggle, unregister, withIcon } = inject(key) as AccordionRegister

const accordionId = props.id || useId()
const titleAccordionId = props.title.toLocaleLowerCase().replace(/\s/g, '-')
const route = useRoute()
const icon = computed(() => {
  switch (props.state) {
    case 'error':
      return RiCloseLine
    case 'info':
      return RiInformationLine
    case 'success':
      return RiCheckLine
    case 'warning':
      return RiErrorWarningLine
    case 'disabled':
    default:
      return RiSubtractLine
  }
})
const iconColor = computed(() => {
  switch (props.state) {
    case 'error':
      return 'text-red-700'
    case 'info':
      return 'text-neutral-900'
    case 'success':
      return 'text-green-700'
    case 'warning':
      return 'text-amber-700'
    case 'disabled':
    default:
      return 'text-neutral-500'
  }
})
onMounted(() => {
  if (route.hash === `#${titleAccordionId}`) {
    open(titleAccordionId)
  }
})
onUnmounted(() => unregister(titleAccordionId))
</script>
