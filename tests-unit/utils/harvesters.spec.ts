import { describe, expect, it } from 'vitest'
import type { HarvestBackend, HarvesterForm, HarvesterSource } from '~/types/harvesters'
import { harvesterToApi, harvesterToForm, syncFormWithBackend } from '~/utils/harvesters'

function makeHarvester(overrides: Partial<Record<keyof HarvesterSource, unknown>> = {}): HarvesterSource {
  return {
    id: 'harvester-1',
    name: 'Moissonneur SI Eau',
    description: null,
    url: 'https://data.ofb.fr/catalogue/csw',
    backend: 'csw-dcat',
    organization: { id: 'org-1', name: 'Système d’Information sur l’Eau' },
    owner: null,
    schedule: '0 0 * * *',
    autoarchive: true,
    active: true,
    config: {
      filters: [{ key: 'organization', type: 'include', value: 'insee' }],
      features: { geodcatap: true },
      extra_configs: [{ key: 'remote_url_prefix', value: 'https://data.ofb.fr/' }],
    },
    ...overrides,
  } as unknown as HarvesterSource
}

function makeBackend(overrides: Partial<HarvestBackend> = {}): HarvestBackend {
  return {
    id: 'csw-dcat',
    label: 'CSW-DCAT',
    filters: [{ label: 'Organisation', key: 'organization', type: 'string', description: '' }],
    features: [{ label: 'GeoDCAT-AP', key: 'geodcatap', default: false, description: '' }],
    extra_configs: [{ label: 'Préfixe', key: 'remote_url_prefix', default: '', description: '' }],
    ...overrides,
  }
}

function makeForm(overrides: Partial<HarvesterForm> = {}): HarvesterForm {
  return {
    owned: { organization: { id: 'org-1' }, owner: null },
    name: 'Moissonneur SI Eau',
    description: '',
    url: 'https://data.ofb.fr/catalogue/csw',
    backend: 'csw-dcat',
    filters: [{ key: 'organization', type: 'include', value: 'insee' }],
    features: { geodcatap: true },
    configs: [{ key: 'remote_url_prefix', value: 'https://data.ofb.fr/' }],
    schedule: '0 0 * * *',
    autoarchive: true,
    active: true,
    ...overrides,
  } as HarvesterForm
}

describe('harvesterToForm', () => {
  it('maps every field of an organization-owned source', () => {
    expect(harvesterToForm(makeHarvester())).toEqual({
      owned: { organization: { id: 'org-1', name: 'Système d’Information sur l’Eau' }, owner: null },
      name: 'Moissonneur SI Eau',
      description: '',
      url: 'https://data.ofb.fr/catalogue/csw',
      backend: 'csw-dcat',
      filters: [{ key: 'organization', type: 'include', value: 'insee' }],
      features: { geodcatap: true },
      configs: [{ key: 'remote_url_prefix', value: 'https://data.ofb.fr/' }],
      schedule: '0 0 * * *',
      autoarchive: true,
      active: true,
    })
  })

  it('maps a user-owned source', () => {
    const harvester = makeHarvester({ organization: null, owner: { id: 'user-1', first_name: 'Ada' } })

    expect(harvesterToForm(harvester).owned).toEqual({ organization: null, owner: { id: 'user-1', first_name: 'Ada' } })
  })

  it('turns the null schedule of an unscheduled source into an empty string', () => {
    expect(harvesterToForm(makeHarvester({ schedule: null })).schedule).toEqual('')
  })

  it('clones the config so editing the form leaves the fetched source untouched', () => {
    const harvester = makeHarvester()
    const form = harvesterToForm(harvester)

    form.features.geodcatap = false
    form.filters[0].value = 'ademe'
    form.configs[0].value = 'https://edited/'

    expect(harvester.config).toEqual({
      filters: [{ key: 'organization', type: 'include', value: 'insee' }],
      features: { geodcatap: true },
      extra_configs: [{ key: 'remote_url_prefix', value: 'https://data.ofb.fr/' }],
    })
  })

  it('falls back on empty collections for a source without config', () => {
    const form = harvesterToForm(makeHarvester({ config: {} }))

    expect(form.features).toEqual({})
    expect(form.filters).toEqual([])
    expect(form.configs).toEqual([])
  })
})

