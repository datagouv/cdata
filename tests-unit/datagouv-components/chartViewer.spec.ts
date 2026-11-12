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

// The viewer reads the data of each series by its index: give every series the
// rows of the shared resource.
function perSeries(count: number, data: Record<string, Array<Record<string, unknown>>>) {
  return Object.fromEntries(Array.from({ length: count }, (_, i) => [String(i), data[RESOURCE_ID]!]))
}

async function mountViewer(
  series: Array<SerieSpec>,
  xAxis: XAxisOverrides = {},
  data: Record<string, Array<Record<string, unknown>>> = DATA,
  columns: ColumnsDefinition = COLUMNS,
  filtered = false,
) {
  const chart = chartConfig(series, xAxis)
  if (filtered) chart.series.forEach(serie => serie.filters = { _cls: 'Filter', column: 'nb', condition: 'greater', value: '0' })
  const wrapper = mount(ChartViewer, {
    props: { chart, series: { data: perSeries(series.length, data), columns } },
  })
  await flushPromises()
  expect(setOptionMock).toHaveBeenCalled()
  return { wrapper, option: setOptionMock.mock.calls.at(-1)![0] }
}

async function capture(...args: Parameters<typeof mountViewer>) {
  const { wrapper, option } = await mountViewer(...args)
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

  it('sorts a count series by its counts', async () => {
    // tabular-api names a count of the X column `<x>__count`.
    const data = { [RESOURCE_ID]: [
      { year: 2020, year__count: 2 }, { year: 2021, year__count: 8 }, { year: 2022, year__count: 5 },
    ] }
    const chart = chartConfig([{ column_y: 'year', type: 'histogram' }], { sort_x_by: 'axis_y', sort_x_direction: 'desc', limit: 2 })
    chart.series[0]!.aggregate_y = 'count'
    const wrapper = mount(ChartViewer, { props: { chart, series: { data: perSeries(1, data), columns: COLUMNS } } })
    await flushPromises()
    const option = setOptionMock.mock.calls.at(-1)![0]
    wrapper.unmount()

    expect(option.dataset[0].source.map((r: { year: number }) => r.year)).toEqual([2021, 2022])
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

  it('names aggregated series with the calculation and the column', async () => {
    const chart = chartConfig([{ column_y: 'nb', type: 'line' }, { column_y: 'nb', type: 'line' }, { column_y: 'year', type: 'line' }])
    chart.series[0]!.aggregate_y = 'sum'
    chart.series[1]!.aggregate_y = 'avg'
    chart.series[2]!.aggregate_y = 'count'
    const data = { 0: [{ year: 2020, nb__sum: 3 }], 1: [{ year: 2020, nb__avg: 1.5 }], 2: [{ year: 2020, year__count: 2 }] }
    const wrapper = mount(ChartViewer, { props: { chart, series: { data, columns: COLUMNS } } })
    await flushPromises()
    const option = setOptionMock.mock.calls.at(-1)![0]
    wrapper.unmount()

    expect(option.series.map((s: { name: string }) => s.name)).toEqual(['Somme de nb', 'Moyenne de nb', 'Nombre de lignes'])
  })

  it('keeps two series with the same label apart in the legend', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'nb', type: 'histogram' }])

    expect(option.series.map((s: { name: string }) => s.name)).toEqual(['nb', 'nb (2)'])
  })

  it('shows the series label and the value of its Y column in the tooltip', async () => {
    const chart = chartConfig([{ column_y: 'nb', type: 'line' }, { column_y: 'nb', type: 'line' }])
    chart.series[0]!.aggregate_y = 'sum'
    chart.series[1]!.aggregate_y = 'max'
    const data = { 0: [{ year: 2020, nb__sum: 3 }], 1: [{ year: 2020, nb__max: 2 }] }
    const wrapper = mount(ChartViewer, { props: { chart, series: { data, columns: COLUMNS } } })
    await flushPromises()
    const option = setOptionMock.mock.calls.at(-1)![0]
    wrapper.unmount()

    const html = option.tooltip.formatter([
      { value: { year: 2020, nb__sum: 3 }, axisValueLabel: '2020', seriesName: 'Somme de nb', seriesIndex: 0 },
      { value: { year: 2020, nb__max: 2 }, axisValueLabel: '2020', seriesName: 'Maximum de nb', seriesIndex: 1 },
    ]) as string

    expect(html).toBe('<strong>2020</strong><br>Somme de nb: <strong>3</strong><br>Maximum de nb: <strong>2</strong><br>')
  })

  it('gives the chart one color per series', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'rate', type: 'line' }])

    expect(option.color.length).toBeGreaterThanOrEqual(2)
    expect(new Set(option.color).size).toBe(option.color.length)
  })

  // RGAA 3.3: a series color reaches 3:1 against the white background
  it('only uses series colors that reach a 3:1 contrast on white', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }])
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
    }
    for (const color of option.color as Array<string>) {
      expect(1.05 / (luminance(color) + 0.05), color).toBeGreaterThanOrEqual(3)
    }
  })

  // RGAA 3.1: the color is not the only cue that tells the series apart
  it('gives each line series its own marker symbol and each bar series its own pattern', async () => {
    const lines = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'rate', type: 'line' }, { column_y: 'nb', type: 'line' }])
    expect(new Set(lines.series.map((serie: { symbol: string }) => serie.symbol)).size).toBe(3)
    expect(new Set(lines.series.map((serie: { lineStyle: { type: string } }) => serie.lineStyle.type)).size).toBe(3)

    const bars = await capture([{ column_y: 'nb', type: 'histogram' }, { column_y: 'rate', type: 'histogram' }, { column_y: 'nb', type: 'histogram' }])
    const decals = bars.series.map((serie: { itemStyle?: { decal?: unknown } }) => JSON.stringify(serie.itemStyle?.decal ?? null))
    expect(new Set(decals).size).toBe(3)
  })

  // RGAA 1.1: the canvas gets a text alternative summing up the chart
  it('describes the chart type, its axes and its number of values to assistive technologies', async () => {
    const { wrapper } = await mountViewer([{ column_y: 'nb', type: 'histogram' }, { column_y: 'rate', type: 'line' }])
    const container = wrapper.find('[role="img"]')
    expect(container.attributes('aria-label')).toBe('Graphique en barres et en courbes : year en abscisse, nb et rate en ordonnée, 2 valeurs.')
    wrapper.unmount()

    const single = await mountViewer([{ column_y: 'nb', type: 'line' }], {}, { [RESOURCE_ID]: [{ year: 2020, nb: 3, rate: 1 }] })
    expect(single.wrapper.find('[role="img"]').attributes('aria-label')).toBe('Graphique en courbes : year en abscisse, nb en ordonnée, 1 valeur.')
    single.wrapper.unmount()
  })

  it('truncates long category labels with an ellipsis', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }])
    expect(option.xAxis.axisLabel.overflow).toBe('truncate')
    expect(option.xAxis.axisLabel.width).toBeGreaterThan(0)
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
      { value: { year: 2021, nb: 5, rate: 2.5 }, axisValueLabel: '2021', seriesName: 'nb', seriesIndex: 0 },
      { value: { year: 2021, nb: 5, rate: 2.5 }, axisValueLabel: '2021', seriesName: 'rate', seriesIndex: 1 },
    ]) as string

    expect(html).toBe(`<strong>2021</strong><br>nb: <strong>${(5).toLocaleString()}</strong><br>rate: <strong>${(2.5).toLocaleString()}</strong><br>`)
  })

  it('shows a dash in the tooltip for a missing value', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }, { column_y: 'rate', type: 'line' }])

    const html = option.tooltip.formatter([
      { value: { year: 2021, nb: 5 }, axisValueLabel: '2021', seriesName: 'nb', seriesIndex: 0 },
      { value: { year: 2021, rate: null }, axisValueLabel: '2021', seriesName: 'rate', seriesIndex: 1 },
      { value: { year: 2021 }, axisValueLabel: '2021', seriesName: 'rate', seriesIndex: 1 },
    ]) as string

    expect(html).toBe(`<strong>2021</strong><br>nb: <strong>${(5).toLocaleString()}</strong><br>rate: <strong>–</strong><br>rate: <strong>–</strong><br>`)
  })

  it('plots each series on the same resource from its own data', async () => {
    const chart = chartConfig([{ column_y: 'nb', type: 'histogram' }, { column_y: 'rate', type: 'histogram' }])
    chart.series[0]!.aggregate_y = 'max'
    chart.series[1]!.aggregate_y = 'max'
    const data = {
      0: [{ year: 2020, nb__max: 3 }, { year: 2021, nb__max: 5 }],
      1: [{ year: 2020, rate__max: 1.5 }, { year: 2021, rate__max: 2.5 }],
    }
    const wrapper = mount(ChartViewer, { props: { chart, series: { data, columns: COLUMNS } } })
    await flushPromises()
    const option = setOptionMock.mock.calls.at(-1)![0]
    wrapper.unmount()

    expect(option.dataset.map((d: { source: Array<Record<string, unknown>> }) => d.source)).toEqual([data[0], data[1]])
    expect(option.series.map((s: { encode: { y: string } }) => s.encode.y)).toEqual(['nb__max', 'rate__max'])
    // Without it, ECharts draws every series from the first dataset.
    expect(option.series.map((s: { datasetIndex: number }) => s.datasetIndex)).toEqual([0, 1])
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

  it('keeps the raw dates of a discrete date axis, shared by every series, and formats their labels', async () => {
    const data = { [RESOURCE_ID]: [{ year: '2021-01-01', nb: 5, rate: 1 }, { year: '2020-01-01', nb: 3, rate: 2 }] }
    const columns: ColumnsDefinition = { [RESOURCE_ID]: [{ name: 'year', type: 'date' }, { name: 'nb', type: 'number' }, { name: 'rate', type: 'number' }] }
    const option = await capture([{ column_y: 'nb', type: 'histogram' }, { column_y: 'rate', type: 'histogram' }], { type: 'discrete' }, data, columns)

    // Date objects would be distinct categories for each series.
    expect(option.dataset.map((d: { source: Array<{ year: unknown }> }) => d.source.map(r => r.year))).toEqual([['2020-01-01', '2021-01-01'], ['2020-01-01', '2021-01-01']])
    const label = option.xAxis.axisLabel.formatter('2020-01-01')
    expect(label).toMatch(/20/)
    expect(label).not.toContain('GMT')
  })

  it('labels fractional y ticks distinctly instead of rounding them to integers', async () => {
    const option = await capture([{ column_y: 'rate', type: 'line' }])
    const labels = [0, 0.2, 0.4, 0.6].map(v => option.yAxis.axisLabel.formatter(v))

    expect(new Set(labels).size).toBe(4)
  })

  it('keeps integer y ticks for integer data', async () => {
    const option = await capture([{ column_y: 'nb', type: 'histogram' }])

    expect(option.yAxis.minInterval).toBe(1)
  })

  it('allows fractional y ticks when a value is fractional', async () => {
    const option = await capture([{ column_y: 'nb', type: 'histogram' }, { column_y: 'rate', type: 'histogram' }])

    expect(option.yAxis.minInterval).toBeUndefined()
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

describe('ChartViewer continuous X bounds', () => {
  beforeEach(() => setOptionMock.mockClear())

  const PROFILED: ColumnsDefinition = {
    [RESOURCE_ID]: [
      { name: 'year', type: 'number', min: 1900, max: 2100 },
      { name: 'nb', type: 'number' },
      { name: 'rate', type: 'number' },
    ],
  }

  it('keeps the profile bounds when every value is shown', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' }, manyRows(10), PROFILED)

    expect([option.xAxis.min, option.xAxis.max]).toEqual([1900, 2100])
  })

  it('bounds the axis to the values kept by the limit', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous', sort_x_by: 'axis_x', sort_x_direction: 'asc', limit: 3 }, manyRows(10), PROFILED)

    expect([option.xAxis.min, option.xAxis.max]).toEqual([2000, 2002])
  })

  it('bounds the axis to the drawn values when a filter is set', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' }, manyRows(10), PROFILED, true)

    expect([option.xAxis.min, option.xAxis.max]).toEqual([2000, 2009])
  })

  it('bounds the axis to the fetched values when the groups are truncated', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' }, manyRows(50), PROFILED)

    expect([option.xAxis.min, option.xAxis.max]).toEqual([2000, 2049])
  })
})

