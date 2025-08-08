<template>
  <div
    class="fr-fieldset__element"
    @focusin="focusIn"
    @focusout="focusOut"
  >
    <slot />

    <slot name="warning">
      <SimpleBanner
        v-if="warning"
        class="mt-3"
        type="warning"
      >
        {{ warning }}
      </SimpleBanner>
    </slot>

    <ClientOnly>
      <Teleport
        :to="`#${accordionsId}`"
        defer
      >
        <slot name="accordion" />
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts" generic="T">
import { SimpleBanner } from '@datagouv/components-next'
import { key, type AccordionRegister } from '~/components/Accordion/injectionKey'

const props = defineProps<{
  formKey: KeysOfUnion<T>
}>()

const accordionsId = inject<string>('accordionsId')
const { getFirstWarning, touch } = inject<FormInfo<T>>('formInfo', undefined as never)
provide('formKey', props.formKey as string)

const slots = useSlots()
const hasAccordion = computed(() => slots.accordion)
const warning = computed(() => getFirstWarning(props.formKey))

const innerAccordionId = useId()
const accordionId = computed(() => {
  if (!hasAccordion.value) return undefined
  return innerAccordionId
})
provide('accordionId', accordionId)

const { open } = inject(key) as AccordionRegister

const focusIn = () => {
  if (!hasAccordion.value) return
  open(innerAccordionId)
}

const focusOut = () => {
  touch(props.formKey)
}
</script>
