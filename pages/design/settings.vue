<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Settings
      </h1>
      <p class="mt-2 text-gray-600">
        Configurez les IDs des objets utilisés pour les previews des composants.
        Les modifications sont sauvegardées dans le localStorage.
      </p>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">
          IDs de test
        </h2>
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click="handleReset"
        >
          Réinitialiser tout
        </button>
      </div>

      <div class="mt-6 space-y-6">
        <div
          v-for="field in fields"
          :key="field.key"
          class="grid gap-4 sm:grid-cols-3"
        >
          <div class="sm:col-span-2">
            <label
              :for="field.key"
              class="block text-sm font-medium text-gray-700"
            >
              {{ field.label }}
            </label>
            <p class="text-xs text-gray-500">
              {{ field.description }}
            </p>
            <div class="mt-1 flex gap-2">
              <input
                :id="field.key"
                v-model="localSettings[field.key]"
                type="text"
                class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-datagouv focus:outline-none focus:ring-1 focus:ring-datagouv"
                :placeholder="defaults[field.key]"
                @blur="handleUpdate(field.key)"
                @keyup.enter="handleUpdate(field.key)"
              >
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                :title="`Réinitialiser à: ${defaults[field.key]}`"
                @click="handleResetField(field.key)"
              >
                <RiRefreshLine class="size-4" />
              </button>
            </div>
          </div>
          <div class="flex items-end">
            <div
              v-if="testResults[field.key] === 'loading'"
              class="text-sm text-gray-500"
            >
              Test en cours...
            </div>
            <div
              v-else-if="testResults[field.key] === 'success'"
              class="flex items-center gap-1 text-sm text-green-600"
            >
              <RiCheckLine class="size-4" />
              Valide
            </div>
            <div
              v-else-if="testResults[field.key] === 'error'"
              class="flex items-center gap-1 text-sm text-red-600"
            >
              <RiCloseLine class="size-4" />
              Non trouvé
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6">
      <h2 class="text-lg font-semibold text-gray-900">
        Valeurs actuelles
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Export JSON des settings actuels pour debug.
      </p>
      <pre class="mt-4 overflow-x-auto rounded-lg bg-gray-100 p-4 text-xs">{{ JSON.stringify(settings, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiCheckLine, RiCloseLine, RiRefreshLine } from '@remixicon/vue'
import type { DesignSettings } from '~/composables/useDesignSettings'

const { settings, updateSetting, resetSettings, resetSetting, defaults } = useDesignSettings()
const { $api } = useNuxtApp()

const localSettings = ref<DesignSettings>({ ...settings.value })
const testResults = ref<Record<string, 'loading' | 'success' | 'error' | null>>({})

watch(settings, (newVal) => {
  localSettings.value = { ...newVal }
}, { deep: true })

const fields = [
  {
    key: 'datasetSlug' as const,
    label: 'Dataset Slug',
    description: 'Slug du dataset principal utilisé dans les previews',
    testUrl: (slug: string) => `/api/2/datasets/${slug}/`,
  },
  {
    key: 'dataserviceSlug' as const,
    label: 'Dataservice Slug',
    description: 'Slug du dataservice utilisé dans les previews',
    testUrl: (slug: string) => `/api/1/dataservices/${slug}/`,
  },
  {
    key: 'organizationSlug' as const,
    label: 'Organization Slug',
    description: 'Slug de l\'organisation utilisée dans les previews',
    testUrl: (slug: string) => `/api/1/organizations/${slug}/`,
  },
  {
    key: 'reuseSlug' as const,
    label: 'Reuse Slug',
    description: 'Slug de la réutilisation utilisée dans les previews',
    testUrl: (slug: string) => `/api/1/reuses/${slug}/`,
  },
  {
    key: 'tabularDatasetSlug' as const,
    label: 'Tabular Dataset Slug',
    description: 'Dataset avec des ressources CSV pour les previews tabulaires',
    testUrl: (slug: string) => `/api/2/datasets/${slug}/`,
  },
  {
    key: 'mapDatasetSlug' as const,
    label: 'Map Dataset Slug',
    description: 'Dataset avec des ressources géographiques pour les previews de cartes',
    testUrl: (slug: string) => `/api/2/datasets/${slug}/`,
  },
]

const handleUpdate = async (key: keyof DesignSettings) => {
  const value = localSettings.value[key]
  updateSetting(key, value)

  const field = fields.find(f => f.key === key)
  if (field) {
    testResults.value[key] = 'loading'
    try {
      await $api(field.testUrl(value))
      testResults.value[key] = 'success'
    }
    catch {
      testResults.value[key] = 'error'
    }
  }
}

const handleResetField = (key: keyof DesignSettings) => {
  resetSetting(key)
  localSettings.value[key] = defaults[key]
  testResults.value[key] = null
}

const handleReset = () => {
  resetSettings()
  localSettings.value = { ...defaults }
  testResults.value = {}
}
</script>
