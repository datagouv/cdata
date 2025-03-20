<template>
  <div>
    <DescribeDataset
      v-if="datasetForm"
      v-model="datasetForm"
      type="update"
      :harvested
      :submit-label="t('Save')"
      @submit="save"
    >
      <div class="mt-5 space-y-5">
        <TransferBanner
          type="Dataset"
          :subject="dataset"
          :label="$t('Transfer dataset')"
        />
        <BannerAction
          type="warning"
          :title="dataset.archived ? $t('Unarchive the dataset') : $t('Archive the dataset')"
        >
          {{ $t("An archived dataset is no longer indexed but still accessible for users with the direct link.") }}

          <template #button>
            <BrandedButton
              :icon="RiArchiveLine"
              @click="archiveDataset"
            >
              {{ dataset.archived ? $t('Unarchive') : $t('Archive') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          type="danger"
          :title="$t('Delete the dataset')"
        >
          {{ $t("Be careful, this action can't be reverse.") }}

          <template #button>
            <ModalWithButton
              :title="$t('Are you sure you want to delete this dataset ?')"
              size="lg"
            >
              <template #button="{ attrs, listeners }">
                <BrandedButton
                  :icon="RiDeleteBin6Line"
                  v-bind="attrs"
                  v-on="listeners"
                >
                  {{ $t('Delete') }}
                </BrandedButton>
              </template>
              <p class="fr-text--bold">
                {{ $t("This action can't be reverse.") }}
              </p>
              <template #footer>
                <div class="flex-1 flex justify-end">
                  <BrandedButton
                    color="danger"
                    :disabled="loading"
                    @click="deleteDataset"
                  >
                    {{ $t("Delete the dataset") }}
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
import { BrandedButton } from '@datagouv/components-next'
import type { DatasetV2, Frequency, License } from '@datagouv/components-next'
import { RiArchiveLine, RiDeleteBin6Line } from '@remixicon/vue'
import DescribeDataset from '~/components/Datasets/DescribeDataset.vue'
import type { DatasetForm, EnrichedLicense, SpatialGranularity } from '~/types/types'
import { toForm, toApi } from '~/utils/datasets'

const { t } = useI18n()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()

const route = useRoute()
const loading = ref(false)

const localePath = useLocalePath()

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

const url = computed(() => `/api/2/datasets/${route.params.id}`)
const { data: dataset, refresh } = await useAPI<DatasetV2>(url)
const datasetForm = ref<DatasetForm | null>(null)
const harvested = ref(false)
watchEffect(() => {
  if (dataset.value && licenses.value && frequencies.value && granularities.value) {
    datasetForm.value = toForm(dataset.value, licenses.value, frequencies.value, [], granularities.value)
    harvested.value = isHarvested(dataset.value)
  }
})

async function save() {
  if (!datasetForm.value) throw new Error('No dataset form')

  try {
    loading.value = true
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
      body: JSON.stringify(toApi(datasetForm.value, { private: datasetForm.value.private })),
    })

    toast.success(t('Dataset updated!'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    loading.value = false
  }
}

async function deleteDataset() {
  loading.value = true
  try {
    await $api(`/api/1/datasets/${route.params.id}`, {
      method: 'DELETE',
    })
    if (route.params.oid) {
      await navigateTo(localePath(`/beta/admin/organizations/${route.params.oid}/datasets`), { replace: true })
    }
    else {
      await navigateTo(localePath('/beta/admin/me/datasets'), { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}

async function archiveDataset() {
  if (!datasetForm.value) throw new Error('No dataset form')
  loading.value = true
  try {
    await $api(`/api/1/datasets/${dataset.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(toApi(datasetForm.value, { archived: dataset.value.archived ? null : new Date().toISOString() })),
    })
    refresh()
    if (dataset.value.archived) {
      toast.success(t('Dataset unarchived!'))
    }
    else {
      toast.success(t('Dataset archived!'))
    }
  }
  finally {
    loading.value = false
  }
}
</script>
