<template>
  <DescribeHarvester
    v-if="harvester && harvesterForm"
    v-model="harvesterForm"
    type="update"
    @submit="save"
  >
    <template #button>
      <div class="flex items-center space-x-4">
        <ModalWithButton
          v-if="harvester.permissions.preview"
          :title="$t('Prévisualiser')"
          size="fullscreen"
          @open="preview"
          @close="previewJob = null"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              color="secondary"
              v-bind="attrs"
              v-on="listeners"
            >
              {{ $t('Prévisualiser') }}
            </BrandedButton>
          </template>
          <div
            v-if="!previewJob"
            class="flex items-center justify-center"
          >
            <PreviewLoader />
          </div>
          <div
            v-else-if="previewJob"
            class="space-y-2"
          >
            <JobPage
              :job="previewJob"
              :items="previewJob.items"
            />
          </div>
        </ModalWithButton>
        <BrandedButton
          type="submit"
          :loading
          :disabled="!harvester.permissions.edit"
        >
          {{ $t("Sauvegarder") }}
        </BrandedButton>
      </div>
    </template>
    <BannerAction
      v-if="harvester.permissions.delete"
      class="mt-5"
      type="danger"
      :title="$t('Supprimer le moissonneur')"
    >
      {{ $t("Attention, cette action ne peut pas être annulée.") }}
      <template #button>
        <ModalWithButton
          :title="$t('Êtes-vous sûrs de vouloir supprimer ce moissonneur ?')"
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
                :disabled="loading"
                @click="deleteHarvester"
              >
                {{ $t("Supprimer le moissonneur") }}
              </BrandedButton>
            </div>
          </template>
        </ModalWithButton>
      </template>
    </BannerAction>
  </DescribeHarvester>
</template>

<script setup lang="ts">
import { RiDeleteBin6Line } from '@remixicon/vue'
import { BannerAction, BrandedButton, toast } from '@datagouv/components-next'
import DescribeHarvester from '~/components/Harvesters/DescribeHarvester.vue'
import JobPage from '~/components/Harvesters/JobPage.vue'
import PreviewLoader from '~/components/Harvesters/PreviewLoader.vue'
import type { HarvesterForm, HarvesterJobPreview, HarvesterSource } from '~/types/harvesters'

const route = useRoute()
const { $api } = useNuxtApp()
const { t } = useTranslation()

const sourceUrl = computed(() => `/api/1/harvest/source/${route.params.id}`)
const { data: harvester, refresh } = await useAPI<HarvesterSource>(sourceUrl, { redirectOn404: true })

const loading = ref(false)

// The form is the user's working copy: it is built from the source once, then lives its
// own life until it is saved.
const harvesterForm = ref<HarvesterForm | null>(null)
watchEffect(() => {
  if (!harvester.value || harvesterForm.value) return
  harvesterForm.value = harvesterToForm(harvester.value)
})

const save = async () => {
  if (!harvesterForm.value) throw new Error('No harvester form')
  if (!harvester.value) return

  try {
    loading.value = true

    // `harvester.schedule` is null when the source isn't scheduled, the form holds ''.
    const scheduleChanged = (harvester.value.schedule || '') !== harvesterForm.value.schedule

    // `harvester` is shared with the parent page, which displays the source around the
    // tabs, and is only fetched once per session.
    harvester.value = await $api<HarvesterSource>(`/api/1/harvest/source/${harvester.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(harvesterToApi(harvesterForm.value)),
    })

    if (scheduleChanged) {
      if (harvesterForm.value.schedule) {
        await $api(`/api/1/harvest/source/${harvester.value.id}/schedule`, {
          method: 'POST',
          body: JSON.stringify(harvesterForm.value.schedule),
        })
      }
      else {
        await $api(`/api/1/harvest/source/${harvester.value.id}/schedule`, { method: 'DELETE' })
      }

      // The unschedule endpoint answers a 204 with an empty body, so the source is fetched
      // back instead of reusing the schedule response.
      await refresh()
    }

    toast.success(t('Moissonneur mis à jour !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    loading.value = false
  }
}

const previewJob = ref<HarvesterJobPreview | null>(null)
const preview = async () => {
  if (!harvesterForm.value) throw new Error('No harvester form')

  previewJob.value = await $api<HarvesterJobPreview>('/api/1/harvest/source/preview/', {
    method: 'POST',
    body: harvesterToApi(harvesterForm.value),
  })
}

const deleteHarvester = async () => {
  if (!harvester.value) return

  loading.value = true
  try {
    await $api(`/api/1/harvest/source/${harvester.value.id}`, {
      method: 'DELETE',
    })

    if (harvester.value.organization) {
      await navigateTo(`/admin/organizations/${harvester.value.organization.id}/harvesters`, { replace: true })
    }
    else {
      await navigateTo(`/admin/me/datasets`, { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}
</script>
