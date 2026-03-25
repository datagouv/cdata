<template>
  <div class="text-xs overflow-hidden">
    <div
      v-for="prop in properties"
      :key="prop.name"
      class="border-b border-gray-100 last:border-0"
    >
      <div class="flex items-baseline gap-2 py-1.5 min-w-0">
        <button
          v-if="hasNestedProperties(spec, prop.schema)"
          type="button"
          class="shrink-0 flex items-center gap-1 font-mono text-gray-title hover:text-gray-800"
          @click="toggle(prop.name)"
        >
          <RiArrowRightSLine
            class="size-3 text-gray-medium transition-transform"
            :class="{ 'rotate-90': expanded.has(prop.name) }"
          />
          {{ prop.name }}
          <span
            v-if="prop.required"
            class="text-red-600"
          >*</span>
        </button>
        <span
          v-else
          class="font-mono text-gray-title pl-4"
        >
          {{ prop.name }}
          <span
            v-if="prop.required"
            class="text-red-600"
          >*</span>
        </span>
        <span class="font-mono text-gray-medium whitespace-nowrap">{{ prop.type }}</span>
        <span
          v-if="prop.description"
          class="text-gray-medium truncate"
        >{{ prop.description }}</span>
      </div>
      <div
        v-if="expanded.has(prop.name) && hasNestedProperties(spec, prop.schema)"
        class="pl-4 ml-1.5 border-l border-gray-200"
      >
        <SchemaTree
          :spec="spec"
          :schema="getNestedSchema(spec, prop.schema)!"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { RiArrowRightSLine } from '@remixicon/vue'
import { getSchemaProperties, hasNestedProperties, getNestedSchema } from './openapi'
import type { OpenAPIV3 } from 'openapi-types'

const props = defineProps<{
  spec: OpenAPIV3.Document
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
}>()

const properties = computed(() => getSchemaProperties(props.spec, props.schema))

const expanded = reactive(new Set<string>())

function toggle(name: string) {
  if (expanded.has(name)) {
    expanded.delete(name)
  }
  else {
    expanded.add(name)
  }
}
</script>
