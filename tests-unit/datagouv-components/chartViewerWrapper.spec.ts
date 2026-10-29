// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChartViewerWrapper from '~/datagouv-components/src/components/Chart/ChartViewerWrapper.vue'
import { executeSqlQuery } from '~/datagouv-components/src/functions/tabularApi'
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

function chartFixture(query: string, chart_type: 'line' | 'histogram' = 'line'): Pick<Chart, 'query' | 'resource_id' | 'y_axis' | 'chart_type'> {
  return {
    query,
    resource_id: RESOURCE_ID,
    chart_type,
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

function mountWrapper(chart: Pick<Chart, 'query' | 'resource_id' | 'y_axis' | 'chart_type'>) {
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
    expect(inferChartConfig(result)).toEqual({ xColumn: 'date', seriesColumns: ['votes'] })
  })

  it('infers a line chart when X values are dates', () => {
    const result: SqlQueryResult = {
      columns: ['date', 'a', 'b'],
      rows: [
        ['2024-03-01', 1, 2],
        ['2024-03-02', 3, 4],
      ],
    }
    expect(inferChartConfig(result)).toEqual({ xColumn: 'date', seriesColumns: ['a', 'b'] })
  })

  it('infers a bar chart when X values are short non-date strings', () => {
    const result: SqlQueryResult = {
      columns: ['region', 'nb'],
      rows: [
        ['Bretagne', 10],
        ['Occitanie', 20],
      ],
    }
    expect(inferChartConfig(result)).toEqual({ xColumn: 'region', seriesColumns: ['nb'] })
  })

  it('ignores non-numeric columns as series', () => {
    const result: SqlQueryResult = {
      columns: ['region', 'nom', 'nb'],
      rows: [
        ['Bretagne', 'Rennes', 10],
        ['Occitanie', 'Toulouse', 20],
      ],
    }
    expect(inferChartConfig(result)).toEqual({ xColumn: 'region', seriesColumns: ['nb'] })
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
      .toEqual({ xColumn: 'date', seriesColumns: [] })
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
      query,
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

    const wrapper = mountWrapper(chartFixture('SELECT region, nb FROM votes', 'histogram'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('discrete')
    expect(stub.props('chart').series[0]!.type).toBe('histogram')
    expect(stub.props('series').columns[RESOURCE_ID]![0]).toEqual({ name: 'region', type: 'categorical' })
  })

  it('renders a bar chart even when X values are dates', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['date', 'votes'],
      rows: [
        ['2024-01-01', 10],
        ['2024-01-02', 12],
      ],
    })

    const wrapper = mountWrapper(chartFixture('SELECT date, votes FROM votes', 'histogram'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('continuous')
    expect(stub.props('chart').series[0]!.type).toBe('histogram')
    expect(stub.props('series').columns[RESOURCE_ID]![0]).toEqual({ name: 'date', type: 'date' })
  })

  it('renders a line chart even when X values are categorical', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['region', 'nb'],
      rows: [['Bretagne', 10]],
    })

    const wrapper = mountWrapper(chartFixture('SELECT region, nb FROM votes', 'line'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('discrete')
    expect(stub.props('chart').series[0]!.type).toBe('line')
  })

  it('treats irregular numeric identifiers as categorical X axis', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['dossier_ref', 'total_pour', 'total_contre'],
      rows: [
        [47026, 208, 113],
        [54903, 22, 252],
        [56782, 207, 126],
      ],
    })

    const wrapper = mountWrapper(chartFixture('SELECT dossier_ref, …', 'histogram'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('discrete')
    expect(stub.props('chart').series.length).toBe(2)
  })

  it('keeps regularly spaced numbers (years) as a continuous X axis', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['annee', 'nb'],
      rows: [
        [2019, 10],
        [2020, 12],
        [2021, 11],
        [2022, 14],
      ],
    })

    const wrapper = mountWrapper(chartFixture('SELECT annee, nb FROM votes', 'line'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('continuous')
  })

  it('treats bare year strings as categorical, not as a date axis', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['annee', 'nb'],
      rows: [
        ['2017', 10],
        ['2018', 12],
      ],
    })

    const wrapper = mountWrapper(chartFixture('SELECT annee, nb FROM votes', 'line'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('discrete')
    expect(stub.props('series').columns[RESOURCE_ID]![0]).toEqual({ name: 'annee', type: 'categorical' })
  })

  it('treats invalid ISO-like timestamps as categorical', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['timestamp', 'nb'],
      rows: [['2024-01-01T99:99', 10]],
    })

    const wrapper = mountWrapper(chartFixture('SELECT timestamp, nb FROM votes', 'line'))
    await waitForFetch()

    const stub = wrapper.findComponent(ChartViewerStub)
    expect(stub.props('chart').x_axis.type).toBe('discrete')
    expect(stub.props('series').columns[RESOURCE_ID]![0]).toEqual({ name: 'timestamp', type: 'categorical' })
  })

  it('explains when rows exist but no numeric column can be plotted', async () => {
    executeSqlQueryMock.mockResolvedValue({
      columns: ['region', 'label'],
      rows: [
        ['Bretagne', 'faible'],
        ['Corse', 'fort'],
      ],
    })

    const wrapper = mountWrapper(chartFixture('SELECT region, label FROM votes', 'line'))
    await waitForFetch()

    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(false)
    expect(wrapper.text()).toContain('Aucune colonne numérique à tracer')
    expect(wrapper.text()).toContain('SUM, COUNT, AVG')
  })

  it('renders a French "Aucune donnée" message when the query returns no row', async () => {
    executeSqlQueryMock.mockResolvedValue({ columns: ['date', 'votes'], rows: [] })

    const wrapper = mountWrapper(chartFixture('SELECT date, votes FROM votes'))
    await waitForFetch()

    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(false)
    expect(wrapper.text()).toContain('Aucune donnée')
  })

  it('renders a generic error message without the raw failure detail when the API fails', async () => {
    executeSqlQueryMock.mockRejectedValue(new Error('L\'exécution de la requête a échoué : HTTP 500 https://tabular.example.com/api/resources/847057e0-4c03-4099-85aa-9796fb6003bf/sql'))

    const wrapper = mountWrapper(chartFixture('SELECT date, votes FROM votes'))
    await waitForFetch()

    expect(wrapper.find('.chart-viewer-stub').exists()).toBe(false)
    expect(wrapper.text()).toContain('Une erreur est survenue lors du chargement des données du graphique.')
    expect(wrapper.text()).not.toContain('847057e0-4c03-4099-85aa-9796fb6003bf')
  })
})
