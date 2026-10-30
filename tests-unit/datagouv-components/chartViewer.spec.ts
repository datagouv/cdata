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

function chartConfig(series: Array<{ column_y: string, type: 'line' | 'histogram' }>): ChartViewerConfig {
  return {
    x_axis: { column_x: 'year', sort_x_by: null, sort_x_direction: null, type: 'discrete' },
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
})
