<template>
  <div>
    <DescribeDataservice
      v-if="dataserviceForm"
      v-model="dataserviceForm"
      :harvested="harvested"
      type="update"
      @feature="feature"
      @submit="save"
    >
      <template #top>
        <BannerAction
          v-if="!dataservice.deleted_at && !dataservice.archived_at"
          class="mb-4"
          type="primary"
          :title="$t(`Modifier la visibilité de l'API`)"
        >
          <TranslationT
            v-if="dataservice.private"
            keypath="Cette API est actuellement {status}. Seul vous ou les membres de votre organisation pouvez la voir et y contribuer."
          >
            <template #status>
              <strong>{{ $t('privée') }}</strong>
            </template>
          </TranslationT>
          <TranslationT
            v-else
            keypath="Cette API est actuellement {status}. N'importe qui sur Internet peut voir cette API."
          >
            <template #status>
              <strong>{{ $t('publique') }}</strong>
            </template>
          </TranslationT>

          <template #button>
            <BrandedButton
              :loading="isLoading"
              @click="switchDataservicePrivate"
            >
              {{ dataservice.private ? $t("Publier l'API") : $t('Passer en brouillon') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="dataservice.deleted_at"
          class="mb-4"
          type="warning"
          :title="$t('Restaurer cette API')"
        >
          {{ $t("Sans restauration l'API sera définitivement supprimée dans la nuit.") }}

          <template #button>
            <BrandedButton
              :icon="RiArrowGoBackLine"
              :loading="isLoading"
              @click="restoreDataservice"
            >
              {{ $t('Restaurer') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </template>
      <template #button="attrs">
        <BrandedButton
          type="submit"
          v-bind="attrs"
          :loading="isLoading"
        >
          {{ t("Sauvegarder") }}
        </BrandedButton>
      </template>
      <div class="mt-5 space-y-5">
        <TransferBanner
          type="Dataservice"
          :subject="dataserviceSubject"
          :label="$t(`Transférer l'API`)"
        />
        <BannerAction
          type="warning"
          :title="dataservice.archived_at ? $t('Désarchiver cette API') : $t('Archiver cette API')"
        >
          {{ $t("Une API archivée n'est plus indexée mais reste accessible aux utilisateurs avec un lien direct.") }}

          <template #button>
            <BrandedButton
              :icon="RiArchiveLine"
              @click="archiveDataservice"
            >
              {{ dataservice.archived_at ? $t('Désarchiver') : $t('Archiver') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="!dataservice.deleted_at"
          type="danger"
          :title="$t(`Supprimer l'API`)"
        >
          {{ $t("Attention, cette action ne peut pas être annulée.") }}
          <template #button>
            <ModalWithButton
              :title="$t('Êtes-vous sûr de vouloir supprimer cette API ?')"
              size="lg"
            >
              <template #button="{ attrs, listeners }">
                <BrandedButton
                  color="danger"
                  size="xs"
                  :icon="RiDeleteBin6Line"
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
                    @click="deleteDataservice"
                  >
                    {{ $t("Supprimer l'API") }}
                  </BrandedButton>
                </div>
              </template>
            </ModalWithButton>
          </template>
        </BannerAction>
      </div>
    </DescribeDataservice>
  </div>
</template>

<script setup lang="ts">
import type { Dataservice } from '@datagouv/components-next'
import { RiArchiveLine, RiArrowGoBackLine, RiDeleteBin6Line } from '@remixicon/vue'
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import TranslationT from '@datagouv/components-next/src/components/TranslationT.vue'
import DescribeDataservice from '~/components/Dataservices/DescribeDataservice.vue'
import type { DataserviceForm, LinkToSubject } from '~/types/types'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const { start, finish, isLoading } = useLoadingIndicator()

const url = computed(() => `/api/1/dataservices/${route.params.id}`)
const { data: dataservice, refresh } = await useAPI<Dataservice>(url, { redirectOn404: true })
const dataserviceSubject = computed<Dataservice & LinkToSubject>(() => {
  return {
    ...dataservice.value,
    page: dataservice.value.self_web_url,
  }
})
const dataserviceForm = ref<DataserviceForm | null>(null)
const harvested = ref(false)
watchEffect(() => {
  dataserviceForm.value = dataserviceToForm(dataservice.value)
  harvested.value = isHarvested(dataservice.value)
})

async function save() {
  if (!dataserviceForm.value) throw new Error('No dataservice form')

  try {
    start()

    if (
      dataserviceForm.value.contact_points
      && dataserviceForm.value.owned?.organization
    ) {
      for (const contactPointKey in dataserviceForm.value.contact_points) {
        if (dataserviceForm.value.contact_points[contactPointKey] && !('id' in dataserviceForm.value.contact_points[contactPointKey])) {
          dataserviceForm.value.contact_points[contactPointKey] = await newContactPoint($api, dataserviceForm.value.owned?.organization, dataserviceForm.value.contact_points[contactPointKey])
        }
      }
    }
    await $api(`/api/1/dataservices/${dataservice.value.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(dataserviceToApi(dataserviceForm.value, { private: dataserviceForm.value.private })),
    })

    toast.success(t('Fiche API mise à jour !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function archiveDataservice() {
  if (!dataserviceForm.value) throw new Error('No dataservice form')

  try {
    start()
    await $api(`/api/1/dataservices/${dataservice.value.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(dataserviceToApi(dataserviceForm.value, { archived_at: dataservice.value.archived_at ? null : new Date().toISOString() })),
    })
    refresh()
    if (dataservice.value.archived_at) {
      toast.success(t('API désarchivée !'))
    }
    else {
      toast.success(t('API archivée !'))
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function switchDataservicePrivate() {
  if (!dataserviceForm.value) throw new Error('No dataservice form')

  try {
    start()
    await $api(`/api/1/dataservices/${dataservice.value.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(dataserviceToApi(dataserviceForm.value, { private: !dataservice.value.private })),
    })
    refresh()
    if (dataservice.value.private) {
      toast.success(t('API publiée !'))
    }
    else {
      toast.success(t('API passée en brouillon !'))
    }
  }
  finally {
    finish()
  }
}

async function restoreDataservice() {
  if (!dataserviceForm.value) throw new Error('No dataset form')
  start()
  try {
    await $api(`/api/1/dataservices/${dataservice.value.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(dataserviceToApi(dataserviceForm.value, { deleted_at: null })),
    })
    refresh()
    toast.success(t('API restaurée !'))
  }
  finally {
    finish()
  }
}

async function deleteDataservice() {
  start()
  try {
    await $api(`/api/1/dataservices/${route.params.id}`, {
      method: 'DELETE',
    })
    refresh()
    toast.success(t('API supprimée !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function feature() {
  const method = dataservice.value.featured ? 'DELETE' : 'POST'
  try {
    start()
    await $api(`/api/1/dataservices/${route.params.id}/featured`, {
      method,
    })
    await refresh()
    if (method === 'DELETE') {
      toast.success(t('API retirée de la mise en avant !'))
    }
    else {
      toast.success(t('API mise en avant !'))
    }
  }
  catch {
    toast.error(t('Impossible de mettre en avant cette API'))
  }
  finally {
    finish()
  }
}
</script>
