<template>
  <div
    class="p-4 relative border bg-white hover:bg-gray-some"
    :class="{ 'border-gray-default': !selected, 'border-datagouv': selected }"
    :role="selectable ? 'option' : undefined"
    :aria-selected="selectable && selected"
  >
    <h3 class="text-base font-bold mb-0 flex items-center gap-1">
      <RiNodeTree class="size-4" />
      {{ schema.title }}
    </h3>
    <p
      v-for="label in schema.labels"
      :key="label"
      class="flex items-center gap-1 text-sm mb-0"
    >
      <span class="flex items-center gap-1 text-gray-medium">
        <RiInformationLine class="size-3" /> {{ t('Label :') }}
      </span>
      <span>{{ label }}</span>
    </p>
    <p class="flex items-center gap-1 text-sm mb-0">
      <span class="flex items-center gap-1 text-gray-medium">
        <RiInformationLine class="size-3" /> {{ t('Standard :') }}
      </span>
      <span>{{ schema.schema_type }}</span>
    </p>
    <p class="text-sm mt-4 mb-0">
      {{ schema.description }}
    </p>
    <div class="flex items-center gap-2" />
    <RiCheckLine
      v-if="selected"
      class="size-6 fill-datagouv absolute top-4 right-4"
    />
  </div>
</template>

<script setup lang="ts">
import { RiCheckLine, RiInformationLine, RiNodeTree } from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'
import type { RegisteredSchema } from '../types/schemas'

defineProps<{
  schema: RegisteredSchema
  selectable?: boolean
  selected?: boolean
}>()

const { t } = useTranslation()
</script>
