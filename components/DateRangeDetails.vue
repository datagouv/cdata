<template>
  <span>{{ display }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  range: { start: string, end: string | null }
}>()

const { t } = useI18n()

const start = computed(() => new Date(props.range.start))
const end = computed(() => props.range.end ? new Date(props.range.end) : null)

const display = computed(() => {
  let startDisplay: string | number | null = null
  let endDisplay: string | number | null = null
  let isDiscrete = false
  let hasPronoun = false

  const showDayMonthYear = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }).format
  const showDayMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', day: 'numeric' }).format
  const showMonthYear = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long' }).format
  const showMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format

  if (start.value.getDate() === 1 && start.value.getMonth() === 0 && (!end.value || (end.value.getDate() === 31 && end.value.getMonth() === 11))) {
    startDisplay = start.value.getFullYear()
    if (end.value && end.value.getFullYear() > start.value.getFullYear()) {
      endDisplay = end.value.getFullYear()
      isDiscrete = end.value.getFullYear() === start.value.getFullYear() + 1
    }
  }
  else if (start.value.getDate() === 1 && (!end.value || (end.value.getDate() === lastDayOfMonth(end.value)))) {
    startDisplay = start.value.getFullYear() === end.value?.getFullYear() ? showMonth(start.value) : showMonthYear(start.value)
    if (end.value && (end.value.getFullYear() > start.value.getFullYear() || end.value.getMonth() > start.value.getMonth())) {
      endDisplay = showMonthYear(end.value)
      isDiscrete = (end.value.getMonth() === start.value.getMonth() + 1) || (end.value.getMonth() === 0 && start.value.getMonth() === 11)
    }
    else if (end.value) {
      // We are the same month, we will not show the endDisplay so we need to add back the year to the startDisplay
      startDisplay = showMonthYear(start.value)
    }
  }
  else {
    hasPronoun = true
    startDisplay = start.value.getFullYear() === end.value?.getFullYear() ? showDayMonth(start.value) : showDayMonthYear(start.value)
    if (end.value && (end.value.getFullYear() > start.value.getFullYear() || end.value.getMonth() > start.value.getMonth() || end.value.getDate() > start.value.getDate())) {
      endDisplay = showDayMonthYear(end.value)
    }
    else if (end.value) {
      // We are the same day, we will not show the endDisplay so we need to add back the year to the startDisplay
      startDisplay = showDayMonthYear(start.value)
    }
  }

  const addPronoun = (value: string | number | null) => {
    if (!value) return null
    if (!hasPronoun) return value
    return t('le ') + value
  }

  if (endDisplay) {
    if (isDiscrete) {
      return t('{start} et {end}', { start: addPronoun(startDisplay), end: addPronoun(endDisplay) })
    }
    else if (hasPronoun) {
      return t('du {start} au {end}', { start: startDisplay, end: endDisplay })
    }
    else {
      return t('{start} à {end}', { start: startDisplay, end: endDisplay })
    }
  }
  if (!end.value) {
    return t('depuis {start}', { start: addPronoun(startDisplay) })
  }
  return addPronoun(startDisplay)
})

function lastDayOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
</script>
