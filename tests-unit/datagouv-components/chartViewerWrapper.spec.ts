// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChartViewerWrapper from '~/datagouv-components/src/components/Chart/ChartViewerWrapper.vue'
import { ensureRowLimit, executeSqlQuery } from '~/datagouv-components/src/functions/tabularApi'
import type { SqlQueryResult } from '~/datagouv-components/src/functions/tabularApi'
import { inferChartConfig } from '~/datagouv-components/src/functions/charts'
import { configKey } from '~/datagouv-components/src/config'
import type { Chart } from '~/datagouv-components/src/types/visualizations'

vi.mock('~/datagouv-components/src/functions/tabularApi', async (importOriginal) => {
  const original = await importOriginal<typeof import('~/datagouv-components/src/functions/tabularApi')>()
  return { ...original, executeSqlQuery: vi.fn() }
})

const executeSqlQueryMock = vi.mocked(executeSqlQuery)

const TABULAR_API_URL = 'https://tabular.example.com'
const RESOURCE_ID = '847057e0-4c03-4099-85aa-9796fb6003bf'

function chartFixture(query: string): Pick<Chart, 'query' | 'resource_id' | 'y_axis'> {
  return {
    query,
    resource_id: RESOURCE_ID,
    y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
  }
}

const ChartViewerStub = defineComponent({
  name: 'ChartViewer',
  props: {
    chart: { type: Object, required: true },
    series: { type: Object, required: true },
  },
  setup() {
    return () => h('div', { class: 'chart-viewer-stub' })
  },
})

function mountWrapper(chart: Pick<Chart, 'query' | 'resource_id' | 'y_axis'>) {
  return mount(ChartViewerWrapper, {
    props: { chart },
    global: {
      stubs: { ChartViewer: ChartViewerStub },
      provide: {
        [configKey as symbol]: {
          tabularApiUrl: TABULAR_API_URL,
          searchDebounce: 0,
        },
      },
    },
  })
}

async function waitForFetch() {
  await vi.waitFor(() => expect(executeSqlQueryMock).toHaveBeenCalledOnce())
  await flushPromises()
}

describe('inferChartConfig', () => {
  it('uses the first column as X and following numeric columns as series', () => {
    const result: SqlQueryResult = {
      columns: ['date', 'votes'],
      rows: [
        ['2024-01-01', 10],
        ['2024-01-02', 12],
      ],
    }
    expect(inferChartConfig(result)).toEqual({ xColumn: 'date', seriesColumns: ['votes'], chartKind: 'line' })
  })

  it('infers a line chart when X values are dates', () => {
    const result: SqlQueryResult = {
      columns: ['date', 'a', 'b'],
      rows: [
        ['2024-03-01', 1, 2],
        ['2024-03-02', 3, 4],
      ],
    }
    expect(inferChartConfig(result)).toEqual({ xColumn: 'date', seriesColumns: ['a', 'b'], chartKind: 'line' })
  })

  it('infers a bar chart when X values are short non-date strings', () => {
    const result: SqlQueryResult = {
      columns: ['region', 'nb'],
      rows: [
        ['Bretagne', 10],
        ['Occitanie', 20],
      ],
    }
    expect(inferChartConfig(result)).toEqual({ xColumn: 'region', seriesColumns: ['nb'], chartKind: 'bar' })
  })

  it('ignores non-numeric columns as series', () => {
    const result: SqlQueryResult = {
      columns: ['region', 'nom', 'nb'],
      rows: [
        ['Bretagne', 'Rennes', 10],
        ['Occitanie', 'Toulouse', 20],
      ],
    }
    expect(inferChartConfig(result)).toEqual({ xColumn: 'region', seriesColumns: ['nb'], chartKind: 'bar' })
  })

  it('tolerates null values inside a numeric series column', () => {
    const result: SqlQueryResult = {
      columns: ['date', 'nb'],
      rows: [
        ['2024-01-01', null],
        ['2024-01-02', 12],
      ],
    }
    expect(inferChartConfig(result).seriesColumns).toEqual(['nb'])
  })

  it('returns an empty config for an empty result', () => {
    expect(inferChartConfig({ columns: ['date', 'nb'], rows: [] }))
      .toEqual({ xColumn: 'date', seriesColumns: [], chartKind: 'line' })
  })
})

describe('ChartViewerWrapper', () => {
  beforeEach(() => {
    executeSqlQueryMock.mockReset()
  })

  afterEach(() => {
    executeSqlQueryMock.mockReset()
  })

  it('executes the limited SQL query and renders ChartViewer with the inferred config', async () => {
    const result: SqlQueryResult = {
      columns: ['date', 'votes'],
      rows: [
        ['2024-01-01', 10],
        ['2024-01-02', 12],
      ],
    }
    executeSqlQueryMock.mockResolvedValue(result)

    const query = 'SELECT date, votes FROM votes'
    const wrapper = mountWrapper(chartFixture(query))
    await waitForFetch()

    expect(executeSqlQueryMock).toHaveBeenCalledWith(
      TABULAR_API_URL,
      RESOURCE_ID,
      ensureRowLimit(query),
    )

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.exists()).toBe(true)
    expect(stub.props('chart')).toEqual({
      x_axis: {
        column_x: 'date',
        sort_x_by: null,
        sort_x_direction: null,
        type: 'continuous',
      },
      y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
      series: [{
        type: 'line',
        column_y: 'votes',
        aggregate_y: null,
        resource_id: RESOURCE_ID,
        column_x_name_override: null,
      }],
    })
    expect(stub.props('series')).toEqual({
      data: {
        [RESOURCE_ID]: [
          { date: '2024-01-01', votes: 10 },
          { date: '2024-01-02', votes: 12 },
        ],
      },
      columns: {
        [RESOURCE_ID]: [
          { name: 'date', type: 'date' },
          { name: 'votes', type: 'number' },
        ],
      },
    })
  })

  it('renders a bar chart with categorical X for short string values', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['region', 'nb'],
      rows: [['Bretagne', 10]],
    })

    const wrapper = mountWrapper(chartFixture('SELECT region, nb FROM votes'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('discrete')
    expect(stub.props('chart').series[0]!.type).toBe('histogram')
    expect(stub.props('series').columns[RESOURCE_ID]![0]).toEqual({ name: 'region', type: 'categorical' })
  })

  it('renders a French "Aucune donnée" message when the query returns no row', async () => {
    executeSqlQueryMock.mockResolvedValue({ columns: ['date', 'votes'], rows: [] })

    const wrapper = mountWrapper(chartFixture('SELECT date, votes FROM votes'))
    await waitForFetch()

    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(false)
    expect(wrapper.text()).toContain('Aucune donnée')
  })

  it('renders a French error message without throwing when the API fails', async () => {
    executeSqlQueryMock.mockRejectedValue(new Error('L\'exécution de la requête a échoué : HTTP 500'))

    const wrapper = mountWrapper(chartFixture('SELECT date, votes FROM votes'))
    await waitForFetch()

    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(false)
    expect(wrapper.text()).toContain('L\'exécution de la requête a échoué')
  })
})
