<template>
  <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
    <div class="text-xs text-gray-600">
      {{ index === 0 ? $t('Quand') : $t('Et que') }}
    </div>
    <Listbox
      v-model="localFilter.column"
      class="min-w-28 max-w-36"
      :options="columnOptions"
      :display-value="d => getColumnLabel(d)"
      :get-option-id="d => getColumnKey(d)"
      :is-disabled="d => isColumnDisabled(d)"
    />

    <Listbox
      v-model="localFilter.condition"
      class="min-w-20"
      :options="conditionOptions"
      :display-value="getConditionLabel"
    />

    <input
      v-if="showValueInput"
      v-model="localFilter.value"
      type="text"
      class="fr-input text-sm w-32 min-w-0 max-w-1/3"
      :placeholder="$t('Valeur')"
    />

    <BrandedButton
      size="xs"
      :disabled="!localFilter.column"
      :icon="RiDeleteBinLine"
      icon-only
      @click="$emit('remove')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Filter, FilterCondition } from '@datagouv/components-next'
import { Listbox, BrandedButton } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: Filter
  index: number
  columnOptions: Array<{ key: string, value: string, disabled: boolean }>
  conditionOptions: Array<FilterCondition>
}>()

const emit = defineEmits<{
  'update:modelValue': [filter: Filter]
  'remove': []
}>()

const { t } = useTranslation()

const localFilter = ref<Filter>({ ...props.modelValue })

watch(localFilter, (newFilter) => {
  emit('update:modelValue', { ...newFilter })
}, { deep: true })

watch(() => props.modelValue, (newValue) => {
  localFilter.value = { ...newValue }
}, { deep: true })

const showValueInput = computed(() => {
  return !['is_null', 'is_not_null'].includes(localFilter.value.condition)
})

function getColumnLabel(col: { key: string, value: string }) {
  return col.value
}

function getColumnKey(col: { key: string, value: string }) {
  return col.key
}

function isColumnDisabled(col: { key: string, value: string, disabled: boolean }) {
  return col.disabled
}

function getConditionLabel(condition: FilterCondition | null) {
  if (!condition) return ''
  return {
    exact: t('est'),
    differs: t('n\'est pas'),
    is_null: t('est vide'),
    is_not_null: t('n\'est pas vide'),
    greater: t('supérieur ou égal à'),
    less: t('inférieur ou égal à'),
    strictly_greater: t('supérieur à'),
    strictly_less: t('inférieur à'),
  }[condition]
}
</script>
