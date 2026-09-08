<template>
  <form
    class="space-y-2 border-b border-black/10 px-3 py-2"
    @submit.prevent="apply"
  >
    <select
      v-model="operator"
      class="h-8 w-full rounded-lg border border-transparent bg-[#f3f3f5] px-2 text-sm focus:border-new-primary focus:outline-none"
      :aria-label="t('Condition du filtre')"
    >
      <option
        v-for="option in operatorOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Editable segments rather than a text input: the value never goes through
         a locale-dependent parse, and the day/month/year order follows the locale. -->
    <div class="flex items-stretch gap-2">
      <DateFieldRoot
        v-slot="{ segments }"
        v-model="start"
        v-model:placeholder="placeholder"
        :locale="locale"
        granularity="day"
        class="flex h-8 min-w-0 flex-1 items-center rounded-lg border border-transparent bg-[#f3f3f5] px-2 text-sm tabular-nums focus-within:border-new-primary"
        :class="start ? 'text-gray-title' : 'text-gray-medium'"
        :aria-label="isRange ? t('Date de début') : t('Date')"
      >
        <DateFieldInput
          v-for="item in segments"
          :key="item.part"
          :part="item.part"
          class="rounded px-0.5 focus:bg-new-primary focus:text-white focus:outline-none"
        >
          {{ item.value }}
        </DateFieldInput>
      </DateFieldRoot>

      <DateFieldRoot
        v-if="isRange"
        v-slot="{ segments }"
        v-model="end"
        v-model:placeholder="placeholder"
        :locale="locale"
        granularity="day"
        :min-value="start ?? undefined"
        class="flex h-8 min-w-0 flex-1 items-center rounded-lg border border-transparent bg-[#f3f3f5] px-2 text-sm tabular-nums focus-within:border-new-primary"
        :class="end ? 'text-gray-title' : 'text-gray-medium'"
        :aria-label="t('Date de fin')"
      >
        <DateFieldInput
          v-for="item in segments"
          :key="item.part"
          :part="item.part"
          class="rounded px-0.5 focus:bg-new-primary focus:text-white focus:outline-none"
        >
          {{ item.value }}
        </DateFieldInput>
      </DateFieldRoot>
    </div>

    <!-- Month and year are pickers rather than a heading: reaching a date years
         away otherwise takes one click per month. -->
    <div class="flex items-center gap-1">
      <select
        :value="placeholder.month"
        class="h-7 min-w-0 flex-1 rounded border border-black/10 bg-white px-1 text-xs focus:border-new-primary focus:outline-none"
        :aria-label="t('Mois')"
        @change="goToMonth(Number(($event.target as HTMLSelectElement).value))"
      >
        <option
          v-for="(label, index) in monthNames"
          :key="label"
          :value="index + 1"
        >
          {{ label }}
        </option>
      </select>
      <select
        :value="placeholder.year"
        class="h-7 w-18 rounded border border-black/10 bg-white px-1 text-xs tabular-nums focus:border-new-primary focus:outline-none"
        :aria-label="t('Année')"
        @change="goToYear(Number(($event.target as HTMLSelectElement).value))"
      >
        <option
          v-for="year in selectableYears"
          :key="year"
          :value="year"
        >
          {{ year }}
        </option>
      </select>
      <button
        type="button"
        class="flex size-7 shrink-0 items-center justify-center rounded text-gray-plain transition-colors hover:bg-gray-some focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-new-primary"
        :aria-label="t('Mois précédent')"
        @click="shiftMonths(-1)"
      >
        <RiArrowLeftSLine
          class="size-4"
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        class="flex size-7 shrink-0 items-center justify-center rounded text-gray-plain transition-colors hover:bg-gray-some focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-new-primary"
        :aria-label="t('Mois suivant')"
        @click="shiftMonths(1)"
      >
        <RiArrowRightSLine
          class="size-4"
          aria-hidden="true"
        />
      </button>
    </div>

    <RangeCalendarRoot
      v-if="isRange"
      v-slot="{ grid, weekDays }"
      v-model="range"
      v-model:placeholder="placeholder"
      :locale="locale"
      fixed-weeks
      weekday-format="short"
      :calendar-label="t('Choisir une plage de dates')"
    >
      <RangeCalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="w-full border-collapse select-none"
      >
        <RangeCalendarGridHead>
          <RangeCalendarGridRow>
            <RangeCalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              :class="HEAD_CELL_CLASS"
            >
              {{ day }}
            </RangeCalendarHeadCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridHead>
        <RangeCalendarGridBody>
          <RangeCalendarGridRow
            v-for="(week, index) in month.rows"
            :key="`week-${index}`"
          >
            <RangeCalendarCell
              v-for="day in week"
              :key="day.toString()"
              :date="day"
              class="p-0"
            >
              <RangeCalendarCellTrigger
                v-slot="cell"
                :day="day"
                :month="month.value"
                :class="TRIGGER_CLASS"
              >
                <span :class="rangeDayClass(cell)">{{ cell.dayValue }}</span>
              </RangeCalendarCellTrigger>
            </RangeCalendarCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridBody>
      </RangeCalendarGrid>
    </RangeCalendarRoot>

    <CalendarRoot
      v-else
      v-slot="{ grid, weekDays }"
      v-model="start"
      v-model:placeholder="placeholder"
      :locale="locale"
      fixed-weeks
      weekday-format="short"
      :calendar-label="t('Choisir une date')"
    >
      <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="w-full border-collapse select-none"
      >
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              :class="HEAD_CELL_CLASS"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(week, index) in month.rows"
            :key="`week-${index}`"
          >
            <CalendarCell
              v-for="day in week"
              :key="day.toString()"
              :date="day"
              class="p-0"
            >
              <CalendarCellTrigger
                v-slot="cell"
                :day="day"
                :month="month.value"
                :class="TRIGGER_CLASS"
              >
                <span :class="dayClass(cell)">{{ cell.dayValue }}</span>
              </CalendarCellTrigger>
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </CalendarRoot>

    <div class="flex items-center justify-end gap-2">
      <BrandedButton
        color="tertiary"
        size="2xs"
        type="button"
        keep-margins-even-without-borders
        @click="clear"
      >
        {{ t('Effacer') }}
      </BrandedButton>
      <BrandedButton
        color="primary"
        size="2xs"
        type="submit"
        :disabled="!isComplete"
      >
        {{ t('Appliquer') }}
      </BrandedButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { parseDate, today, getLocalTimeZone, type DateValue } from '@internationalized/date'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarRoot,
  DateFieldInput,
  DateFieldRoot,
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarRoot,
} from 'reka-ui'
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import BrandedButton from '../BrandedButton.vue'
import type { ColumnFilters, DateFilter, DateFilterOperator } from './types'

