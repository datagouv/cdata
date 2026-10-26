// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ChartCard from '~/datagouv-components/src/components/ChartCard.vue'
import { configKey } from '~/datagouv-components/src/config'
import type { Chart } from '~/datagouv-components/src/types/visualizations'

function chartFixture(overrides: Partial<Chart> = {}): Chart {
  return {
    id: 'chart-1',
    title: 'Naissances par département',
    slug: 'naissances-par-departement',
    description: 'Nombre de naissances par département en 2024.',
    private: false,
    created_at: '2026-01-15T10:00:00.000Z',
    last_modified: '2026-02-01T12:00:00.000Z',
    deleted_at: null,
    image: null,
    uri: 'https://example.com/api/1/visualizations/chart-1/',
    page: 'https://example.com/visualizations/naissances-par-departement/',
    query: 'SELECT departement, COUNT(*) AS naissances FROM data GROUP BY departement',
    resource_id: '847057e0-4c03-4099-85aa-9796fb6003bf',
    y_axis: { min: null, max: null, label: null, unit: null, unit_position: null },
    extras: {},
    organization: null,
    owner: {
      id: 'user-1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      avatar: null,
      avatar_thumbnail: null,
      slug: 'ada-lovelace',
      page: 'https://example.com/users/ada-lovelace/',
      uri: 'https://example.com/api/1/users/user-1/',
    },
    permissions: { delete: false, edit: false, read: true },
    metrics: { views: 1250 },
    ...overrides,
  } as unknown as Chart
}

function mountCard(chart: Chart) {
  return mount(ChartCard, {
    props: { chart },
    global: {
      provide: {
        [configKey as symbol]: {
          name: 'data.gouv.fr',
          baseUrl: 'https://example.com',
          apiBase: 'https://example.com/api/1',
        },
      },
    },
  })
}

describe('ChartCard', () => {
  it('shows a line icon for line charts and a bar icon for histograms', () => {
    const iconOf = (chart_type: 'line' | 'histogram') =>
      mountCard(chartFixture({ chart_type })).findComponent({ name: 'ObjectCardHeader' }).props('icon')
    expect(iconOf('line')).not.toBe(iconOf('histogram'))
  })

  it('renders a chart on the new SQL contract (query/resource_id/y_axis, no x_axis/series)', () => {
    const chart = chartFixture()
    expect(chart).not.toHaveProperty('x_axis')
    expect(chart).not.toHaveProperty('series')

    const wrapper = mountCard(chart)
    expect(wrapper.text()).toContain('Naissances par département')
    expect(wrapper.text()).toContain('Nombre de naissances par département en 2024.')
    expect(wrapper.text()).toContain('Ada Lovelace')
  })

  it('links the title to the chart page', () => {
    const wrapper = mountCard(chartFixture())
    const link = wrapper.find('h3 a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com/visualizations/naissances-par-departement/')
  })

  it('shows a draft badge for private charts and none for public ones', () => {
    expect(mountCard(chartFixture({ private: true })).text()).toContain('Brouillon')
    expect(mountCard(chartFixture({ private: false })).find('.fr-badge').exists()).toBe(false)
  })

  it('shows a deleted badge instead of the draft badge for deleted charts', () => {
    const wrapper = mountCard(chartFixture({ deleted_at: '2026-03-01T00:00:00.000Z', private: true }))
    expect(wrapper.text()).toContain('Supprimé')
    expect(wrapper.text()).not.toContain('Brouillon')
  })

  it('displays the chart image when present and a placeholder otherwise', () => {
    const withImage = mountCard(chartFixture({ image: 'https://example.com/chart.png' }))
    const img = withImage.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/chart.png')

    expect(mountCard(chartFixture({ image: null })).find('img').exists()).toBe(false)
  })
})
