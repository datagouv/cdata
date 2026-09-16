<template>
  <div :class="[bordered ? 'border border-new-gray-light rounded-sm p-3' : '', 'space-y-3']">
    <ChartFilterRow
      v-for="(filter, index) in group"
      :key="index"
      :model-value="filter"
      :index="index"
      :combinator="combinator"
      :column-options="columnOptions"
      :condition-options="conditionOptions"
      @update:combinator="$emit('update:combinator', $event)"
      @remove="$emit('remove:filter', index)"
    />
    <div class="flex items-center justify-between gap-2">
      <BrandedButton
        size="xs"
        color="tertiary"
        :icon="RiAddLine"
        @click="$emit('add-condition')"
      >
        {{ t('Ajouter une règle') }}
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
import type { FilterColumnOption, FilterGroupCombinator } from '~/utils/chartFilters'
import ChartFilterRow from './ChartFilterRow.vue'

defineProps<{
  group: Array<Filter>
  combinator: FilterGroupCombinator
  canRemoveGroup: boolean
  bordered: boolean
  columnOptions: Array<FilterColumnOption>
  conditionOptions: Array<FilterCondition>
}>()

defineEmits<{
  'update:combinator': [combinator: FilterGroupCombinator]
  'remove:filter': [index: number]
  'add-condition': []
  'remove-group': []
}>()

const { t } = useTranslation()
</script>
