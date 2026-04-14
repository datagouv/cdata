<template>
  <div>
    <div class="flex items-center gap-2 mb-2">
      <button
        type="button"
        class="text-xs font-medium px-2 py-0.5 rounded"
        :class="view === 'schema' ? 'bg-gray-200 text-gray-title' : 'text-gray-medium hover:text-gray-title'"
        @click="view = 'schema'"
      >
        {{ t("Schéma") }}
      </button>
      <button
        type="button"
        class="text-xs font-medium px-2 py-0.5 rounded"
        :class="view === 'example' ? 'bg-gray-200 text-gray-title' : 'text-gray-medium hover:text-gray-title'"
        @click="view = 'example'"
      >
        {{ t("Exemple") }}
      </button>
    </div>
    <SchemaTree
      v-if="view === 'schema'"
      :spec="spec"
      :schema="schema"
    />
    <pre
      v-else
      class="text-xs font-mono bg-gray-50 rounded p-3 overflow-x-auto m-0 text-gray-title"
    >{{ exampleJson }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SchemaTree from './SchemaTree.vue'
import { useTranslation } from '../../composables/useTranslation'
import { generateExample } from './openapi'
import type { OpenAPIV3 } from 'openapi-types'

const props = defineProps<{
  spec: OpenAPIV3.Document
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
}>()

const { t } = useTranslation()

const view = ref<'schema' | 'example'>('schema')

const exampleJson = computed(() => {
  const example = generateExample(props.spec, props.schema)
  return JSON.stringify(example, null, 2)
})
</script>
