<template>
  <!-- Editable segments rather than a text input: the value never goes through a
       locale-dependent parse, and the day/month/year order follows the locale. -->
  <DateFieldRoot
    v-slot="{ segments }"
    v-model="model"
    v-model:placeholder="placeholder"
    :locale="locale"
    granularity="day"
    :min-value="minValue"
    class="flex h-8 min-w-0 flex-1 items-center rounded-lg border border-transparent bg-[#f3f3f5] px-2 text-sm tabular-nums focus-within:border-new-primary"
    :class="model ? 'text-gray-title' : 'text-gray-medium'"
    :aria-label="label"
  >
    <DateFieldInput
      v-for="(item, index) in segments"
      :key="`${index}-${item.part}`"
      :part="item.part"
      class="rounded px-0.5 focus:bg-new-primary focus:text-white focus:outline-none"
    >
      {{ item.value }}
    </DateFieldInput>
  </DateFieldRoot>
</template>

<script setup lang="ts">
import { DateFieldInput, DateFieldRoot } from 'reka-ui'
import type { DateValue } from '@internationalized/date'
import { useTranslation } from '../../composables/useTranslation'

defineProps<{
  label: string
  minValue?: DateValue
}>()

const model = defineModel<DateValue | undefined>()
// Shared with the calendar and the other field: it is the month on display.
const placeholder = defineModel<DateValue>('placeholder', { required: true })

const { locale } = useTranslation()
</script>