describe('ChartViewer numeric X labels', () => {
  beforeEach(() => setOptionMock.mockClear())

  it('shows years on a continuous axis without a thousands separator', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' })

    expect([2018, 2019, 2020].map(v => option.xAxis.axisLabel.formatter(v))).toEqual(['2018', '2019', '2020'])
  })

  it('still reads years as years when some X values are empty', async () => {
    const data = { [RESOURCE_ID]: [{ year: null, nb: 1, rate: 1 }, { year: 2018, nb: 2, rate: 2 }, { year: undefined, nb: 2, rate: 2 }] }
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' }, data)

    expect(option.xAxis.axisLabel.formatter(2018)).toBe('2018')
    expect(option.xAxis.minInterval).toBe(1)
  })

  it('formats the year of the tooltip title and of the axis pointer like the axis labels', async () => {
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' })

    const html = option.tooltip.formatter([{ value: { year: 2018, nb: 3 }, axisValue: 2018, axisValueLabel: '2,018', seriesName: 'nb', seriesIndex: 0 }]) as string
    expect(html.startsWith('<strong>2018</strong>')).toBe(true)
    expect(option.xAxis.axisPointer.label.formatter({ value: 2018 })).toBe('2018')
  })

  // The test locale is not French: only check grouping and decimals are kept.
  it('keeps thousands separators and decimals for other numbers on a continuous axis', async () => {
    const data = { [RESOURCE_ID]: [{ year: 1500, nb: 1, rate: 1 }, { year: 250000, nb: 2, rate: 2 }] }
    const option = await capture([{ column_y: 'nb', type: 'line' }], { type: 'continuous' }, data)

    expect(option.xAxis.axisLabel.formatter(250000)).toMatch(/^250\D000$/)
    expect(option.xAxis.axisLabel.formatter(2.5)).toMatch(/^2\D5$/)
  })
})
