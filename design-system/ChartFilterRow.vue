<template>
  <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
    <div class="text-xs text-gray-600">
      {{ index === 0 ? $t('Quand') : $t('Et que') }}
    </div>
    <Listbox
      v-model="filter.column"
      class="min-w-28 max-w-36"
      :options="listboxOptions"
      :display-value="getOptionLabel"
      :get-option-id="getOptionId"
      :is-disabled="isOptionDisabled"
    />

    <Listbox
      v-model="filter.condition"
      class="min-w-20"
      :options="conditionOptions"
      :display-value="getConditionLabel"
    />

    <input
      v-if="showValueInput"
      v-model="filter.value"
      type="text"
      class="fr-input text-sm w-32 min-w-0 max-w-1/3"
      :placeholder="$t('Valeur')"
    >

    <BrandedButton
      size="xs"
      :disabled="!filter.column"
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
import { computed } from 'vue'

const filter = defineModel<Filter>({ required: true })

const props = defineProps<{
  index: number
  columnOptions: Array<{ key: string, value: string, disabled: boolean }>
  conditionOptions: Array<FilterCondition>
}>()

const emit = defineEmits<{
  'remove': []
}>()

 const { t } = useTranslation()

const listboxOptions = computed(() =>
  props.columnOptions.map(opt => opt.key)
)

const getOptionByKey = (key: string) =>
  props.columnOptions.find(opt => opt.key === key) || null

function getOptionLabel(key: string | null): string {
  if (!key) return ''
  const option = getOptionByKey(key)
  return option?.value || ''
}

function getOptionId(key: string | null): string {
  return key || ''
}

function isOptionDisabled(key: string | null): boolean {
    if (!key) return false
    const option = getOptionByKey(key)
    return option?.disabled || false
}

const showValueInput = computed(() => {
    return !['is_null', 'is_not_null'].includes(filter.value.condition)
})

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
