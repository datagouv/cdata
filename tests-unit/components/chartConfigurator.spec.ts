// @vitest-environment happy-dom
import type { ChartForm } from '@datagouv/components-next'
import { toChartApi } from '@datagouv/components-next'
import { configKey } from '~/datagouv-components/src/config'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, Suspense } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChartConfigurator from '~/components/Charts/ChartConfigurator.vue'
import type { Chart } from '~/datagouv-components/src/types/visualizations'

const toastSuccess = vi.hoisted(() => vi.fn())

const getProfileMock = vi.hoisted(() => vi.fn())

const apiMock = vi.hoisted(() => vi.fn())

const fileApiMock = vi.hoisted(() => vi.fn())

const chartsApiMock = vi.hoisted(() => vi.fn())

vi.mock('~/utils/auth', () => ({
  isMeAdmin: () => true,
}))

vi.mock('@datagouv/components-next', async (importOriginal) => {
  const original = await importOriginal<typeof import('@datagouv/components-next')>()
  return {
    ...original,
    useGetProfile: () => getProfileMock,
    toast: { success: toastSuccess },
  }
})

vi.mock('@datagouv/components-next/chart', () => ({
  ChartViewerWrapper: defineComponent({
    name: 'ChartViewerWrapper',
    setup(_, { expose }) {
      expose({ capture: () => undefined })
      return () => h('div', { class: 'chart-viewer-stub' })
    },
  }),
}))

vi.mock('~/components/ProducerSelect.vue', () => ({
  default: defineComponent({
    name: 'ProducerSelect',
    props: { modelValue: { type: Object, default: null } },
    emits: ['update:modelValue'],
    setup: () => () => h('div', { class: 'producer-select-stub' }),
  }),
}))

vi.mock('~/components/Accordion/Accordion.global.vue', () => ({
  default: defineComponent({
    name: 'AccordionStub',
    setup(_, { slots }) {
      return () => h('div', { class: 'accordion-stub' }, slots.default?.())
    },
  }),
}))

vi.mock('~/components/Accordion/AccordionGroup.global.vue', () => ({
  default: defineComponent({
    name: 'AccordionGroupStub',
    setup(_, { slots }) {
      return () => h('div', { class: 'accordion-group-stub' }, slots.default?.())
    },
  }),
}))

const RESOURCE_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

const profileResponse = {
  profile: {
    header: ['year', 'rate', 'label'],
    columns: {
      year: { score: 1, format: 'int', python_type: 'int' },
      rate: { score: 1, format: 'float', python_type: 'float' },
      label: { score: 1, format: 'string', python_type: 'string' },
    },
    formats: {},
    profile: {
      year: { tops: [], nb_distinct: 6, nb_missing_values: 0, min: '2018', max: '2023' },
      rate: { tops: [], nb_distinct: 10, nb_missing_values: 0, min: 0, max: 49.5 },
      label: { tops: [], nb_distinct: 3, nb_missing_values: 0 },
    },
    encoding: 'utf-8',
    separator: ',',
    categorical: ['label'],
    total_lines: 100,
    nb_duplicates: 0,
    columns_fields: {},
    columns_labels: {},
    header_row_idx: 0,
    heading_columns: 0,
    trailing_columns: 0,
  },
}

function newForm(overrides: Partial<ChartForm> = {}): ChartForm {
  return {
    owned: { organization: 'org-1', owner: null },
    title: 'Mon graphique',
    description: '',
    private: false,
    query: '',
    resource_id: '',
    y_axis: { label: '', min: null, max: null, unit: '', unit_position: 'suffix' },
    extras: {},
    ...overrides,
  }
}

const initialChart = {
  id: 'chart-1',
  title: 'Mon graphique',
  description: 'Description du graphique',
  private: false,
  organization: { id: 'org-1', name: 'Organisation' },
  owner: null,
  query: 'SELECT year, rate FROM data',
  resource_id: RESOURCE_ID,
  y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
  extras: {},
} as unknown as Chart

function mountConfigurator(form: ChartForm, initialChart?: Chart) {
  const Harness = defineComponent({
    setup() {
      const model = ref(form)
      return () => h(Suspense, null, {
        default: () => h(ChartConfigurator, {
          'modelValue': model.value,
          'onUpdate:modelValue': (value: ChartForm) => {
            model.value = value
          },
          ...(initialChart ? { initialChart } : {}),
        }),
      })
    },
  })
  return mount(Harness, {
    global: {
      mocks: { $t: (key: string) => key },
      provide: {
        [configKey as symbol]: {
          tabularApiUrl: 'https://tabular.example',
          searchDebounce: 0,
        },
      },
      stubs: {
        ClientOnly: {
          template: '<div><slot /></div>',
        },
      },
    },
  })
}

