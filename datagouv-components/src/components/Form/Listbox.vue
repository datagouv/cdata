<template>
  <Listbox
    v-slot="{ activeOption }"
    v-model="model"
  >
    <div class="relative">
      <div
        ref="floatingReference"
        class="relative w-full cursor-default overflow-hidden bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
      >
        <ListboxButton class="input shadow-input text-sm flex items-center gap-2">
          <slot name="button">
            <div class="w-100 flex items-center justify-between gap-2">
              {{ model ? displayValue(model) : '' }}
              <RiArrowDownSLine class="size-4 justify-self-end" />
            </div>
          </slot>
        </ListboxButton>
      </div>

      <ListboxOptions
        ref="popover"
        :style="floatingStyles"
        class="z-10 mt-1 absolute max-h-60 min-w-80 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm pl-0"
      >
        <ListboxOption
          v-for="option in options"
          :key="getOptionId(toValue(option))"
          v-slot="{ selected }"
          as="template"
          :value="option"
        >
          <li
            class="relative cursor-default select-none py-2 pr-4 list-none flex items-center gap-2 text-gray-900"
            :class="{
              'bg-gray-lower': isActive(activeOption, option),
              'pl-2': selected,
              'pl-6': !selected,
            }"
          >
            <div class="flex items-center justify-center aspect-square">
              <RiCheckLine
                v-if="selected"
                class="size-4 text-new-primary"
              />
            </div>
            <slot
              name="option"
              v-bind="{ option, active: isActive(activeOption, option) }"
            >
              {{ displayValue(option) }}
            </slot>
          </li>
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>

<script setup lang="ts" generic="T extends string | number | object">
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { useFloating, autoUpdate, autoPlacement } from '@floating-ui/vue'
import { toValue, useTemplateRef } from 'vue'
import { RiCheckLine } from '@remixicon/vue'

const props = withDefaults(defineProps<{
  options?: Array<T>
  getOptionId?: (option: T) => string | number
  displayValue: (option: T) => string
}>(), {
  getOptionId: (option: T): string | number => {
    if (typeof option === 'string') return option
    if (typeof option === 'number') return option
    if (typeof option === 'object' && 'id' in option) return option.id as string

    throw new Error('Please set getOptionId()')
  },
})

const model = defineModel<T | null>()

const referenceRef = useTemplateRef('floatingReference')
const floatingRef = useTemplateRef<InstanceType<typeof ListboxOptions>>('popover')
const { floatingStyles } = useFloating(referenceRef, floatingRef, {
  middleware: [autoPlacement({
    allowedPlacements: ['bottom-start', 'bottom', 'bottom-end'],
    crossAxis: true,
  })],
  whileElementsMounted: autoUpdate,
})

function isActive(activeOption: T, currentOption: T) {
  return activeOption ? props.getOptionId(activeOption) === props.getOptionId(currentOption) : false
}
</script>
