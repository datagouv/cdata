<template>
  <div
    :id
    class="dg-content-card dg-schema-card relative border bg-white"
    :class="{
      'border-gray-default': !selected && !active,
      'border-datagouv': selected && !active,
      'border-blue-outline': active,
    }"
    :role="selectable ? 'option' : undefined"
    :tabindex="selectable ? -1 : undefined"
    :aria-selected="selectable && selected"
  >
    <h3 class="dg-card-heading flex items-start gap-2 pr-8">
      <RiNodeTree
        data-icon-size="base"
        focusable="false"
        aria-hidden="true"
        class="shrink-0 mt-1 dg-ds-icon"
      />
      {{ schema.title }}
    </h3>
    <div class="dg-schema-tags">
      <Tag
        v-for="label in schema.labels"
        :key="label"
        type="secondary"
      >
        {{ t('Label :') }} {{ label }}
      </Tag>
      <Tag
        v-if="schema.schema_type"
        type="secondary"
      >
        {{ t('Standard :') }} {{ schema.schema_type }}
      </Tag>
    </div>
    <p class="text-sm mt-2 mb-0 text-gray-medium">
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
      data-icon-size="major"
      focusable="false"
      aria-hidden="true"
      class="dg-schema-selected-icon absolute top-4 right-4 dg-ds-icon"
    />
  </div>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import Tag from './Tag.vue'
import { RiCheckLine, RiNodeTree } from '@remixicon/vue'
import AppLink from './AppLink.vue'
import { useTranslation } from '../composables/useTranslation'
import { useGetSchemaDocumentation } from '../functions/schemas'
import type { RegisteredSchema } from '../types/schemas'
import { useComponentsConfig } from '../config'

defineProps<{
  schema: RegisteredSchema
  id?: string
  selectable?: boolean
  // Highlighted by the keyboard inside the listbox, which is not the same as chosen
  active?: boolean
  selected?: boolean
  showLinks?: boolean
}>()

const { t } = useTranslation()
const config = useComponentsConfig()
const getDocumentation = useGetSchemaDocumentation()
</script>
