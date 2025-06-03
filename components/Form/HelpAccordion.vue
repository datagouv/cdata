<template>
  <Disclosure
    as="div"
    class="fr-accordion"
  >
    <h3 class="fr-accordion__title !mb-0">
      <DisclosureButton
        class="fr-accordion__btn !text-neutral-900"
        :aria-expanded="isOpen(accordionId)"
        :aria-controls="accordionId"
        @click="toggle(accordionId)"
      >
        <component
          :is="icon"
          class="fr-mr-2w shrink-0"
          :class="iconColor"
          size="24px"
        />
        {{ title }}
      </DisclosureButton>
    </h3>
    <DisclosurePanel
      v-show="isOpen(accordionId)"
      :id="accordionId"
      class="px-4 pt-4 pb-6"
      static
    >
      <slot />
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { RiCloseLine, RiErrorWarningLine, RiSubtractLine } from '@remixicon/vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { key, type AccordionRegister } from '~/components/Accordion/injectionKey'

defineProps<{
  title: string
}>()

const accordionId = inject<string>('accordionId', undefined as never)
const formKey = inject<KeysOfUnion<T>>('formKey', undefined as never)
const { getFirstError, getFirstWarning } = inject<FormInfo<T>>('formInfo', undefined as never)

const { toggle, isOpen } = inject(key) as AccordionRegister

const icon = computed(() => {
  if (getFirstError(formKey)) return RiCloseLine
  if (getFirstWarning(formKey)) return RiErrorWarningLine

  return RiSubtractLine
})
const iconColor = computed(() => {
  if (getFirstError(formKey)) return 'text-red-700'
  if (getFirstWarning(formKey)) return 'text-amber-700'

  return 'text-neutral-500'
})
</script>
