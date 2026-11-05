<template>
  <div class="min-w-0 max-w-full">
    <Toggletip
      :styled-button="false"
      button-class="group relative z-2 flex flex-wrap items-center gap-2 min-h-6 p-0 rounded border-0 text-left cursor-pointer text-sm/6 text-gray-secondary
        hover:bg-gray-some focus-visible:outline-2 focus-visible:outline-new-focus focus-visible:outline-offset-3"
      :button-props="{ title: t('Qualité des métadonnées') }"
      panel-class="w-[min(24rem,calc(100vw-2rem))] max-h-[70vh] overflow-auto p-4 rounded border border-gray-default bg-white shadow-overlay text-sm/[22px] text-gray-title"
      :offset="8"
    >
      <span class="group-hover:underline underline-offset-3">{{ t('Métadonnées') }}</span>
      <QualityScore
        v-if="score !== null"
        :score
        compact
        class="translate-y-px"
      />
      <span
        v-else
        class="text-xs/[18px]"
      >{{ t('Non disponible') }}</span>
      <template #toggletip>
        <slot />
      </template>
    </Toggletip>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../composables/useTranslation'
import QualityScore from './QualityScore.vue'
import Toggletip from './Toggletip.vue'

defineProps<{
  score: number | null
}>()

const { t } = useTranslation()
</script>
