<template>
  <SearchableSelect
    :model-value="selectedOption"
    :options="options"
    :loading="loading"
    :label="t('Organisation')"
    :placeholder="t('Toutes les organisations')"
    :get-option-id="(opt) => opt.value"
    :display-value="(opt) => opt.label"
    :multiple="false"
    @update:model-value="emit('update:modelValue', $event?.value ?? undefined)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FacetItem } from '../../../types/search'
import { useTranslation } from '../../../composables/useTranslation'
import SearchableSelect from '../../Form/SearchableSelect.vue'

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
const options = computed(() =>
  (props.facets ?? [])
    .map((f) => {
      const [id = '', ...labelParts] = f.name.split('|')
      return { value: id, label: labelParts.join('|') }
    })
    .filter(o => o.value !== '' && o.label !== ''),
)

const selectedOption = computed(() =>
  options.value.find(o => o.value === props.modelValue) ?? null,
)
</script>
