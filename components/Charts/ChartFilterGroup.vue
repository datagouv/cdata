<template>
  <div class="border border-new-gray-light rounded-sm p-3 space-y-3">
    <ChartFilterRow
      v-for="(filter, index) in group"
      :key="index"
      :model-value="filter"
      :connector="getConnector(index)"
      :column-options="columnOptions"
      :condition-options="conditionOptions"
      @update:model-value="(f) => $emit('update:filter', index, f)"
      @remove="$emit('remove:filter', index)"
    />
    <div class="flex items-center justify-between gap-2">
      <BrandedButton
        size="xs"
        color="tertiary"
        :icon="RiAddLine"
        @click="$emit('add-condition')"
      >
        {{ addConditionLabel }}
      </BrandedButton>
      <BrandedButton
        v-if="canRemoveGroup"
        size="xs"
        color="tertiary"
        :icon="RiDeleteBinLine"
        icon-only
        @click="$emit('remove-group')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Filter, FilterCondition } from '@datagouv/components-next'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine } from '@remixicon/vue'
import { computed } from 'vue'
import type { FilterGroupCombinator } from '~/utils/chartFilters'
import ChartFilterRow from './ChartFilterRow.vue'

const props = defineProps<{
  group: Array<Filter>
  groupIndex: number
  innerCombinator: FilterGroupCombinator
  canRemoveGroup: boolean
  columnOptions: Array<{ key: string, value: string, disabled: boolean }>
  conditionOptions: Array<FilterCondition>
}>()

defineEmits<{
  'update:filter': [index: number, filter: Filter]
  'remove:filter': [index: number]
  'add-condition': []
  'remove-group': []
}>()

const { t } = useTranslation()

const addConditionLabel = computed(() =>
  props.innerCombinator === 'or' ? t('Ajouter un « ou »') : t('Ajouter un « et »'),
)

function getConnector(index: number): 'first' | 'and' | 'or' | 'none' {
  if (props.groupIndex === 0 && index === 0) return 'first'
  if (index === 0) return 'none'
  return props.innerCombinator
}
</script>
