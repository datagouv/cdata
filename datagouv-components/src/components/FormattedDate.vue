<template>
  <!-- An instant is formatted in the server's timezone at render time and in the
       reader's at read time, so its text and `title` legitimately differ and Vue is
       told to accept it. A plain date carries no time, so nothing about it varies —
       exempting it would hide a real bug instead of a legitimate difference. Vue only
       honours `data-allow-mismatch` on an element whose children are plain text,
       never on a text node coming from a slot: hence two static elements instead of a
       `<component :is>`, which would pass the text through a slot. -->
  <time
    v-if="datetime"
    :datetime
    :title
    :data-allow-mismatch="allowMismatch"
  >{{ formatted }}</time>
  <!-- No date to format: nothing here depends on the timezone or on "now". -->
  <span v-else>{{ formatted }}</span>
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
}>(), {
  format: 'date',
  options: () => ({}),
})

const { formatDate, formatFromNow, formatRelativeIfRecentDate } = useFormatDate()

// `2026`, `2026-04` and `2026-04-24` carry no time of day. `new Date()` reads them as
// midnight UTC, an instant they never claimed, and then converts it: a reader west of
// UTC gets the day before — and with it the month, and sometimes the year.
const PLAIN_DATE = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/

const plainDate = computed(() => typeof props.date === 'string' ? props.date.match(PLAIN_DATE) : null)

const parsed = computed(() => {
  if (!props.date) return null
  const plain = plainDate.value
  const date = plain
    ? new Date(Number(plain[1]), Number(plain[2] ?? 1) - 1, Number(plain[3] ?? 1))
    : new Date(props.date)
  return isNaN(date.getTime()) ? null : date
})

// Announce the precision the value carries, never more: a month stays a month.
const datetime = computed(() => {
  if (!parsed.value) return undefined
  return plainDate.value ? plainDate.value[0] : parsed.value.toISOString()
})

// Hovering an instant gives the exact moment, which the displayed form usually omits:
// the relative forms drop it entirely, and most styles drop the time. A plain date has
// no moment to reveal — a `title` there would be one we made up.
const title = computed(() => parsed.value && !plainDate.value
  ? formatDate(parsed.value, { dateStyle: 'long', timeStyle: 'short' })
  : undefined)

// Only what genuinely differs between server and browser is exempted: an instant, and
// the relative forms, which are measured against "now".
const allowMismatch = computed(() => !plainDate.value || props.format !== 'date'
  ? 'text,attribute'
  : undefined)

// `formatDate` fills in a default `dateStyle` on the object it receives, so it gets a
// copy: mutating `props.options` would leak the default back to the parent.
const formatted = computed(() => {
  if (props.format === 'relative') return formatRelativeIfRecentDate(parsed.value, { ...props.options })
  if (props.format === 'from-now') return formatFromNow(parsed.value)
  return formatDate(parsed.value, { ...props.options })
})
</script>
