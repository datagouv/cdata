<template>
  <div :class="fill ? 'flex min-h-0 flex-1 flex-col' : ''">
    <div
      v-if="error"
      class="p-4"
    >
      <PreviewError
        :resource
        :error-type="error.type"
        :detail="error.detail"
        :show-producer-cta="canEdit"
      />
    </div>
    <!-- Also shown during the server-side render: the layer is only queried by the browser. -->
    <TabularSkeleton
      v-else-if="status !== 'success'"
      :fill
      :search-input="false"
    />
    <template v-else>
      <div class="flex shrink-0 items-center justify-end gap-1.5 border-b border-gray-default p-2 text-xs text-gray-plain">
        <RiLayoutRowLine
          class="size-3 text-mention-grey"
          aria-hidden="true"
        />
        <span data-testid="row-count">{{ rowsInfo }}</span>
      </div>
      <div
        v-if="!columns.length || !rows.length"
        class="py-16 text-center text-sm text-gray-low"
      >
        {{ t('Aucune donnée à afficher') }}
      </div>
      <div
        v-else
        class="overflow-auto"
        :class="fill ? 'min-h-0 flex-1' : 'max-h-[70vh]'"
      >
        <table class="text-sm border-collapse">
          <thead class="sticky top-0 z-10 bg-gray-some shadow-[inset_0_-1px_0_0_#E5E5E5]">
            <tr class="border-b border-gray-default">
              <th
                v-for="column in columns"
                :key="column.name"
                class="h-12 px-3 text-left align-middle whitespace-nowrap border-r border-gray-default last:border-r-0 text-[12px] font-bold text-gray-title"
              >
                {{ column.name }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in rows"
              :key="index"
              class="border-b border-gray-default even:bg-gray-lowest-2"
            >
              <td
                v-for="column in columns"
                :key="column.name"
                class="max-w-80 p-2 align-middle whitespace-nowrap border-r border-gray-default last:border-r-0 overflow-hidden"
                :class="{ 'text-right font-mono tabular-nums text-sm': column.type === 'number' || column.type === 'date' }"
              >
                <TabularCell
                  :value="row[column.name]"
                  :column-type="column.type"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiLayoutRowLine } from '@remixicon/vue'
import type { Resource } from '../../types/resources'
import type { WfsPreviewLayer } from '../../functions/wfs'
import type { ColumnType } from '../TabularExplorer/types'
import { useTranslation } from '../../composables/useTranslation'
import { useWfsFeatures, useWfsSchema } from '../../composables/useWfs'
import TabularCell from '../TabularExplorer/TabularCell.vue'
import TabularSkeleton from '../TabularExplorer/TabularSkeleton.vue'
import PreviewError from './PreviewError.vue'

const props = defineProps<{
  resource: Resource
  // From `useResourceCapabilities`.
  layer: WfsPreviewLayer
  // Fill the available height (fullscreen) instead of the default capped height.
  fill?: boolean
  canEdit?: boolean
}>()

const { t } = useTranslation()

// The schema is shared with the structure tab when the parent called `provideWfsSchema`.
const schemaState = useWfsSchema(() => props.resource, () => props.layer)
const { rows, total, status, error } = useWfsFeatures(() => props.layer, schemaState)

const NUMBER_TYPES = ['int', 'integer', 'long', 'short', 'byte', 'double', 'float', 'decimal', 'nonNegativeInteger', 'positiveInteger', 'unsignedInt', 'unsignedLong', 'unsignedShort']

function columnType(xsdType: string): ColumnType {
  if (NUMBER_TYPES.includes(xsdType)) return 'number'
  if (xsdType === 'date' || xsdType === 'dateTime') return 'date'
  if (xsdType === 'boolean') return 'boolean'
  return 'text'
}

// In the schema's order: the JSON rows don't keep it on every server.
const columns = computed(() => (schemaState.schema.value?.attributes ?? [])
  .map(attribute => ({ name: attribute.name, type: columnType(attribute.type) })))

const rowsInfo = computed(() => {
  const count = rows.value.length
  if (total.value !== null && total.value > count) {
    return t('{count} premières lignes sur {total}', { count: count.toLocaleString(), total: total.value.toLocaleString() })
  }
  return count === 1 ? t('1 ligne') : t('{count} lignes', { count: count.toLocaleString() })
})
</script>
