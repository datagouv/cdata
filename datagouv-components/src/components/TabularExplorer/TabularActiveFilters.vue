<template>
  <div
    v-if="activeFilters.length > 0 || sort"
    class="flex flex-wrap items-center gap-1.5"
  >
    <!-- Sort chip -->
    <span
      v-if="sort"
      class="inline-flex h-6 items-center gap-1 rounded border border-new-primary/20 bg-new-primary/10 pl-1.5 pr-0.5 text-[12px] leading-4 text-new-primary"
    >
      <component
        :is="sort.direction === 'asc' ? RiArrowUpLine : RiArrowDownLine"
        class="size-3.5"
        aria-hidden="true"
      />
      <span class="font-medium">{{ sort.column }}</span>
      <span>{{ sort.direction === 'asc' ? t('croissant') : t('décroissant') }}</span>
      <button
        :aria-label="t('Supprimer le tri')"
        class="flex size-5 items-center justify-center rounded hover:bg-new-primary/15"
        @click="sort = null"
      >
        <RiCloseLine
          class="size-3.5"
          aria-hidden="true"
        />
      </button>
    </span>

    <!-- Filter chips -->
    <span
      v-for="af in activeFilters"
      :key="af.column"
      class="inline-flex h-6 items-center gap-1 rounded border border-new-primary/20 bg-new-primary/10 pl-1.5 pr-0.5 text-[12px] leading-4 text-new-primary"
    >
      <component
        :is="getColumnDisplay(af.column).icon"
        class="size-3.5"
        aria-hidden="true"
      />
      <span class="font-medium">{{ af.column }}</span>
      <span>{{ af.label }}</span>
      <button
        :aria-label="t('Supprimer ce filtre')"
        class="flex size-5 items-center justify-center rounded hover:bg-new-primary/15"
        @click="removeFilter(af.column)"
      >
        <RiCloseLine
          class="size-3.5"
          aria-hidden="true"
        />
      </button>
    </span>

    <!-- Clear all -->
    <BrandedButton
      v-if="withClear"
      color="tertiary"
      size="2xs"
      :icon="RiCloseLine"
      @click="clearAllFilters(); sort = null"
    >
      {{ t('Tout effacer') }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { RiArrowDownLine, RiArrowUpLine, RiCloseLine } from '@remixicon/vue'
import BrandedButton from '../BrandedButton.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

defineProps<{ withClear?: boolean }>()

const { t } = useTranslation()
const { activeFilters, sort, removeFilter, clearAllFilters, getColumnDisplay } = useTabularContext()
</script>
