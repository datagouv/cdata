<template>
  <Toggletip
    data-testid="assistant-token-usage"
    no-margin
    placement="top-start"
    button-class="border-transparent -outline-offset-2 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-some"
    :button-props="{ 'aria-label': buttonLabel }"
  >
    <RiDashboard2Line
      class="size-4"
      :class="total !== null ? 'text-new-gray-medium' : 'text-gray-medium'"
      aria-hidden="true"
    />
    <template #toggletip>
      <div class="p-2 text-[11px] leading-4 text-new-gray-medium">
        <template v-if="usage && total !== null">
          <p class="m-0 mb-1 text-[11px] leading-4 font-medium text-new-gray-dark">
            {{ t('Nombre de tokens utilisés') }}
          </p>
          <div class="mt-1 flex items-center justify-between gap-4">
            <span>{{ t('Entrée') }}</span>
            <span class="tabular-nums">{{ usage.inputTokens.toLocaleString(locale) }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between gap-4">
            <span>{{ t('Réponse') }}</span>
            <span class="tabular-nums">{{ usage.outputTokens.toLocaleString(locale) }}</span>
          </div>
          <div class="mt-2 flex items-center justify-between gap-4 border-t border-gray-default pt-1 font-medium text-new-gray-dark">
            <span>{{ t('Total') }}</span>
            <span class="tabular-nums">{{ total.toLocaleString(locale) }}</span>
          </div>
        </template>
        <p
          v-else
          class="m-0 text-[11px] leading-4"
        >
          {{ t('Nombre de tokens utilisés indisponible') }}
        </p>
      </div>
    </template>
  </Toggletip>
</template>

<script setup lang="ts">
import { RiDashboard2Line } from '@remixicon/vue'
import { computed } from 'vue'
import { Toggletip, useTranslation } from '@datagouv/components-next'
import type { AssistantTokenUsage } from '~/utils/assistant'

const props = defineProps<{
  /** null when the count is unknown. */
  usage: AssistantTokenUsage | null
}>()

const { t, locale } = useTranslation()

const total = computed(() => props.usage ? props.usage.inputTokens + props.usage.outputTokens : null)

const buttonLabel = computed(() => total.value !== null
  ? t('{n} tokens utilisés', { n: total.value.toLocaleString(locale) })
  : t('Tokens indisponibles'))
</script>
