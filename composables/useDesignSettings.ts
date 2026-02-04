export interface DesignSettings {
  datasetSlug: string
  dataserviceSlug: string
  organizationSlug: string
  reuseSlug: string
  tabularDatasetSlug: string
  mapDatasetSlug: string
}

const DEFAULT_SETTINGS: DesignSettings = {
  datasetSlug: 'repertoire-national-des-elus-1',
  dataserviceSlug: 'api-sirene-open-data',
  organizationSlug: 'sante-publique-france',
  reuseSlug: 'datafrance-plateforme-de-visualisation-open-data',
  tabularDatasetSlug: 'fichier-consolide-des-bornes-de-recharge-pour-vehicules-electriques',
  mapDatasetSlug: 'decoupage-administratif-communal-francais-issu-d-openstreetmap',
}

const STORAGE_KEY = 'design-system-settings'

export function useDesignSettings() {
  const settings = useState<DesignSettings>('design-settings', () => {
    if (import.meta.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
        }
        catch {
          return { ...DEFAULT_SETTINGS }
        }
      }
    }
    return { ...DEFAULT_SETTINGS }
  })

  const updateSetting = <K extends keyof DesignSettings>(key: K, value: DesignSettings[K]) => {
    settings.value = { ...settings.value, [key]: value }
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    }
  }

  const resetSettings = () => {
    settings.value = { ...DEFAULT_SETTINGS }
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const resetSetting = <K extends keyof DesignSettings>(key: K) => {
    updateSetting(key, DEFAULT_SETTINGS[key])
  }

  return {
    settings: readonly(settings),
    updateSetting,
    resetSettings,
    resetSetting,
    defaults: DEFAULT_SETTINGS,
  }
}
