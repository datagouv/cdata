<template>
  <div class="mt-6 bg-white p-4 rounded">
    <LoadingBlock
      :status
      :data="endpoints"
    >
      <template #default="{ data }">
        <p
          v-if="data.length === 0"
          class="text-sm text-gray-500 italic"
        >
          {{ $t('Aucune réponse documentée dans le swagger.') }}
        </p>
        <template v-else>
          <div
            v-if="hasExpandableNode"
            class="flex gap-2 mb-4"
          >
            <BrandedButton
              color="secondary"
              size="xs"
              @click="openAll"
            >
              {{ $t('Ouvrir tout') }}
            </BrandedButton>
            <BrandedButton
              color="secondary"
              size="xs"
              @click="closeAll"
            >
              {{ $t('Fermer tout') }}
            </BrandedButton>
          </div>
          <div
            v-for="endpoint in data"
            :key="`${endpoint.method}-${endpoint.path}`"
            class="mb-4 bg-white border border-gray-200 rounded-sm p-4"
          >
            <h3 class="text-base font-bold mb-3">
              {{ endpoint.summary || endpoint.path }}
            </h3>
            <hr class="mb-4 border-gray-200">
            <OpenApiProperty
              v-for="(schema, name) in endpoint.properties"
              :key="name"
              :name="String(name)"
              :schema="schema"
            />
          </div>
        </template>
      </template>
      <template #error>
        <p class="text-sm text-red-600">
          {{ $t('Impossible de charger la documentation OpenAPI.') }}
        </p>
      </template>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, reactive } from 'vue'
import { parse } from 'yaml'
import type { OpenAPI } from 'openapi-types'
import { BrandedButton, LoadingBlock } from '@datagouv/components-next'
import OpenApiProperty from './OpenApiProperty.vue'
import { collapseSignalKey, isObject, type CollapseSignal } from './openApiCollapse'
import { extractEndpoints, type EndpointProperties } from '~/utils/openapi-extract'
import { unwrapBouquetData, filterEndpointsByTitle } from '~/utils/openapi-bouquet'

const props = defineProps<{
  url: string
  title?: string
}>()

const { data: endpoints, status } = await useAsyncData<EndpointProperties[]>(
  `openapi-${props.url}`,
  async () => {
    const response = await fetch(props.url)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const text = await response.text()
    const spec = parse(text) as OpenAPI.Document
    let eps = extractEndpoints(spec)
    if (props.title?.includes('| Bouquet')) {
      eps = unwrapBouquetData(eps)
      eps = filterEndpointsByTitle(eps, props.title)
    }
    return eps
  },
  { lazy: true, server: false },
)

const collapseSignal = reactive<CollapseSignal>({ target: true, version: 0 })
provide(collapseSignalKey, collapseSignal)

function openAll() {
  collapseSignal.target = true
  collapseSignal.version++
}

function closeAll() {
  collapseSignal.target = false
  collapseSignal.version++
}

function nodeHasChildren(schema: unknown): boolean {
  if (!isObject(schema)) return false
  if (schema.type === 'object' && isObject(schema.properties)) return true
  if (schema.type === 'array' && isObject(schema.items) && isObject(schema.items.properties)) return true
  return false
}

const hasExpandableNode = computed(() =>
  (endpoints.value ?? []).some(endpoint => Object.values(endpoint.properties).some(nodeHasChildren)),
)
</script>
