<template>
  <th class="font-bold">
    <div
      class="flex items-center whitespace-nowrap"
      :class="{
        'justify-between': !align,
        'justify-start': align === 'left',
        'justify-center': align === 'center',
        'justify-end': align === 'right',
      }"
    >
      <slot />
      <BrandedButton
        v-if="sortable"
        color="secondary-softer"
        size="2xs"
        class="shrink-0 ml-2"
        icon-only
        :icon="sorted === 'desc' ? RiArrowUpLine : RiArrowDownLine"
        :class="sorted ? '' : 'opacity-50'"
        :title="t('Trier')"
        @click="toggleSort"
      >
        {{ t("Trier") }}
      </BrandedButton>
    </div>
  </th>
</template>

<script lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiArrowDownLine, RiArrowUpLine } from '@remixicon/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SortDirection } from '~/types/types'
</script>

<script setup lang="ts">
export type AdminTableThProps = {
  sorted?: SortDirection | null
  align?: 'left' | 'center' | 'right'
}

const props = defineProps<AdminTableThProps>()

const emit = defineEmits<{
  (event: 'sort', direction: SortDirection): void
}>()

const { t } = useI18n()

const sortable = computed(() => props.sorted !== undefined)

function toggleSort() {
  if (props.sorted === 'desc') {
    return emit('sort', 'asc')
  }
  return emit('sort', 'desc')
}
</script>

<style scoped>
th {
  padding: 0.34375rem !important;
  text-transform: uppercase;
}
</style>
