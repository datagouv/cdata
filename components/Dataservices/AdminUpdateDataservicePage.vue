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
          class="mb-4"
          type="primary"
          :title="$t(`Modifier la visibilité de l'API`)"
        >
          <i18n-t
            v-if="dataservice.private"
            keypath="Cette API est actuellement {status}. Seul vous ou les membres de votre organisation pouvez la voir et y contribuer."
          >
            <template #status>
              <strong>{{ $t('privée') }}</strong>
            </template>
          </i18n-t>
          <i18n-t
            v-else
            keypath="Cette API est actuellement {status}. N'importe qui sur Internet peut voir cette API."
          >
            <template #status>
              <strong>{{ $t('publique') }}</strong>
            </template>
          </i18n-t>

          <template #button>
            <BrandedButton
              :loading="isLoading"
              @click="switchDataservicePrivate"
            >
              {{ dataservice.private ? $t("Publier l'API") : $t('Passer en brouillon') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </template>
      <template #button>
        <BrandedButton
          type="submit"
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
          :title="dataservice.archived_at ? $t(`Désarchiver l'API`) : $t(`Archiver l'API`)"
        >
          {{ $t("Une API archivée n'est plus indexée mais reste accessible auxutilisateurs avec le lien direct.") }}

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
import { RiArchiveLine, RiDeleteBin6Line } from '@remixicon/vue'
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import DescribeDataservice from '~/components/Dataservices/DescribeDataservice.vue'
import type { DataserviceForm, LinkToSubject } from '~/types/types'

const { t } = useI18n()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const { start, finish, isLoading } = useLoadingIndicator()

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

    toast.success(t('Dataservice updated!'))
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
      toast.success(t('Dataservice unarchived!'))
    }
    else {
      toast.success(t('Dataservice archived!'))
    }
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
      toast.success(t('API publiée!'))
    }
    else {
      toast.success(t('API passée en brouillon!'))
    }
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
    if (route.params.oid) {
      await navigateTo(localePath(`/admin/organizations/${route.params.oid}/dataservices`), { replace: true })
    }
    else {
      await navigateTo(localePath('/admin/me/dataservices'), { replace: true })
    }
  }
  finally {
    finish()
  }
}
</script>
