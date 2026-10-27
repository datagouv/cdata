<template>
  <div
    :id
    class="schema-card"
    :class="{
      'border-gray-default': !selected && !active,
      'border-datagouv': selected && !active,
      'border-blue-outline': active,
    }"
    :role="selectable ? 'option' : undefined"
    :tabindex="selectable ? -1 : undefined"
    :aria-selected="selectable && selected"
  >
    <h3 class="schema-card__title">
      <RiNodeTree aria-hidden="true" />
      {{ schema.title }}
    </h3>
    <div class="schema-card__tags">
      <Tag v-for="label in schema.labels" :key="label" type="secondary">
        {{ t('Label :') }} {{ label }}
      </Tag>
      <Tag v-if="schema.schema_type" type="secondary">
        {{ t('Standard :') }} {{ schema.schema_type }}
      </Tag>
    </div>
    <p class="schema-card__description">
      {{ schema.description }}
    </p>
    <p v-if="showLinks" class="schema-card__links">
      <AppLink class="link" target="_blank" :to="getDocumentation(schema.name)">
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
    <RiCheckLine v-if="selected" class="schema-card__selected" />
  </div>
</template>

<script setup lang="ts">
import { RiCheckLine, RiNodeTree } from '@remixicon/vue'
import AppLink from './AppLink.vue'
import Tag from './Tag.vue'
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

<style scoped>
.schema-card {
  position: relative;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 0.25rem;
  background: #fff;
}
.schema-card[aria-selected='true'] {
  border-color: #000091;
  box-shadow: inset 0 0 0 1px #000091;
  background: #e8edff;
}
.schema-card.border-blue-outline {
  outline: 2px solid #0a76f6;
  outline-offset: 3px;
}
.schema-card__title {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding-inline-end: 2rem;
  margin: 0;
  color: #161616;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
  overflow-wrap: anywhere;
}
.schema-card__title svg {
  width: 1rem;
  height: 1rem;
  flex: none;
  margin-top: 0.25rem;
}
.schema-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-block: 0.5rem;
}
.schema-card__description {
  margin: 0;
  color: #555;
  font-size: 0.875rem;
  line-height: 1.375rem;
  overflow-wrap: anywhere;
}
.schema-card__links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0 0;
  font-size: 0.875rem;
}
.schema-card__selected {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #000091;
}
</style>
