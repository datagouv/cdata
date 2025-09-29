<template>
  <div>
    <DescribeDataset
      v-if="datasetForm"
      v-model="datasetForm"
      type="update"
      :harvested
      :submit-label="t('Sauvegarder')"
      @feature="feature"
      @submit="save"
    >
      <template #top>
        <BannerAction
          v-if="!dataset.deleted && !dataset.archived"
          class="mb-4"
          type="primary"
          :title="$t('Modifier la visibilité du jeu de données')"
        >
          <TranslationT
            v-if="dataset.private"
            keypath="Ce jeu de données est actuellement {status}. Seul vous ou les membres de votre organisation pouvez le voir et y contribuer."
          >
            <template #status>
              <strong>{{ $t('privé') }}</strong>
            </template>
          </TranslationT>
          <TranslationT
            v-else
            keypath="Ce jeu de données est actuellement {status}. N'importe qui sur Internet peut voir ce jeu de données."
          >
            <template #status>
              <strong>{{ $t('public') }}</strong>
            </template>
          </TranslationT>

          <template #button>
            <BrandedButton
              :loading="isLoading"
              @click="switchDatasetPrivate"
            >
              {{ dataset.private ? $t('Publier le jeu de données') : $t('Passer en brouillon') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="dataset.deleted"
          class="mb-4"
          type="warning"
          :title="$t('Restaurer ce jeu de données')"
        >
          {{ $t("Sans restauration le jeu de données sera définitivement supprimé dans la nuit.") }}

          <template #button>
            <BrandedButton
              :icon="RiArrowGoBackLine"
              :disabled="isLoading"
              @click="restoreDataset"
            >
              {{ $t('Restaurer') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </template>
      <div class="mt-5 space-y-5">
        <TransferBanner
          type="Dataset"
          :subject="dataset"
          :label="$t('Transférer  le jeu de données')"
        />
        <BannerAction
          type="warning"
          :title="dataset.archived ? $t('Désarchiver le jeu de données') : $t('Archiver le jeu de données')"
        >
          {{ $t("Un jeu de données archivé n'est plus indexé mais reste accessible aux utilisateurs avec un lien direct.") }}

          <template #button>
            <BrandedButton
              :icon="RiArchiveLine"
              :loading="isLoading"
              @click="archiveDataset"
            >
              {{ dataset.archived ? $t('Désarchiver') : $t('Archiver') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="!dataset.deleted"
          type="danger"
          :title="$t('Supprimer le jeu de données')"
        >
          {{ $t("Attention, cette action ne peut pas être annulée.") }}

          <template #button>
            <ModalWithButton
              :title="$t('Êtes-vous sûr de vouloir supprimer ce jeu de données ?')"
              size="lg"
            >
              <template #button="{ attrs, listeners }">
                <BrandedButton
                  :icon="RiDeleteBin6Line"
                  :loading="isLoading"
                  v-bind="attrs"
                  v-on="listeners"
                >
                  {{ $t('Supprimer') }}
                </BrandedButton>
              </template>
              <p class="fr-text--bold">
                {{ $t("Cette action est irréversible.") }}
              </p>
              <template #footer>
                <div class="flex-1 flex justify-end">
                  <BrandedButton
                    color="danger"
                    :loading="isLoading"
                    @click="deleteDataset"
                  >
                    {{ $t("Supprimer le jeu de données") }}
                  </BrandedButton>
                </div>
              </template>
            </ModalWithButton>
          </template>
        </BannerAction>
      </div>
    </DescribeDataset>
  </div>
</template>

<script setup lang="ts">
import type { DatasetV2, Frequency, License } from '@datagouv/components-next'
import { BannerAction, BrandedButton, TranslationT } from '@datagouv/components-next'
import { RiArchiveLine, RiArrowGoBackLine, RiDeleteBin6Line } from '@remixicon/vue'
import DescribeDataset from '~/components/Datasets/DescribeDataset.vue'
import type { DatasetForm, EnrichedLicense, SpatialGranularity } from '~/types/types'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()

const route = useRoute()
const { start, finish, isLoading } = useLoadingIndicator()

const { toast } = useToast()

const { data: frequencies } = await useAPI<Array<Frequency>>('/api/1/datasets/frequencies', { lazy: true })

const { data: allLicenses } = await useAPI<Array<License>>('/api/1/datasets/licenses', { lazy: true })

// Merge some information between database (all licenses) and config (selectable license, some recommanded, codes…)
// Maybe all these information could be better stored in database too…
const licenses = computed(() => {
  if (!allLicenses.value) return []

  const licenses = [] as Array<EnrichedLicense>
  const licensesChoices = config.public.licenses as unknown as Record<string, Array<{ value: string, recommended?: boolean, code?: string, description?: string }>>
  for (const [group, licensesInGroup] of Object.entries(licensesChoices)) {
    for (const license of licensesInGroup) {
      const found = allLicenses.value.find(({ id }) => license.value === id)
      if (!found) continue
      licenses.push({ ...found, ...license, group })
    }
  }
  return licenses
})
const { data: granularities } = await useAPI<Array<SpatialGranularity>>('/api/1/spatial/granularities/', { lazy: true })

const url = computed(() => `/api/2/datasets/${route.params.id}/`)
const { data: dataset, refresh } = await useAPI<DatasetV2>(url, { redirectOn404: true })

const datasetForm = ref<DatasetForm | null>(null)
const harvested = ref(false)
watchEffect(() => {
  if (dataset.value && licenses.value && frequencies.value && granularities.value) {
    datasetForm.value = datasetToForm(dataset.value, licenses.value, frequencies.value, [], granularities.value)
    harvested.value = isHarvested(dataset.value)
  }
})

async function save() {
  if (!datasetForm.value) throw new Error('No dataset form')

  try {
    start()
    if (
      datasetForm.value.contact_points
      && datasetForm.value.owned?.organization
    ) {
      for (const contactPointKey in datasetForm.value.contact_points) {
        if (datasetForm.value.contact_points[contactPointKey] && !('id' in datasetForm.value.contact_points[contactPointKey])) {
          datasetForm.value.contact_points[contactPointKey] = await newContactPoint($api, datasetForm.value.owned?.organization, datasetForm.value.contact_points[contactPointKey])
        }
      }
    }

    await $api(`/api/1/datasets/${dataset.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { private: datasetForm.value.private })),
    })

    refresh()
    toast.success(t('Jeu de données mis à jour !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function deleteDataset() {
  start()
  try {
    await $api(`/api/1/datasets/${route.params.id}`, {
      method: 'DELETE',
    })
    refresh()
    toast.success(t('Jeu de données supprimé !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function switchDatasetPrivate() {
  if (!datasetForm.value) throw new Error('No dataset form')
  start()
  try {
    await $api(`/api/1/datasets/${dataset.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { private: !datasetForm.value.private })),
    })
    refresh()
    if (datasetForm.value.private) {
      toast.success(t('Jeu de données publié !'))
    }
    else {
      toast.success(t('Jeu de données passé en brouillon !'))
    }
  }
  finally {
    finish()
  }
}

async function restoreDataset() {
  if (!datasetForm.value) throw new Error('No dataset form')
  start()
  try {
    await $api(`/api/1/datasets/${dataset.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { deleted: null })),
    })
    refresh()
    toast.success(t('Jeu de données restauré !'))
  }
  finally {
    finish()
  }
}

async function archiveDataset() {
  if (!datasetForm.value) throw new Error('No dataset form')
  start()
  try {
    await $api(`/api/1/datasets/${dataset.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { archived: dataset.value.archived ? null : new Date().toISOString() })),
    })
    refresh()
    if (dataset.value.archived) {
      toast.success(t('Jeu de données désarchivé !'))
    }
    else {
      toast.success(t('Jeu de données archivé !'))
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function feature() {
  const method = dataset.value.featured ? 'DELETE' : 'POST'
  try {
    start()
    await $api(`/api/1/datasets/${route.params.id}/featured`, {
      method,
    })
    await refresh()
    if (method === 'DELETE') {
      toast.success(t('Jeu de données retiré de la mise en avant !'))
    }
    else {
      toast.success(t('Jeu de données mis en avant !'))
    }
  }
  catch {
    toast.error(t('Impossible de mettre en avant ce jeu de données'))
  }
  finally {
    finish()
  }
}
</script>
