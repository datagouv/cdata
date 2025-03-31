<template>
  <DescribeHarvester
    v-if="harvesterForm"
    v-model="harvesterForm"
    type="update"
    @submit="save"
  >
    <template #button>
      <div class="flex items-center space-x-4">
        <ModalWithButton
          :title="$t('Preview')"
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
              {{ $t('Preview') }}
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
              preview
            />
          </div>
        </ModalWithButton>
        <BrandedButton
          type="submit"
          :loading
        >
          {{ $t("Save") }}
        </BrandedButton>
      </div>
    </template>

    <BannerAction
      class="mt-5"
      type="danger"
      :title="$t('Delete the harvester')"
    >
      {{ $t("Be careful, this action can't be reverse.") }}
      <template #button>
        <ModalWithButton
          :title="$t('Are you sure you want to delete this harvester?')"
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
                @click="deleteHarvester"
              >
                {{ $t("Delete the harvester") }}
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
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import DescribeHarvester from '~/components/Harvesters/DescribeHarvester.vue'
import JobPage from '~/components/Harvesters/JobPage.vue'
import PreviewLoader from '~/components/Harvesters/PreviewLoader.vue'
import type { HarvesterForm, HarvesterJob, HarvesterSource } from '~/types/harvesters'
import { toForm, toApi } from '~/utils/harvesters'

const route = useRoute()
const { $api } = useNuxtApp()
const { t } = useI18n()
const { toast } = useToast()

const sourceUrl = computed(() => `/api/1/harvest/source/${route.params.id}`)
const { data: harvester } = await useAPI<HarvesterSource>(sourceUrl, { lazy: true })

const loading = ref(false)

const harvesterForm = ref<HarvesterForm | null>(null)
watchEffect(() => {
  harvesterForm.value = toForm(harvester.value)
})

const save = async () => {
  if (!harvesterForm.value) throw new Error('No harvester form')

  try {
    loading.value = true

    await $api(`/api/1/harvest/source/${harvester.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(toApi(harvesterForm.value)),
    })

    if (harvester.value.schedule !== harvesterForm.value.schedule) {
      if (harvesterForm.value.schedule) {
        await $api(`/api/1/harvest/source/${harvester.value.id}/schedule`, {
          method: 'POST',
          body: JSON.stringify(harvesterForm.value.schedule),
        })
      }
      else {
        await $api(`/api/1/harvest/source/${harvester.value.id}/schedule`, { method: 'DELETE' })
      }
    }

    toast.success(t('Harvester updated!'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    loading.value = false
  }
}

const previewJob = ref<HarvesterJob | null>(null)
const preview = async () => {
  if (!harvesterForm.value) throw new Error('No harvester form')

  previewJob.value = await $api<HarvesterJob>('/api/1/harvest/source/preview', {
    method: 'POST',
    body: toApi(harvesterForm.value),
  })
}

const localePath = useLocalePath()
const deleteHarvester = async () => {
  loading.value = true
  try {
    await $api(`/api/1/harvest/source/${harvester.value.id}`, {
      method: 'DELETE',
    })

    if (harvester.value.organization) {
      await navigateTo(localePath(`/beta/admin/organizations/${harvester.value.organization.id}/harvesters`), { replace: true })
    }
    else {
      await navigateTo(localePath(`/beta/admin/user/me`), { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}
</script>
