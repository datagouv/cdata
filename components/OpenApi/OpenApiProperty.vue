<template>
  <div class="mb-4">
    <div class="flex items-center justify-between mb-1">
      <span class="inline-block rounded-sm border border-gray-200 bg-white px-3 py-1 text-sm font-bold">
        {{ title || name }}
      </span>
      <span
        v-if="example !== undefined"
        class="text-xs text-gray-500 ml-2 whitespace-nowrap"
      >
        {{ $t('Ex : {example}', { example: String(example) }) }}
      </span>
    </div>

    <p
      v-if="placeholderMessage"
      class="text-sm italic text-gray-500 mb-2 pl-3"
    >
      {{ placeholderMessage }}
    </p>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else-if="description"
      class="text-sm text-gray-600 mb-2 pl-3"
      v-html="sanitizedDescription"
    />

    <div
      v-if="objectProperties"
      class="border-l border-gray-200 pl-4 ml-3 mt-2"
    >
      <OpenApiProperty
        v-for="(subSchema, subName) in objectProperties"
        :key="subName"
        :name="String(subName)"
        :schema="subSchema"
      />
    </div>

    <div
      v-if="arrayItemProperties"
      class="border-l border-gray-200 pl-4 ml-3 mt-2"
    >
      <p class="text-xs text-gray-500 mb-2">
        {{ $t('Cette propriété contient 1 ou plusieurs éléments ayant les spécifications suivantes :') }}
      </p>
      <OpenApiProperty
        v-for="(itemSchema, itemName) in arrayItemProperties"
        :key="itemName"
        :name="String(itemName)"
        :schema="itemSchema"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  name: string
  schema: unknown
}>()

const { t } = useTranslation()

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const schemaObj = computed(() => (isObject(props.schema) ? props.schema : {}))

const title = computed(() => (typeof schemaObj.value.title === 'string' ? schemaObj.value.title : undefined))
const description = computed(() => (typeof schemaObj.value.description === 'string' ? schemaObj.value.description : undefined))
const example = computed(() => schemaObj.value.example)

const placeholderMessage = computed(() => {
  switch (schemaObj.value._placeholder) {
    case 'circular':
      return t('Référence circulaire')
    case 'external':
      return t('Référence externe non résolue')
    case 'variant': {
      const count = typeof schemaObj.value._variantCount === 'number' ? schemaObj.value._variantCount : 0
      return t('Une variante parmi {count}', { count })
    }
    default:
      return undefined
  }
})

const objectProperties = computed(() => {
  if (schemaObj.value.type !== 'object') return undefined
  return isObject(schemaObj.value.properties) ? schemaObj.value.properties : undefined
})

const arrayItemProperties = computed(() => {
  if (schemaObj.value.type !== 'array') return undefined
  const items = schemaObj.value.items
  if (!isObject(items)) return undefined
  return isObject(items.properties) ? items.properties : undefined
})

const sanitizedDescription = computed(() => {
  if (!description.value) return ''
  return DOMPurify.sanitize(description.value, {
    ALLOWED_TAGS: ['a', 'b', 'strong', 'i', 'em', 'code', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
})
</script>
