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
      :badges="dataset.badges"
      :submit-label="t('Sauvegarder')"
      :can-edit="dataset.permissions.edit"
      :read-only-message="t('Vous n\'avez pas la permission de modifier ce jeu de données.')"
      @feature="feature"
      @badges-change="pendingBadges = $event"
      @submit="save"
    >
      <template #top>
        <SimpleBanner
          v-if="!dataset.permissions.edit"
          class="mb-4"
          type="primary"
        >
          <p
            class="font-bold"
            :class="dataset.organization ? 'mb-1' : 'm-0'"
          >
            {{ $t("Vous ne pouvez pas modifier ce jeu de données") }}
          </p>
          <p
            v-if="dataset.organization"
            class="m-0 text-xs/5"
          >
            {{ $t("Demandez à un administrateur de {org} de vous donner accès à ce jeu de données.", { org: dataset.organization.name }) }}
          </p>
        </SimpleBanner>
        <BannerAction
          v-if="dataset.permissions.edit && !dataset.deleted && !dataset.archived"
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
          <template v-if="dataset.doi">
            {{ $t("Un jeu de données porteur d'un DOI ne peut plus repasser en brouillon.") }}
          </template>

          <template #button>
            <BrandedButton
              :loading="isLoading"
              :disabled="!!dataset.doi"
              @click="switchDatasetPrivate"
            >
              {{ dataset.private ? $t('Publier le jeu de données') : $t('Passer en brouillon') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="dataset.permissions.edit && dataset.deleted"
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
      <template v-if="dataset.permissions.edit">
        <div class="mt-5 space-y-5">
          <TransferBanner
            type="Dataset"
            :subject="dataset"
            :label="$t('Transférer  le jeu de données')"
          />
          <BannerAction
            v-if="dataset.doi"
            type="primary"
            :title="$t('DOI du jeu de données')"
          >
            <p class="m-0">
              <a
                :href="`https://doi.org/${dataset.doi}`"
                target="_blank"
                rel="noopener noreferrer"
                class="link"
              >
                {{ dataset.doi }}
              </a>
            </p>
            <p class="m-0">
              {{ $t("Un jeu de données porteur d'un DOI ne peut plus être supprimé ni repassé en brouillon, seulement archivé.") }}
            </p>

            <template #button>
              <CopyButton
                :label="$t('Copier le DOI')"
                :copied-label="$t('DOI copié !')"
                :text="dataset.doi"
              />
            </template>
          </BannerAction>
          <BannerAction
            v-if="!dataset.doi && isMeAdmin()"
            type="primary"
            :title="$t('Créer un DOI')"
          >
            {{ doiBlockedReason(dataset) ??$t("Un DOI est définitif : une fois créé, le jeu de données ne pourra plus être supprimé, seulement archivé.") }}

            <template #button>
              <ModalWithButton :title="$t('Êtes-vous sûr de vouloir créer un DOI pour ce jeu de données ?')">
                <template #button="{ attrs, listeners }">
                  <BrandedButton
                    :icon="RiFingerprintLine"
                    :disabled="!!doiBlockedReason(dataset)"
                    v-bind="attrs"
                    v-on="listeners"
                  >
                    {{ $t('Créer un DOI') }}
                  </BrandedButton>
                </template>
                <p class="m-0">
                  {{ $t("Un DOI est définitif : une fois créé, le jeu de données ne pourra plus être supprimé, seulement archivé.") }}
                </p>
                <template #footer="{ close }">
                  <div class="flex-1 flex justify-end space-x-4">
                    <BrandedButton
                      color="secondary"
                      :loading="isLoading"
                      @click="close"
                    >
                      {{ $t('Annuler') }}
                    </BrandedButton>
                    <BrandedButton
                      color="primary"
                      :loading="isLoading"
                      @click="mintDoi(close)"
                    >
                      {{ $t('Créer le DOI') }}
                    </BrandedButton>
                  </div>
                </template>
              </ModalWithButton>
            </template>
          </BannerAction>
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
            v-if="!dataset.deleted && !dataset.doi"
            type="danger"
            :title="$t('Supprimer le jeu de données')"
          >
            {{ $t("Attention, cette action ne peut pas être annulée.") }}

            <template #button>
              <AdminDeleteModal
                :title="$t('Êtes-vous sûr de vouloir supprimer ce jeu de données ?')"
                :delete-url="`/api/1/datasets/${route.params.id}`"
                :delete-button-label="$t('Supprimer le jeu de données')"
                :deletable-object="dataset"
                object-type="dataset"
                :object-title="dataset.title"
                @deleted="onDatasetDeleted"
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
              </AdminDeleteModal>
            </template>
          </BannerAction>
        </div>
      </template>
    </DescribeDataset>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, CopyButton, LoadingBlock, SimpleBanner, TranslationT, toast } from '@datagouv/components-next'
import type { Badge, DatasetV2WithFullObject } from '@datagouv/components-next'
import { RiArchiveLine, RiArrowGoBackLine, RiDeleteBin6Line, RiFingerprintLine } from '@remixicon/vue'
import DescribeDataset from '~/components/Datasets/DescribeDataset.vue'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import ModalWithButton from '~/components/Modal/ModalWithButton.vue'
import { updateBadges } from '~/api/badges'
import type { DatasetForm } from '~/types/types'

const { t } = useTranslation()
const { $api } = useNuxtApp()

const route = useRoute()
const isLoading = ref(false)

const url = computed(() => `/api/2/datasets/${route.params.id}/`)
const { data: dataset, status, refresh } = await useAPI<DatasetV2WithFullObject>(url, {
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
  redirectOn404: true,
})

const datasetForm = ref<DatasetForm | null>(null)
const pendingBadges = ref<Array<Badge> | null>(null)
watchEffect(() => {
  if (dataset.value) {
    datasetForm.value = datasetToForm(dataset.value)
  }
})

const doiBlockedReason = useDoiBlockedReason()

async function mintDoi(close: () => void) {
  isLoading.value = true
  try {
    await $api(`/api/1/datasets/${route.params.id}/doi`, { method: 'POST' })
    close()
    await refresh()
    toast.success(t('DOI créé !'))
  }
  finally {
    isLoading.value = false
  }
}

async function save() {
  if (!datasetForm.value) throw new Error('No dataset form')

  try {
    isLoading.value = true
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

    if (pendingBadges.value && dataset.value) {
      await updateBadges(dataset.value, pendingBadges.value, 'datasets')
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
    isLoading.value = false
  }
}

function onDatasetDeleted() {
  refresh()
  toast.success(t('Jeu de données supprimé !'))
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

async function switchDatasetPrivate() {
  if (!datasetForm.value) throw new Error('No dataset form')
  isLoading.value = true
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
    isLoading.value = false
  }
}

async function restoreDataset() {
  if (!datasetForm.value) throw new Error('No dataset form')
  isLoading.value = true
  try {
    await $api(`/api/1/datasets/${dataset.value?.id}/`, {
      method: 'PUT',
      body: JSON.stringify(datasetToApi(datasetForm.value, { deleted: null })),
    })
    await refresh()
    toast.success(t('Jeu de données restauré !'))
  }
  finally {
    isLoading.value = false
  }
}

async function archiveDataset() {
  if (!datasetForm.value) throw new Error('No dataset form')
  isLoading.value = true
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
    isLoading.value = false
  }
}

async function feature() {
  const method = dataset.value?.featured ? 'DELETE' : 'POST'
  try {
    isLoading.value = true
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
    isLoading.value = false
  }
}
</script>
