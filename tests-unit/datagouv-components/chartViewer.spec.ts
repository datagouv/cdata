// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ChartViewer from '~/datagouv-components/src/components/Chart/ChartViewer.vue'
import type { ChartForApi, ColumnsDefinition, DataSeriesType } from '~/datagouv-components/src/types/visualizations'

const setOptionMock = vi.hoisted(() => vi.fn())

// Never touch a real canvas under happy-dom: capture the option instead.
vi.mock('echarts', () => ({
  init: () => ({
    setOption: setOptionMock,
    dispose: vi.fn(),
    resize: vi.fn(),
    getDataURL: vi.fn(),
  }),
}))

const RESOURCE_ID = '847057e0-4c03-4099-85aa-9796fb6003bf'

const COLUMNS: ColumnsDefinition = {
  [RESOURCE_ID]: [
    { name: 'year', type: 'number' },
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

type SerieSpec = { column_y: string, type: DataSeriesType }
type XAxisOverrides = Partial<ChartForApi['x_axis']>

function chartConfig(series: Array<SerieSpec>, xAxis: XAxisOverrides = {}): ChartForApi {
  return {
    x_axis: { column_x: 'year', sort_x_by: null, sort_x_direction: null, type: 'discrete', limit: null, ...xAxis },
    y_axis: { label: null, min: null, max: null, unit: null, unit_position: null },
    series: series.map(s => ({
      ...s,
      resource_id: RESOURCE_ID,
      aggregate_y: null,
      column_x_name_override: null,
      filters: null,
    })),
  } as unknown as ChartForApi
}

async function capture(
  series: Array<SerieSpec>,
  xAxis: XAxisOverrides = {},
  data: Record<string, Array<Record<string, unknown>>> = DATA,
  columns: ColumnsDefinition = COLUMNS,
) {
  const wrapper = mount(ChartViewer, {
    props: { chart: chartConfig(series, xAxis), series: { data, columns } },
  })
  await flushPromises()
  expect(setOptionMock).toHaveBeenCalled()
  const option = setOptionMock.mock.calls.at(-1)![0]
  wrapper.unmount()
  return option
}

function manyRows(n: number) {
  return { [RESOURCE_ID]: Array.from({ length: n }, (_, i) => ({ year: 2000 + i, nb: (i * 7) % 11, rate: i })) }
}

describe('ChartViewer limit', () => {
  beforeEach(() => setOptionMock.mockClear())

  it('applies the limit after the sort', async () => {
    const data = { [RESOURCE_ID]: [
      { year: 2020, nb: 3 }, { year: 2021, nb: 9 }, { year: 2022, nb: 1 }, { year: 2023, nb: 7 }, { year: 2024, nb: 5 },
    ] }
    const option = await capture([{ column_y: 'nb', type: 'histogram' }], { sort_x_by: 'axis_y', sort_x_direction: 'desc', limit: 3 }, data)

    expect(option.dataset[0].source.map((r: { nb: number }) => r.nb)).toEqual([9, 7, 5])
  })

  it('keeps every value when the limit exceeds the groups', async () => {
    const option = await capture([{ column_y: 'nb', type: 'histogram' }], { limit: 10 })

    expect(option.dataset[0].source).toHaveLength(2)
  })

  it('keeps every value when the limit is null', async () => {
    const option = await capture([{ column_y: 'nb', type: 'histogram' }], { limit: null }, manyRows(30))

    expect(option.dataset[0].source).toHaveLength(30)
  })

  it('aligns every series on the first series X values when sorting by Y', async () => {
    const data = { [RESOURCE_ID]: [
      { year: 2020, nb: 3, rate: 50 }, { year: 2021, nb: 9, rate: 10 }, { year: 2022, nb: 1, rate: 40 }, { year: 2023, nb: 7, rate: 20 },
    ] }
    const option = await capture(
      [{ column_y: 'nb', type: 'histogram' }, { column_y: 'rate', type: 'histogram' }],
      { sort_x_by: 'axis_y', sort_x_direction: 'desc', limit: 2 },
      data,
    )

    expect(option.dataset.map((d: { source: Array<{ year: number }> }) => d.source.map(r => r.year))).toEqual([[2021, 2023], [2021, 2023]])
  })

  it('keeps the earliest dates when limiting a date axis with the default sort', async () => {
    const data = { [RESOURCE_ID]: [
      { year: '2022-01-01', nb: 1 }, { year: '2020-01-01', nb: 2 }, { year: '2021-01-01', nb: 3 }, { year: '2019-01-01', nb: 4 },
    ] }
    const columns: ColumnsDefinition = { [RESOURCE_ID]: [{ name: 'year', type: 'date' }, { name: 'nb', type: 'number' }] }
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous', limit: 2 }, data, columns)

    expect(option.dataset[0].source.map((r: { year: Date }) => r.year.getUTCFullYear())).toEqual([2019, 2020])
  })

  it('cuts every series on the same X values', async () => {
    const option = await capture(
      [{ column_y: 'nb', type: 'histogram' }, { column_y: 'rate', type: 'histogram' }],
      { sort_x_by: 'axis_x', sort_x_direction: 'asc', limit: 2 },
      manyRows(5),
    )

    expect(option.dataset.map((d: { source: Array<{ year: number }> }) => d.source.map(r => r.year))).toEqual([[2000, 2001], [2000, 2001]])
  })
})

describe('ChartViewer rendering', () => {
  beforeEach(() => setOptionMock.mockClear())

  it('hides the legend for a single-series chart', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }])

    expect(option.legend.show).toBe(false)
    expect(option.grid.bottom).toBe(60)
  })

  it('shows the legend for a multi-series chart and leaves room for it', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'rate', type: 'line' }])

    expect(option.legend.show).toBe(true)
    expect(option.grid.bottom).toBe(80)
    expect(option.series.map((s: { name: string }) => s.name)).toEqual(['nb', 'rate'])
  })

  it('gives the chart one color per series', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'rate', type: 'line' }])

    expect(option.color.length).toBeGreaterThanOrEqual(2)
    expect(new Set(option.color).size).toBe(option.color.length)
  })

  it('centers the x axis name under the axis and clears the labels with a gap', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }])

    expect(option.xAxis.name).toBe('year')
    expect(option.xAxis.nameLocation).toBe('middle')
    expect(option.xAxis.nameGap).toBe(30)
  })

  it('formats the tooltip with the X value once, then one line per series', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'rate', type: 'line' }])

    const html = option.tooltip.formatter([
      { value: { year: 2021, nb: 5, rate: 2.5 }, axisValueLabel: '2021', seriesName: 'nb' },
      { value: { year: 2021, nb: 5, rate: 2.5 }, axisValueLabel: '2021', seriesName: 'rate' },
    ]) as string

    expect(html).toBe(`<strong>2021</strong><br>nb: <strong>${(5).toLocaleString()}</strong><br>rate: <strong>${(2.5).toLocaleString()}</strong><br>`)
  })

  it('returns an empty tooltip when the formatter receives no series', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }])

    expect(option.tooltip.formatter([])).toBe('')
  })

  it('auto-skips overlapping labels on a category x axis', async () => {
    const option = await capture([{ column_y: 'nb', type: 'histogram' }])

    expect(option.xAxis.type).toBe('category')
    expect(option.xAxis.axisLabel).toMatchObject({ interval: 'auto', hideOverlap: true })
  })

  it('keeps the date formatter and hides overlaps on a time x axis', async () => {
    const data = { [RESOURCE_ID]: [{ year: '2020-01-01', nb: 3 }, { year: '2021-01-01', nb: 5 }] }
    const columns: ColumnsDefinition = { [RESOURCE_ID]: [{ name: 'year', type: 'date' }, { name: 'nb', type: 'number' }] }
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' }, data, columns)

    expect(option.xAxis.type).toBe('time')
    expect(option.xAxis.axisLabel.hideOverlap).toBe(true)
    expect(typeof option.xAxis.axisLabel.formatter).toBe('function')
  })

  it('hides overlapping labels on the value y axis', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }])

    expect(option.yAxis.axisLabel.hideOverlap).toBe(true)
  })

  it('smooths lines and keeps at most 12 markers, offset per series', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'rate', type: 'line' }], {}, manyRows(48))
    const [a, b] = option.series

    expect(a.smooth).toBe(true)
    expect(a.showAllSymbol).toBe(true)
    const shown = (s: { symbolSize: (v: unknown, p: { dataIndex: number }) => number }) =>
      Array.from({ length: 48 }, (_, i) => s.symbolSize(null, { dataIndex: i })).map((v, i) => v > 0 ? i : -1).filter(i => i >= 0)
    expect(shown(a)).toHaveLength(12)
    expect(shown(b)).toHaveLength(12)
    expect(shown(a)).not.toEqual(shown(b))
  })

  it('does not smooth bars', async () => {
    const option = await capture([{ column_y: 'nb', type: 'histogram' }])

    expect(option.series[0].type).toBe('bar')
    expect(option.series[0].smooth).toBeUndefined()
  })
})
