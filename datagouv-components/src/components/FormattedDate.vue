<template>
  <!-- The server formats in its own timezone and at render time, the browser in the
       reader's and at read time, so the displayed text and the `title` legitimately
       differ and Vue is told to accept it. Vue only honours `data-allow-mismatch` on
       an element whose children are plain text, never on a text node coming from a
       slot: hence `label` instead of a slot, and two static elements instead of a
       `<component :is>`, which would pass the text through a slot too. -->
  <time
    v-if="datetime"
    :datetime
    :title
    data-allow-mismatch="text,attribute"
  >{{ text }}</time>
  <!-- No date to format: nothing here depends on the timezone or on "now". -->
  <span v-else>{{ text }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatDate } from '../functions/dates'

const props = withDefaults(defineProps<{
  date: Date | string | null | undefined
  /**
   * `date`: the full date. `relative`: "3 days ago" while the date is less than a
   * month old, the full date beyond. `from-now`: always relative, however old.
   */
  format?: 'date' | 'relative' | 'from-now'
  options?: Intl.DateTimeFormatOptions
  /** Wording around the date, e.g. `date => t('Updated {date}', { date })`. */
  label?: (formatted: string) => string
}>(), {
  format: 'date',
  options: () => ({}),
  label: undefined,
})

const { formatDate, formatFromNow, formatRelativeIfRecentDate } = useFormatDate()

const parsed = computed(() => {
  if (!props.date) return null
  const date = new Date(props.date)
  return isNaN(date.getTime()) ? null : date
})

const datetime = computed(() => parsed.value?.toISOString())

// Hovering a date gives the exact moment, which the displayed form usually omits:
// the relative forms drop it entirely, and most styles drop the time.
const title = computed(() => parsed.value
  ? formatDate(parsed.value, { dateStyle: 'long', timeStyle: 'short' })
  : undefined)

// `formatDate` fills in a default `dateStyle` on the object it receives, so it gets a
// copy: mutating `props.options` would leak the default back to the parent.
const formatted = computed(() => {
  if (props.format === 'relative') return formatRelativeIfRecentDate(parsed.value, { ...props.options })
  if (props.format === 'from-now') return formatFromNow(parsed.value)
  return formatDate(parsed.value, { ...props.options })
})

const text = computed(() => props.label ? props.label(formatted.value) : formatted.value)
</script>
