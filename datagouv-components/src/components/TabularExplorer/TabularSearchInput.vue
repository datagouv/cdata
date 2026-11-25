<template>
  <label class="flex h-8 w-[clamp(160px,22vw,220px)] min-w-0 shrink-0 items-center gap-1 rounded border border-gray-default bg-gray-some px-2">
    <RiSearchLine
      class="size-3.5 shrink-0 text-gray-medium"
      aria-hidden="true"
    />
    <input
      v-model="text"
      type="search"
      class="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-medium [&::-webkit-search-cancel-button]:appearance-none"
      :aria-label="t('Rechercher une valeur')"
      :placeholder="t('Rechercher une valeur')"
    >
  </label>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RiSearchLine } from '@remixicon/vue'
import { useComponentsConfig } from '../../config'
import { useDebouncedRef } from '../../composables/useDebouncedRef'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

const { t } = useTranslation()
const config = useComponentsConfig()
const { globalSearch } = useTabularContext()

// Only typing is debounced: each settled value is a request to the Tabular API.
const text = ref(globalSearch.value)
const { debounced } = useDebouncedRef(text, config.searchDebounce ?? 300)
watch(debounced, (value) => {
  globalSearch.value = value.trim()
})

// Cleared from elsewhere (its chip, "Tout réinitialiser"): the field follows.
watch(globalSearch, (value) => {
  if (value !== text.value.trim()) text.value = value
})
</script>
