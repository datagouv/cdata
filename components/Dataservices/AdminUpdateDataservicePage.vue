<template>
  <div>
    <DescribeDataservice
      v-if="dataserviceForm"
      v-model="dataserviceForm"
      :harvested="harvested"
      type="update"
      @submit="save"
    >
      <template #button>
        <BrandedButton
          type="submit"
          :disabled="loading"
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
                    :disabled="loading"
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
import { RiArchiveLine, RiDeleteBin6Line } from '@remixicon/vue'
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import DescribeDataservice from '~/components/Dataservices/DescribeDataservice.vue'
import type { DataserviceForm, LinkToSubject } from '~/types/types'
import { toForm, toApi } from '~/utils/dataservices'

const { t } = useI18n()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const loading = ref(false)

const localePath = useLocalePath()

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
  dataserviceForm.value = toForm(dataservice.value)
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
      body: JSON.stringify(toApi(dataserviceForm.value, { private: dataserviceForm.value.private })),
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
      body: JSON.stringify(toApi(dataserviceForm.value, { archived_at: dataservice.value.archived_at ? null : new Date().toISOString() })),
    })
    refresh()
    if (dataservice.value.archived_at) {
      toast.success(t('Dataservice unarchived!'))
    }
    else {
      toast.success(t('Dataservice archived!'))
    }
  }
  finally {
    loading.value = false
  }
}

async function deleteDataservice() {
  loading.value = true
  try {
    await $api(`/api/1/dataservices/${route.params.id}`, {
      method: 'DELETE',
    })
    if (route.params.oid) {
      await navigateTo(localePath(`/admin/organizations/${route.params.oid}/dataservices`), { replace: true })
    }
    else {
      await navigateTo(localePath('/admin/me/dataservices'), { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}
</script>
