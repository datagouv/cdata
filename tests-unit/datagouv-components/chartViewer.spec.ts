// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChartViewer from '~/datagouv-components/src/components/Chart/ChartViewer.vue'
import type { ChartViewerConfig, ColumnsDefinition } from '~/datagouv-components/src/types/visualizations'

const setOptionMock = vi.hoisted(() => vi.fn())
const disposeMock = vi.hoisted(() => vi.fn())
const resizeMock = vi.hoisted(() => vi.fn())
const getDataURLMock = vi.hoisted(() => vi.fn())

// Never touch a real canvas under happy-dom: capture the option instead.
vi.mock('echarts', () => ({
  init: () => ({
    setOption: setOptionMock,
    dispose: disposeMock,
    resize: resizeMock,
    getDataURL: getDataURLMock,
  }),
}))

const RESOURCE_ID = '847057e0-4c03-4099-85aa-9796fb6003bf'

const COLUMNS: ColumnsDefinition = {
  [RESOURCE_ID]: [
    { name: 'year', type: 'year' },
    { name: 'nb', type: 'number' },
    { name: 'rate', type: 'number' },
  ],
}

const DATA: Record<string, Array<Record<string, unknown>>> = {
  [RESOURCE_ID]: [
    { year: 2020, nb: 3, rate: 1.5 },
    { year: 2021, nb: 5, rate: 2.5 },
  ],
}

function chartConfig(series: Array<{ column_y: string, type: 'line' | 'histogram' }>, xAxisType: 'discrete' | 'continuous' = 'discrete'): ChartViewerConfig {
  return {
    x_axis: { column_x: 'year', sort_x_by: null, sort_x_direction: null, type: xAxisType },
    y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
    series: series.map(s => ({
      ...s,
      resource_id: RESOURCE_ID,
      aggregate_y: null,
      column_x_name_override: null,
    })),
  }
}

async function mountAndCaptureOption(series: Array<{ column_y: string, type: 'line' | 'histogram' }>) {
  const wrapper = mount(ChartViewer, {
    props: { chart: chartConfig(series), series: { data: DATA, columns: COLUMNS } },
  })
  await flushPromises()
  expect(setOptionMock).toHaveBeenCalled()
  const option = setOptionMock.mock.calls.at(-1)![0]
  wrapper.unmount()
  return option
}

describe('ChartViewer', () => {
  beforeEach(() => {
    setOptionMock.mockClear()
  })

  it('hides the legend for a single-series chart', async () => {
    const option = await mountAndCaptureOption([{ column_y: 'nb', type: 'line' }])

    expect(option.legend.show).toBe(false)
    expect(option.grid.bottom).toBe(40)
  })

  it('shows the legend for a multi-series chart and leaves room for it', async () => {
    const option = await mountAndCaptureOption([
      { column_y: 'nb', type: 'line' },
      { column_y: 'rate', type: 'line' },
    ])

    expect(option.legend.show).toBe(true)
    expect(option.grid.bottom).toBe(60)
    expect(option.series.map((s: { name: string }) => s.name)).toEqual(['nb', 'rate'])
  })

  it('formats the tooltip with the X value once, then one line per series', async () => {
    const option = await mountAndCaptureOption([
      { column_y: 'nb', type: 'line' },
      { column_y: 'rate', type: 'line' },
    ])

    const html = option.tooltip.formatter([
      { value: { year: 2021, nb: 5, rate: 2.5 }, axisValueLabel: '2021', seriesName: 'nb' },
      { value: { year: 2021, nb: 5, rate: 2.5 }, axisValueLabel: '2021', seriesName: 'rate' },
    ]) as string

    // The X value appears once in bold; each series gets one name: value line.
    expect(html).toBe(`<strong>2021</strong><br>nb: <strong>${(5).toLocaleString()}</strong><br>rate: <strong>${(2.5).toLocaleString()}</strong><br>`)
  })

  it('returns an empty tooltip when the formatter receives no series', async () => {
    const option = await mountAndCaptureOption([{ column_y: 'nb', type: 'line' }])

    expect(option.tooltip.formatter([])).toBe('')
  })

  it('auto-skips overlapping labels on a category x axis', async () => {
    const option = await mountAndCaptureOption([{ column_y: 'nb', type: 'histogram' }])

    expect(option.xAxis.type).toBe('category')
    expect(option.xAxis.axisLabel).toMatchObject({ interval: 'auto', hideOverlap: true })
  })

  it('keeps the date formatter and hides overlaps on a time x axis', async () => {
    const data: Record<string, Array<Record<string, unknown>>> = {
      [RESOURCE_ID]: [
        { year: '2020-01-01', nb: 3 },
        { year: '2021-01-01', nb: 5 },
      ],
    }
    const columns: ColumnsDefinition = {
      [RESOURCE_ID]: [
        { name: 'year', type: 'date' },
        { name: 'nb', type: 'number' },
      ],
    }
    const wrapper = mount(ChartViewer, {
      props: { chart: chartConfig([{ column_y: 'nb', type: 'line' }], 'continuous'), series: { data, columns } },
    })
    await flushPromises()
    const option = setOptionMock.mock.calls.at(-1)![0]
    wrapper.unmount()

    expect(option.xAxis.type).toBe('time')
    expect(option.xAxis.axisLabel.hideOverlap).toBe(true)
    expect(typeof option.xAxis.axisLabel.formatter).toBe('function')
  })

  it('hides overlapping labels on the value y axis', async () => {
    const option = await mountAndCaptureOption([{ column_y: 'nb', type: 'line' }])

    expect(option.yAxis.axisLabel.hideOverlap).toBe(true)
  })
})
