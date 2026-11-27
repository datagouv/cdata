<template>
  <Listbox
    :model-value="modelValue"
    :disabled="disabled"
    @update:model-value="id => emit('update:modelValue', id as string)"
  >
    <div
      class="relative min-w-0"
      data-testid="assistant-model-selector"
    >
      <ListboxLabel class="sr-only">
        {{ t('Modèle de l’assistant') }}
      </ListboxLabel>
      <ListboxButton
        class="flex h-6 max-w-[150px] items-center rounded-full border border-gray-default bg-transparent px-1.5 text-[11px] leading-4 text-new-gray-medium hover:bg-gray-some hover:text-new-gray-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span class="truncate">{{ activeLabel }}</span>
        <RiArrowDownSLine
          class="ml-1 size-3.5 shrink-0"
          aria-hidden="true"
        />
      </ListboxButton>
      <!-- Opens upwards: the composer sits at the bottom of the panel. -->
      <ListboxOptions
        class="absolute bottom-full left-0 z-30 mx-0 mb-1 mt-0 w-[230px] list-none overflow-hidden rounded-md border border-gray-default bg-white p-1 text-[11px] leading-4 shadow-overlay focus:outline-none"
      >
        <ListboxOption
          v-for="model in models"
          :key="model.id"
          v-slot="{ active, selected }"
          as="template"
          :value="model.id"
        >
          <li
            class="flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5"
            :class="[active ? 'bg-gray-lower' : '', selected ? 'text-new-primary' : 'text-new-gray-dark']"
          >
            <RiCheckLine
              class="size-3.5 shrink-0"
              :class="selected ? 'opacity-100' : 'opacity-0'"
              aria-hidden="true"
            />
            <span>{{ model.label }}</span>
          </li>
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>

<script setup lang="ts">
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/vue'
import { computed } from 'vue'
import { useTranslation } from '@datagouv/components-next'
import type { AssistantModel } from './useAssistantModels'

const props = defineProps<{
  models: ReadonlyArray<Readonly<AssistantModel>>
  modelValue: string | null
  disabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', id: string): void
}>()

const { t } = useTranslation()

const activeLabel = computed(() => props.models.find(model => model.id === props.modelValue)?.label ?? '')
</script>