const props = defineProps<{
  column: string
}>()

const filters = defineModel<Record<string, ColumnFilters>>('filters', { default: () => ({}) })

const { t, locale } = useTranslation()

const operatorOptions = computed<Array<{ value: DateFilterOperator, label: string }>>(() => [
  { value: 'is', label: t('Est') },
  { value: 'before', label: t('Est avant') },
  { value: 'after', label: t('Est après') },
  { value: 'between', label: t('Est entre') },
])

const HEAD_CELL_CLASS = 'pb-1 text-xs font-normal text-gray-medium'
const TRIGGER_CLASS = 'group flex h-8 w-full items-center justify-center focus:outline-none'

type DayState = {
  selected: boolean
  today: boolean
  outsideView: boolean
  disabled: boolean
}

const DAY_BASE_CLASS = 'flex size-8 items-center justify-center text-sm tabular-nums transition-colors'

function dayClass(cell: DayState): string[] {
  return [
    DAY_BASE_CLASS,
    'rounded-md',
    cell.disabled ? 'pointer-events-none text-gray-low' : '',
    cell.outsideView ? 'text-gray-low' : 'text-gray-title',
    cell.selected
      ? 'bg-new-primary font-medium text-white'
      : 'group-hover:bg-gray-some group-focus-visible:ring-2 group-focus-visible:ring-new-primary',
    cell.today && !cell.selected ? 'font-bold text-new-primary' : '',
  ]
}

