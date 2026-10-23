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
  const { defineComponent, h } = await import('vue')
  const original = await importOriginal<typeof import('@datagouv/components-next')>()
  return {
    ...original,
    useGetProfile: () => getProfileMock,
    toast: { success: toastSuccess },
    SearchableSelect: defineComponent({
      name: 'SearchableSelect',
      props: { modelValue: { type: Object, default: null } },
      emits: ['update:modelValue'],
      setup(_, { emit }) {
        return () => h('button', {
          class: 'switch-dataset',
          onClick: () => emit('update:modelValue', { id: 'dataset-2', title: 'Autre jeu de données' }),
        }, 'switch-dataset')
      },
    }),
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

vi.mock('~/components/Assistant/ChatPanel.vue', () => ({
  default: defineComponent({
    name: 'ChatPanel',
    props: { resourceId: { type: String, default: null } },
    emits: ['use-query'],
    setup(props, { emit }) {
      return () => h('div', { class: 'chat-panel-stub' }, [
        h('span', { class: 'chat-panel-resource' }, props.resourceId || 'none'),
        h('button', { class: 'chat-panel-use-query', onClick: () => emit('use-query', 'SELECT stub') }, 'use-query'),
      ])
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
const RESOURCE_B_ID = '9b2e5f4a-3c1d-4e6f-8a7b-1c2d3e4f5a6b'

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

const profileBResponse = {
  profile: {
    header: ['epci', 'nb'],
    columns: {
      epci: { score: 1, format: 'string', python_type: 'string' },
      nb: { score: 1, format: 'int', python_type: 'int' },
    },
    formats: {},
    profile: {
      epci: { tops: [], nb_distinct: 5, nb_missing_values: 0 },
      nb: { tops: [], nb_distinct: 5, nb_missing_values: 0, min: 1, max: 9 },
    },
    encoding: 'utf-8',
    separator: ',',
    categorical: ['epci'],
    total_lines: 50,
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
    if (url === `/api/2/datasets/resources/${RESOURCE_B_ID}/`) {
      return Promise.resolve({ resource: { id: RESOURCE_B_ID, title: 'other.csv' }, dataset_id: 'dataset-1' })
    }
    if (url === '/api/2/datasets/dataset-1/') {
      return Promise.resolve({ id: 'dataset-1', title: 'Mon jeu de données' })
    }
    if (url === '/api/2/datasets/dataset-1/resources/') {
      return Promise.resolve({
        data: [
          { id: RESOURCE_ID, title: 'data.csv', extras: {} },
          { id: RESOURCE_B_ID, title: 'other.csv', filetype: 'file', extras: { 'analysis:parsing:parsing_table': 'other_table' } },
        ],
        total: 2,
        page: 1,
        page_size: 10,
        next_page: null,
      })
    }
    if (url === '/api/2/datasets/dataset-2/') {
      return Promise.resolve({ id: 'dataset-2', title: 'Autre jeu de données' })
    }
    if (url === '/api/2/datasets/dataset-2/resources/') {
      return Promise.resolve({ data: [], total: 0, page: 1, page_size: 10, next_page: null })
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`))
  })
  getProfileMock.mockResolvedValue(profileResponse)

  const wrapper = mountConfigurator(form, initialChart)
  await flushPromises()
  return wrapper
}

async function switchSegment(wrapper: ReturnType<typeof mountConfigurator>, label: string) {
  const button = wrapper.findAll('button[aria-pressed]').find(b => b.text() === label)
  expect(button, `segment "${label}"`).toBeDefined()
  await button!.trigger('click')
  await flushPromises()
}

function saveButton(wrapper: ReturnType<typeof mountConfigurator>) {
  return wrapper.findAll('form#chart-form button').find(b => b.text() === 'Sauvegarder le graphique')
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

  it('shows the form panel by default and hides the assistant', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    const pressed = wrapper.findAll('button[aria-pressed]').find(b => b.attributes('aria-pressed') === 'true')
    expect(pressed?.text()).toBe('Formulaire')
    expect(wrapper.find('textarea[aria-label="Requête SQL"]').exists()).toBe(true)
    expect(wrapper.find('.chat-panel-stub').exists()).toBe(false)
  })

  it('switches to the assistant panel with the current resource and hides the form', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    await switchSegment(wrapper, 'Assistant')

    const panel = wrapper.find('.chat-panel-stub')
    expect(panel.exists()).toBe(true)
    expect(panel.find('.chat-panel-resource').text()).toBe(RESOURCE_ID)
    expect(wrapper.find('textarea[aria-label="Requête SQL"]').exists()).toBe(false)
    expect(wrapper.find('#y-axis-label').exists()).toBe(false)
  })

  it('keeps pickers and the save button visible in both segments', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    for (const segment of ['Formulaire', 'Assistant']) {
      await switchSegment(wrapper, segment)

      expect(wrapper.find('.producer-select-stub').exists()).toBe(true)
      expect(wrapper.find('.switch-dataset').exists()).toBe(true)
      expect(wrapper.find('#resource-select').exists()).toBe(true)
      expect(saveButton(wrapper), `save button in "${segment}"`).toBeDefined()
    }
  })

  it('renders the assistant chat panel with the selected resource', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    await switchSegment(wrapper, 'Assistant')

    const panel = wrapper.find('.chat-panel-stub')
    expect(panel.exists()).toBe(true)
    expect(panel.find('.chat-panel-resource').text()).toBe(RESOURCE_ID)
  })

  it('fills the form query when the chat panel emits use-query', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    await switchSegment(wrapper, 'Assistant')
    await wrapper.find('.chat-panel-use-query').trigger('click')
    await flushPromises()

    expect(form.query).toBe('SELECT stub')

    await switchSegment(wrapper, 'Formulaire')
    const textarea = wrapper.find('textarea[aria-label="Requête SQL"]')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('SELECT stub')
  })

  it('clears the form resource_id when the dataset changes without a new resource', async () => {
    const form = newForm({ resource_id: RESOURCE_ID })
    const wrapper = await mountWithInitialChart(form)
    expect(form.resource_id).toBe(RESOURCE_ID)

    await wrapper.find('.switch-dataset').trigger('click')
    await flushPromises()

    expect(form.resource_id).toBe('')
  })

  it('ignores a stale profile response when the resource changed meanwhile', async () => {
    const form = newForm()
    const wrapper = await mountWithInitialChart(form)

    let resolveSlowProfile: ((value: unknown) => void) | undefined
    getProfileMock.mockImplementation((id: string) => {
      if (id === RESOURCE_B_ID) {
        return new Promise((resolve) => {
          resolveSlowProfile = resolve
        })
      }
      return Promise.resolve(profileResponse)
    })

    // Switch to B and let its watcher start (its profile response stays pending)…
    await wrapper.find('#resource-select').setValue(RESOURCE_B_ID)
    await flushPromises()
    expect(resolveSlowProfile).toBeDefined()

    // …then switch back to A, which resolves fast.
    await wrapper.find('#resource-select').setValue(RESOURCE_ID)
    await flushPromises()

    const items = wrapper.find('ul').findAll('li').map(li => li.text())
    expect(items.join(' ')).toContain('year')

    // B's late response must not clobber A's schema.
    resolveSlowProfile?.(profileBResponse)
    await flushPromises()

    const itemsAfter = wrapper.find('ul').findAll('li').map(li => li.text())
    expect(itemsAfter.join(' ')).toContain('year')
    expect(itemsAfter.join(' ')).not.toContain('epci')
  })
})
