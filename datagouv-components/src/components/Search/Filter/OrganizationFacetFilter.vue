<template>
  <FilterButtonGroup
    :model-value="modelValue"
    :options="options"
    :label="t('Organisation')"
    :all-label="t('Toutes')"
    :facets="normalizedFacets"
    :loading="loading"
    name="organization_facet"
    highlight-active
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FacetItem } from '../../../types/search'
import { useTranslation } from '../../../composables/useTranslation'
import FilterButtonGroup from './FilterButtonGroup.vue'

const props = defineProps<{
  modelValue: string | undefined
  facets?: FacetItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { t } = useTranslation()

// organization_id_with_name facet name format: "org-slug|Org Display Name"
const parsed = computed(() =>
  (props.facets ?? []).map((f) => {
    const [id = '', ...labelParts] = f.name.split('|')
    return { id, label: labelParts.join('|'), count: f.count }
  }),
)

const options = computed(() =>
  parsed.value.map(({ id, label }) => ({ value: id, label })),
)

const normalizedFacets = computed(() =>
  parsed.value.map(({ id, count }) => ({ name: id, count })),
)
</script>
