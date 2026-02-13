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
    <p
      v-if="showLinks"
      class="mt-4 mb-0 flex flex-col gap-2 text-sm"
    >
      <AppLink
        class="link"
        target="_blank"
        :to="getDocumentation(schema.name)"
      >
        {{ t('Lire la documentation du schéma') }}
      </AppLink>
      <AppLink
        v-for="example in schema.examples"
        :key="example.path"
        class="link"
        target="_blank"
        :to="example.path"
      >
        {{ example.title }}
      </AppLink>
      <AppLink
        class="link"
        target="_blank"
        :to="`${config.baseUrl}/datasets/search?schema=${schema.name}`"
      >
        {{ t('Explorer les fichiers sur data.gouv.fr') }}
      </AppLink>
    </p>
    <RiCheckLine
      v-if="selected"
      class="size-6 fill-datagouv absolute top-4 right-4"
    />
  </div>
</template>

<script setup lang="ts">
import { RiCheckLine, RiInformationLine, RiNodeTree } from '@remixicon/vue'
import AppLink from './AppLink.vue'
import { useTranslation } from '../composables/useTranslation'
import { useGetSchemaDocumentation } from '../functions/schemas'
import type { RegisteredSchema } from '../types/schemas'
import { useComponentsConfig } from '../config'

defineProps<{
  schema: RegisteredSchema
  selectable?: boolean
  selected?: boolean
  showLinks?: boolean
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
const getDocumentation = useGetSchemaDocumentation()
</script>