// The range background has to be continuous across cells, so it is the day
// element that fills its cell and only the two ends get rounded corners.
function rangeDayClass(cell: DayState & { highlighted: boolean, selectionStart: boolean, selectionEnd: boolean }): string[] {
  const isEnd = cell.selectionStart || cell.selectionEnd
  const inRange = cell.highlighted || cell.selected
  return [
    DAY_BASE_CLASS,
    'w-full',
    cell.disabled ? 'pointer-events-none text-gray-low' : '',
    !isEnd && cell.outsideView ? 'text-gray-low' : '',
    isEnd ? 'rounded-md bg-new-primary font-medium text-white' : '',
    !isEnd && inRange ? 'bg-new-primary/10 text-gray-title' : '',
    !isEnd && !inRange ? 'rounded-md text-gray-title group-hover:bg-gray-some' : '',
    cell.selectionStart ? 'rounded-r-none' : '',
    cell.selectionEnd ? 'rounded-l-none' : '',
    cell.today && !isEnd ? 'font-bold text-new-primary' : '',
    'group-focus-visible:ring-2 group-focus-visible:ring-new-primary',
  ]
}

const operator = ref<DateFilterOperator>('is')

// `shallowRef` rather than `ref`: these dates are immutable values, always
// replaced whole, and `UnwrapRef` would flatten the class into a plain object
// type that no longer matches what the calendar components expect.
const start = shallowRef<DateValue | undefined>()
const end = shallowRef<DateValue | undefined>()
// The month the calendar and the fields are looking at.
const placeholder = shallowRef<DateValue>(today(getLocalTimeZone()))

const isRange = computed(() => operator.value === 'between')

// `range` bridges the two separate refs the fields bind to and the single
// object the range calendar expects.
const range = computed({
  get: () => ({ start: start.value, end: end.value }),
  set: (value) => {
    start.value = value.start
    end.value = value.end
  },
})

const isComplete = computed(() => Boolean(start.value && (!isRange.value || end.value)))

const monthNames = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' })
  return Array.from({ length: 12 }, (_, index) =>
    formatter.format(new Date(Date.UTC(2000, index, 1))))
})

// A century back covers historical datasets; the year of the current view is
// added so a date typed in the field is always representable in the picker.
const selectableYears = computed(() => {
  const currentYear = today(getLocalTimeZone()).year
  const years = new Set<number>([placeholder.value.year])
  for (let year = currentYear + 10; year >= currentYear - 100; year--) {
    years.add(year)
  }
  return [...years].sort((a, b) => b - a)
})

function goToMonth(month: number) {
  placeholder.value = placeholder.value.set({ month })
}

function goToYear(year: number) {
  placeholder.value = placeholder.value.set({ year })
}

function shiftMonths(amount: number) {
  placeholder.value = placeholder.value.add({ months: amount })
}

function toDateValue(iso: string | undefined): DateValue | undefined {
  if (!iso) return undefined
  try {
    return parseDate(iso)
  }
  catch {
    return undefined
  }
}

// Reflect the applied filter: the panel stays mounted between openings, and the
// filter can also be dropped from the active-filter chip or the panel header.
watch(() => filters.value[props.column]?.date, (dateFilter) => {
  if (!dateFilter) {
    start.value = undefined
    end.value = undefined
    return
  }
  operator.value = dateFilter.operator
  start.value = toDateValue(dateFilter.start)
  end.value = toDateValue(dateFilter.end)
  if (start.value) {
    placeholder.value = start.value
  }
}, { immediate: true })

function apply() {
  if (!start.value) return
  const dateFilter: DateFilter = {
    operator: operator.value,
    start: start.value.toString(),
  }
  if (isRange.value) {
    if (!end.value) return
    dateFilter.end = end.value.toString()
  }
  const existing = filters.value[props.column] ?? {}
  filters.value = { ...filters.value, [props.column]: { ...existing, date: dateFilter } }
}

function clear() {
  start.value = undefined
  end.value = undefined
  const existing = filters.value[props.column]
  if (!existing?.date) return
  const { date: _date, ...rest } = existing
  filters.value = { ...filters.value, [props.column]: rest }
}
</script>
