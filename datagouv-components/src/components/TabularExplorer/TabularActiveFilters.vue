<template>
  <div
    v-if="activeFilters.length > 0 || sort || globalSearch"
    class="flex items-center justify-between gap-2"
  >
    <div class="flex min-w-0 flex-wrap items-center gap-1.5">
      <FilterChip
        v-if="sort"
        :icon="sort.direction === 'asc' ? RiArrowUpLine : RiArrowDownLine"
        :name="sort.column"
        :value="sort.direction === 'asc' ? t('croissant') : t('décroissant')"
        :remove-label="t('Supprimer le tri')"
        @remove="sort = null"
      />
      <FilterChip
        v-if="globalSearch"
        :icon="RiSearchLine"
        :name="t('Toutes les colonnes')"
        :value="globalSearchLabel"
        :remove-label="t('Supprimer la recherche')"
        @remove="globalSearch = ''"
      />
      <FilterChip
        v-for="af in activeFilters"
        :key="af.column"
        :data-testid="`active-filter-${af.column}`"
        :icon="getColumnDisplay(af.column).icon"
        :name="af.column"
        :value="af.label"
        :remove-label="t('Supprimer ce filtre')"
        @remove="removeFilter(af.column)"
      />
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <!-- A sort alone narrows nothing: the file would be the whole resource, which
           the resource's own download already gives. And with no matching row, the
           API answers an empty file, without even the header. -->
      <BrandedButton
        v-if="(activeFilters.length > 0 || globalSearch) && tableData?.meta.total"
        color="tertiary"
        size="2xs"
        :icon="RiDownloadLine"
        :href="filteredDownloadUrl"
      >
        {{ t('Télécharger les données filtrées') }}
      </BrandedButton>
      <!-- Clear all -->
      <BrandedButton
        v-if="withClear && canReset"
        color="tertiary"
        size="2xs"
        :icon="RiCloseLine"
        @click="reset"
      >
        {{ t('Tout réinitialiser') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiArrowDownLine, RiArrowUpLine, RiCloseLine, RiDownloadLine, RiSearchLine } from '@remixicon/vue'
import { computed } from 'vue'
import BrandedButton from '../BrandedButton.vue'
import FilterChip from '../FilterChip.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

// Framing (borders, padding) belongs to the call site, like the toolbar's.
defineProps<{ withClear?: boolean }>()

const { t } = useTranslation()
const { tableData, activeFilters, sort, globalSearch, removeFilter, canReset, reset, getColumnDisplay, filteredDownloadUrl } = useTabularContext()

const globalSearchLabel = computed(() => `${t('contient')} "${globalSearch.value}"`)
</script>
