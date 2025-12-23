<template>
  <LoadingBlock
    v-slot="{ data: dataset }"
    :status
    :data="dataset"
  >
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
  </LoadingBlock>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, LoadingBlock, TranslationT, toast } from '@datagouv/components-next'
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { RiArchiveLine, RiArrowGoBackLine, RiDeleteBin6Line } from '@remixicon/vue'
import DescribeDataset from '~/components/Datasets/DescribeDataset.vue'
import type { DatasetForm } from '~/types/types'

const { t } = useTranslation()
const { $api } = useNuxtApp()

const route = useRoute()
const { start, finish, isLoading } = useLoadingIndicator()

const url = computed(() => `/api/2/datasets/${route.params.id}/`)
const { data: dataset, status, refresh } = await useAPI<DatasetV2WithFullObject>(url, {
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
  redirectOn404: true,
})

const datasetForm = ref<DatasetForm | null>(null)
const harvested = ref(false)
watchEffect(() => {
  if (dataset.value) {
    datasetForm.value = datasetToForm(dataset.value)
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

    await $api(`/api/1/datasets/${dataset.value?.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { private: datasetForm.value.private })),
    })

    await refresh()
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
    await $api(`/api/1/datasets/${dataset.value?.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { private: !datasetForm.value.private })),
    })
    await refresh()
    if (dataset.value?.private) {
      toast.success(t('Jeu de données passé en brouillon !'))
    }
    else {
      toast.success(t('Jeu de données publié !'))
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
    await $api(`/api/1/datasets/${dataset.value?.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { deleted: null })),
    })
    await refresh()
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
    await $api(`/api/1/datasets/${dataset.value?.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { archived: dataset.value?.archived ? null : new Date().toISOString() })),
    })
    await refresh()
    if (dataset.value?.archived) {
      toast.success(t('Jeu de données archivé !'))
    }
    else {
      toast.success(t('Jeu de données désarchivé !'))
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function feature() {
  const method = dataset.value?.featured ? 'DELETE' : 'POST'
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
