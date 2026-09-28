<template>
  <div
    ref="element"
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

const element = useTemplateRef<HTMLDivElement>('element')

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

// A field can hold several focusable elements (an input and the options it filters, a
// value and its action button). Moving between them is not leaving the field, so
// validating there would flag a value the user is still in the middle of choosing.
const focusOut = (event: FocusEvent) => {
  const nextFocused = event.relatedTarget
  if (nextFocused instanceof Node && element.value?.contains(nextFocused)) return

  touch(props.formKey)
}
</script>
