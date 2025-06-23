<template>
  <div>
    <DescribeDataservice
      v-if="dataserviceForm"
      v-model="dataserviceForm"
      :harvested="harvested"
      type="update"
      @submit="save"
    >
      <template #top>
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
      <template #button>
        <BrandedButton
          type="submit"
          :loading="loading"
        >
          {{ t("Save") }}
        </BrandedButton>
      </template>
      <div class="mt-5 space-y-5">
        <TransferBanner
          type="Dataservice"
          :subject="dataserviceSubject"
          :label="$t('Transfer dataservice')"
        />
        <BannerAction
          type="warning"
          :title="dataservice.archived_at ? $t('Unarchive the dataservice') : $t('Archive the dataservice')"
        >
          {{ $t("An archived dataservice is no longer indexed but still accessible for users with the direct link.") }}

          <template #button>
            <BrandedButton
              :icon="RiArchiveLine"
              @click="archiveDataservice"
            >
              {{ dataservice.archived_at ? $t('Unarchive') : $t('Archive') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="!dataservice.deleted_at"
          type="danger"
          :title="$t('Delete the dataservice')"
        >
          {{ $t("Be careful, this action can't be reverse.") }}
          <template #button>
            <ModalWithButton
              :title="$t('Are you sure you want to delete this dataservice ?')"
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
                    :loading="isLoading"
                    @click="deleteDataservice"
                  >
                    {{ $t("Delete the dataservice") }}
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
import DescribeDataservice from '~/components/Dataservices/DescribeDataservice.vue'
import type { DataserviceForm, LinkToSubject } from '~/types/types'

const { t } = useI18n()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const { start, finish, isLoading } = useLoadingIndicator()
const loading = ref(false)

const url = computed(() => `/api/1/dataservices/${route.params.id}`)
const { data: dataservice, refresh } = await useAPI<Dataservice>(url)
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
    loading.value = true

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

    toast.success(t('Dataservice updated!'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    loading.value = false
  }
}

async function archiveDataservice() {
  if (!dataserviceForm.value) throw new Error('No dataservice form')

  try {
    loading.value = true
    await $api(`/api/1/dataservices/${dataservice.value.id}/`, {
      method: 'PATCH',
      body: JSON.stringify(dataserviceToApi(dataserviceForm.value, { archived_at: dataservice.value.archived_at ? null : new Date().toISOString() })),
    })
    refresh()
    if (dataservice.value.archived_at) {
      toast.success(t('Dataservice unarchived!'))
    }
    else {
      toast.success(t('Dataservice archived!'))
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    loading.value = false
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
    toast.success(t('API restaurée!'))
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
    toast.success(t('API supprimée!'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}
</script>
