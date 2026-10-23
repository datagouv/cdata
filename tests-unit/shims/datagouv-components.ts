// Vitest alias target for '@datagouv/components-next' (see vitest.config.ts).
// Re-exports only what the tested cdata modules import at runtime, from the
// real source files, so tests run the real implementations without loading the
// whole package entry (components, leaflet, chart.js…).
// Placeholder components: unit tests stub or ignore them, and the real SFCs
// pull the full package entry which this shim exists to avoid.
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'

export { accessTypeToApi, accessTypeToForm, defaultAccessTypeForm } from '~/datagouv-components/src/types/access_types'
export { throwOnNever } from '~/datagouv-components/src/functions/never'
export { DESCRIPTION_MIN_LENGTH } from '~/datagouv-components/src/functions/description'
export { getResourceFilesize } from '~/datagouv-components/src/functions/resources'
export { buildTypeConfig } from '~/datagouv-components/src/functions/tabular'
export { buildColumnsFromProfile, inferChartConfig, toChartApi, toChartForm } from '~/datagouv-components/src/functions/charts'
export { useGetProfile } from '~/datagouv-components/src/functions/tabularApi'
export { useHasTabularData } from '~/datagouv-components/src/composables/useHasTabularData'
export { useTranslation } from '~/datagouv-components/src/composables/useTranslation'
export { toast } from 'vue-sonner'

export const BrandedButton = defineComponent({
  name: 'BrandedButton',
  setup(_, { slots }) {
    return () => h('button', slots.default?.())
  },
})

export const SearchableSelect = defineComponent({
  name: 'SearchableSelect',
  setup(_, { slots }) {
    return () => h('div', { class: 'searchable-select-stub' }, slots.default?.())
  },
})

export const Listbox = defineComponent({
  name: 'Listbox',
  setup(_, { slots }) {
    return () => h('div', { class: 'listbox-stub' }, slots.default?.())
  },
})

export const SegmentedControl = defineComponent({
  name: 'SegmentedControl',
  props: {
    modelValue: { type: String, required: true },
    options: { type: Array as PropType<Array<{ value: string, label: string }>>, default: () => [] },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', { class: 'segmented-control-stub', role: 'group' }, props.options.map(option =>
      h('button', {
        'type': 'button',
        'aria-pressed': option.value === props.modelValue,
        'onClick': () => emit('update:modelValue', option.value),
      }, option.label),
    ))
  },
})
