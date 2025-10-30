<template>
  <div
    class="p-6 relative border bg-white hover:bg-gray-some"
    :class="{ 'border-gray-default': !selected, 'border-datagouv': selected }"
    :role="selectable ? 'option' : undefined"
    :aria-selected="selectable && selected"
  >
    <h3 class="text-base font-bold mb-2 inline-flex items-center gap-2.5">
      <RiDatabaseLine class="size-4" />
      {{ schema.title }}
    </h3>
    <p class="mb-3">
      {{ schema.description }}
    </p>
    <div class="flex items-center gap-2">
      <span class="fr-badge fr-badge--sm fr-badge--info">
        {{ schema.schema_type }}
      </span>
      <span
        v-for="label in schema.labels"
        :key="label"
        class="fr-badge fr-badge--sm"
      >
        {{ label }}
      </span>
    </div>
    <RiCheckLine
      v-if="selected"
      class="size-6 fill-datagouv absolute top-4 right-4"
    />
  </div>
</template>

<script setup lang="ts">
import { RiCheckLine, RiDatabaseLine } from '@remixicon/vue'
import type { RegisteredSchema } from '../types/schemas'

defineProps<{
  schema: RegisteredSchema
  selectable?: boolean
  selected?: boolean
}>()
</script>
