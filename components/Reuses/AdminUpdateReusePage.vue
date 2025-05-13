<template>
  <div>
    <DescribeReuse
      v-if="reuseForm"
      v-model="reuseForm"
      type="update"
      @feature="feature"
      @submit="save"
    >
      <template #button>
        <BrandedButton
          type="submit"
          color="primary"
          :disabled="isLoading"
        >
          {{ t("Save") }}
        </BrandedButton>
      </template>
      <div class="mt-5 space-y-5">
        <TransferBanner
          type="Reuse"
          :subject="reuse"
          :label="$t('Transférer cette réutilisation')"
        />
        <BannerAction
          class="mt-5"
          type="danger"
          :title="$t('Supprimer cette réutilisation')"
        >
          {{ $t("Attention, cette action ne peut pas être annulée.") }}
          <template #button>
            <ModalWithButton
              :title="$t('Êtes-vous sûr de vouloir supprimer cette réutilisation?')"
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
                {{ $t("Cette action ne peut pas être annulée.") }}
              </p>
              <template #footer>
                <div class="flex-1 flex justify-end">
                  <BrandedButton
                    color="danger"
                    :disabled="isLoading"
                    @click="deleteReuse"
                  >
                    {{ $t("Supprimer cette réutilisation") }}
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
import type { Reuse, ReuseTopic, ReuseType } from '@datagouv/components-next'
import { RiDeleteBin6Line } from '@remixicon/vue'
import DescribeReuse from '~/components/Reuses/DescribeReuse.vue'
import type { ReuseForm } from '~/types/types'
import { toForm, toApi } from '~/utils/reuses'

const { t } = useI18n()
const { $api, $fileApi } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const { start, finish, isLoading } = useLoadingIndicator()

const localePath = useLocalePath()

const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse, refresh } = await useAPI<Reuse>(url, { lazy: true })

const { data: types } = await useAPI<Array<ReuseType>>('/api/1/reuses/types', { lazy: true })
const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics', { lazy: true })

const reuseForm = ref<ReuseForm | null>(null)
watchEffect(() => {
  reuseForm.value = toForm(reuse.value, types.value || [], topics.value || [])
})

async function save() {
  if (!reuseForm.value) throw new Error('No reuse form')

  try {
    start()

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

    toast.success(t('Réutilisation mise à jour!'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function deleteReuse() {
  start()
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
    finish()
  }
}

async function feature() {
  const method = reuse.value.featured ? 'DELETE' : 'POST'
  try {
    start()
    await $api(`/api/1/reuses/${route.params.id}/featured`, {
      method,
    })
    await refresh()
    toast.success(t('Réutilisation mise en avant !'))
  }
  catch {
    toast.error(t('Impossible de mettre en avant cette réutilisation'))
  }
  finally {
    finish()
  }
}
</script>