describe('harvesterToApi', () => {
  it('survives a form round-trip for an organization-owned source', () => {
    const harvester = makeHarvester()

    expect(harvesterToApi(harvesterToForm(harvester))).toEqual({
      organization: 'org-1',
      owner: null,
      name: 'Moissonneur SI Eau',
      description: '',
      url: 'https://data.ofb.fr/catalogue/csw',
      backend: 'csw-dcat',
      autoarchive: true,
      active: true,
      config: harvester.config,
    })
  })

  it('sends the owner instead of the organization for a user-owned source', () => {
    const harvester = makeHarvester({ organization: null, owner: { id: 'user-1' } })
    const api = harvesterToApi(harvesterToForm(harvester))

    expect(api.organization).toBeNull()
    expect(api.owner).toEqual('user-1')
  })

  it('sends no producer at all when none was selected', () => {
    const api = harvesterToApi(makeForm({ owned: null }))

    expect(api.organization).toBeNull()
    expect(api.owner).toBeNull()
  })
})

describe('syncFormWithBackend', () => {
  it('keeps a feature stored as enabled', () => {
    const form = makeForm({ features: { geodcatap: true } })

    syncFormWithBackend(form, makeBackend())

    expect(form.features).toEqual({ geodcatap: true })
  })

  it('keeps a feature stored as disabled even when the backend enables it by default', () => {
    const form = makeForm({ features: { geodcatap: false } })

    syncFormWithBackend(form, makeBackend({ features: [{ label: '', key: 'geodcatap', default: true, description: '' }] }))

    expect(form.features).toEqual({ geodcatap: false })
  })

  it('falls back on the backend default for a feature the source never stored', () => {
    const form = makeForm({ features: {} })

    syncFormWithBackend(form, makeBackend({ features: [{ label: '', key: 'geodcatap', default: true, description: '' }] }))

    expect(form.features).toEqual({ geodcatap: true })
  })

  it('mixes stored values and defaults when the backend declares several features', () => {
    const form = makeForm({ features: { geodcatap: true } })

    syncFormWithBackend(form, makeBackend({
      features: [
        { label: '', key: 'geodcatap', default: false, description: '' },
        { label: '', key: 'remote_id', default: true, description: '' },
        { label: '', key: 'dryrun', default: false, description: '' },
      ],
    }))

    expect(form.features).toEqual({ geodcatap: true, remote_id: true, dryrun: false })
  })

  it('drops the features, filters and configs the backend does not know about', () => {
    const form = makeForm({
      features: { geodcatap: true, gone: true },
      filters: [{ key: 'organization', type: 'include', value: 'insee' }, { key: 'gone', type: 'exclude', value: 'x' }],
      configs: [{ key: 'remote_url_prefix', value: 'https://data.ofb.fr/' }, { key: 'gone', value: 'x' }],
    })

    syncFormWithBackend(form, makeBackend())

    expect(form.features).toEqual({ geodcatap: true })
    expect(form.filters).toEqual([{ key: 'organization', type: 'include', value: 'insee' }])
    expect(form.configs).toEqual([{ key: 'remote_url_prefix', value: 'https://data.ofb.fr/' }])
  })

  it('empties everything for a backend without filters, configs nor features', () => {
    const form = makeForm()

    syncFormWithBackend(form, makeBackend({ filters: [], features: [], extra_configs: [] }))

    expect(form.features).toEqual({})
    expect(form.filters).toEqual([])
    expect(form.configs).toEqual([])
  })

  it('gives the API an explicit value for every feature of the backend', () => {
    const form = makeForm({ features: {} })

    syncFormWithBackend(form, makeBackend({
      features: [
        { label: '', key: 'geodcatap', default: false, description: '' },
        { label: '', key: 'remote_id', default: true, description: '' },
      ],
    }))

    expect(harvesterToApi(form).config.features).toEqual({ geodcatap: false, remote_id: true })
  })
})
