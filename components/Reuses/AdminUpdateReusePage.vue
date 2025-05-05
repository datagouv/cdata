<template>
  <div>
    <DescribeReuse
      v-if="reuseForm"
      v-model="reuseForm"
      type="update"
      @submit="save"
    >
      <template #button>
        <BrandedButton
          type="submit"
          color="primary"
          :disabled="loading"
        >
          {{ t("Save") }}
        </BrandedButton>
      </template>
      <div class="mt-5 space-y-5">
        <TransferBanner
          type="Reuse"
          :subject="reuse"
          :label="$t('Transfer reuse')"
        />
        <BannerAction
          class="mt-5"
          type="danger"
          :title="$t('Delete the reuse')"
        >
          {{ $t("Be careful, this action can't be reverse.") }}
          <template #button>
            <ModalWithButton
              :title="$t('Are you sure you want to delete this reuse ?')"
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
                    @click="deleteReuse"
                  >
                    {{ $t("Delete the reuse") }}
                  </BrandedButton>
                </div>
              </template>
            </ModalWithButton>
          </template>
        </BannerAction>
      </div>
    </DescribeReuse>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import type { Reuse, ReuseType } from '@datagouv/components-next'
import { RiDeleteBin6Line } from '@remixicon/vue'
import DescribeReuse from '~/components/Reuses/DescribeReuse.vue'
import type { ReuseForm, ReuseTopic } from '~/types/types'
import { toForm, toApi } from '~/utils/reuses'

const { t } = useI18n()
const { $api, $fileApi } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const loading = ref(false)

const localePath = useLocalePath()

const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse } = await useAPI<Reuse>(url, { lazy: true })

const { data: types } = await useAPI<Array<ReuseType>>('/api/1/reuses/types', { lazy: true })
const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics', { lazy: true })

const reuseForm = ref<ReuseForm | null>(null)
watchEffect(() => {
  reuseForm.value = toForm(reuse.value, types.value || [], topics.value || [])
})

const save = async () => {
  if (!reuseForm.value) throw new Error('No reuse form')

  try {
    loading.value = true

    await $api(`/api/1/reuses/${reuse.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(toApi(reuseForm.value, { private: reuseForm.value.private })),
    })

    if (reuseForm.value.image && typeof reuseForm.value.image !== 'string') {
      const formData = new FormData()
      formData.set('file', reuseForm.value.image)
      await $fileApi(`/api/1/reuses/${reuse.value.id}/image`, {
        method: 'POST',
        body: formData,
      })
    }

    toast.success(t('Reuse updated!'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    loading.value = false
  }
}

async function deleteReuse() {
  loading.value = true
  try {
    await $api(`/api/1/reuses/${route.params.id}`, {
      method: 'DELETE',
    })
    if (route.params.oid) {
      await navigateTo(localePath(`/admin/organizations/${route.params.oid}/reuses`), { replace: true })
    }
    else {
      await navigateTo(localePath('/admin/me/reuses'), { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}
</script>