async function mountWithInitialChart(form: ChartForm) {
  chartsApiMock.mockImplementation((url: string) => {
    if (url === `/api/2/datasets/resources/${RESOURCE_ID}/`) {
      return Promise.resolve({ resource: { id: RESOURCE_ID, title: 'data.csv' }, dataset_id: 'dataset-1' })
    }
    if (url === '/api/2/datasets/dataset-1/') {
      return Promise.resolve({ id: 'dataset-1', title: 'Mon jeu de données' })
    }
    if (url === '/api/2/datasets/dataset-1/resources/') {
      return Promise.resolve({ data: [], total: 0, page: 1, page_size: 10, next_page: null })
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`))
  })
  getProfileMock.mockResolvedValue(profileResponse)

  const wrapper = mountConfigurator(form, initialChart)
  await flushPromises()
  return wrapper
}

describe('initial ChartForm literal (as in pages/admin/beta/chart.vue)', () => {
  it('converts to the exact reduced backend contract', () => {
    const api = toChartApi(newForm())

    expect(Object.keys(api).sort()).toEqual([
      'description',
      'extras',
      'organization',
      'owner',
      'private',
      'query',
      'resource_id',
      'title',
      'y_axis',
    ])
    expect(api).not.toHaveProperty('x_axis')
    expect(api).not.toHaveProperty('series')
    expect(api).not.toHaveProperty('chart_type')
    expect(api).not.toHaveProperty('filter')
    expect(api.query).toBe('')
    expect(api.resource_id).toBe('')
    expect(api.y_axis).toEqual({ label: null, min: null, max: null, unit: null, unit_position: 'suffix' })
  })
})

describe('ChartConfigurator', () => {
  beforeEach(() => {
    vi.stubGlobal('useNuxtApp', () => ({ $api: apiMock, $fileApi: fileApiMock }))
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { chartsApiBase: 'https://charts-api.example' } }))
    vi.stubGlobal('$fetch', { create: () => chartsApiMock })
    vi.stubGlobal('nextTick', nextTick)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('renders a SQL query textarea and no declarative chart controls', async () => {
    const form = newForm({ query: 'SELECT year, rate FROM data' })
    const wrapper = await mountWithInitialChart(form)

    const textarea = wrapper.find('textarea[aria-label="Requête SQL"]')
    expect(textarea.exists()).toBe(true)
    expect((textarea.element as HTMLTextAreaElement).value).toBe('SELECT year, rate FROM data')

    expect(wrapper.text()).not.toContain('Filtres')
    expect(wrapper.text()).not.toContain('Type de graphique')
    expect(wrapper.find('#chart-type').exists()).toBe(false)
    expect(wrapper.find('#x-axis-column').exists()).toBe(false)
    expect(wrapper.find('#resource-select').exists()).toBe(true)
  })

  it('edits the form query through the SQL textarea', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    const textarea = wrapper.find('textarea[aria-label="Requête SQL"]')
    await textarea.setValue('SELECT year, COUNT(*) AS nb FROM data GROUP BY year')

    expect(form.query).toBe('SELECT year, COUNT(*) AS nb FROM data GROUP BY year')
  })

  it('displays the selected resource schema columns alongside the query', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    expect(getProfileMock).toHaveBeenCalledWith(RESOURCE_ID)
    expect(wrapper.text()).toContain('Schéma de la ressource')
    const schema = wrapper.find('ul')
    expect(schema.exists()).toBe(true)
    const items = schema.findAll('li').map(li => li.text())
    expect(items.join(' ')).toContain('year')
    expect(items.join(' ')).toContain('rate')
    expect(items.join(' ')).toContain('label')
  })

  it('keeps the y-axis style fields', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    expect(wrapper.find('#y-axis-label').exists()).toBe(true)
    expect(wrapper.find('#y-axis-min').exists()).toBe(true)
    expect(wrapper.find('#y-axis-max').exists()).toBe(true)
    expect(wrapper.find('#y-axis-unit').exists()).toBe(true)
  })

  it('saves the reduced contract without x_axis/series/chart_type/filter', async () => {
    const form = newForm({ query: 'SELECT year, rate FROM data', resource_id: RESOURCE_ID })
    const wrapper = await mountWithInitialChart(form)

    await wrapper.find('form#chart-form').trigger('submit.prevent')
    await flushPromises()

    expect(apiMock).toHaveBeenCalledOnce()
    const [url, options] = apiMock.mock.calls[0] as Array<unknown> as [string, { method: string, body: string }]
    expect(url).toBe('/api/1/visualizations/chart-1/')
    expect(options.method).toBe('PATCH')

    const body = JSON.parse(options.body)
    expect(Object.keys(body).sort()).toEqual([
      'description',
      'extras',
      'organization',
      'owner',
      'private',
      'query',
      'resource_id',
      'title',
      'y_axis',
    ])
    expect(body).not.toHaveProperty('x_axis')
    expect(body).not.toHaveProperty('series')
    expect(body).not.toHaveProperty('chart_type')
    expect(body).not.toHaveProperty('filter')
    expect(body.query).toBe('SELECT year, rate FROM data')
    expect(body.resource_id).toBe(RESOURCE_ID)
    expect(body.y_axis).toEqual({ label: null, min: null, max: null, unit: null, unit_position: 'suffix' })

    // The ChartViewerWrapper stub exposes no capture(): no PNG snapshot upload.
    expect(fileApiMock).not.toHaveBeenCalled()
    expect(toastSuccess).toHaveBeenCalledOnce()
  })
})
