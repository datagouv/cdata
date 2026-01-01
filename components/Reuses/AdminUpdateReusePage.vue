<template>
  <LoadingBlock
    v-slot="{ data: reuse }"
    :status
    :data="reuse"
  >
    <DescribeReuse
      v-if="reuseForm"
      v-model="reuseForm"
      type="update"
      @feature="feature"
      @submit="save"
    >
      <template #top>
        <BannerAction
          v-if="!reuse.deleted && !reuse.archived"
          class="mb-4"
          type="primary"
          :title="$t('Modifier la visibilité de la réutilisation')"
        >
          <TranslationT
            v-if="reuse.private"
            keypath="Cette réutilisation est actuellement {status}. Seul vous ou les membres de votre organisation pouvez la voir et y contribuer."
          >
            <template #status>
              <strong>{{ $t('privée') }}</strong>
            </template>
          </TranslationT>
          <TranslationT
            v-else
            keypath="Cette réutilisation est actuellement {status}. N'importe qui sur Internet peut voir cette réutilisation."
          >
            <template #status>
              <strong>{{ $t('publique') }}</strong>
            </template>
          </TranslationT>

          <template #button>
            <BrandedButton
              :loading="isLoading"
              @click="switchReusePrivate"
            >
              {{ reuse.private ? $t('Publier la réutilisation') : $t('Passer en brouillon') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="reuse.deleted"
          class="mb-4"
          type="warning"
          :title="$t('Restaurer la réutilisation')"
        >
          {{ $t("Sans restauration, la réutilisation sera définitivement supprimée dans la nuit.") }}

          <template #button>
            <BrandedButton
              :icon="RiArrowGoBackLine"
              :loading="isLoading"
              @click="restoreReuse"
            >
              {{ $t('Restaurer') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </template>
      <template #button>
        <BrandedButton
          type="submit"
          color="primary"
          :loading="isLoading"
        >
          {{ t("Sauvegarder") }}
        </BrandedButton>
      </template>
      <div class="mt-5 space-y-5">
        <TransferBanner
          type="Reuse"
          :subject="reuse"
          :label="$t('Transférer cette réutilisation')"
        />
        <BannerAction
          type="warning"
          :title="reuse.archived ? $t('Désarchiver la réutilisation') : $t('Archiver la réutilisation')"
        >
          {{ $t("Une réutilisation archivée n'est plus indexée mais reste accessible aux utilisateurs avec un lien direct.") }}

          <template #button>
            <BrandedButton
              :icon="RiArchiveLine"
              :loading="isLoading"
              @click="archiveReuse"
            >
              {{ reuse.archived ? $t('Désarchiver') : $t('Archiver') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          v-if="!reuse.deleted"
          class="mt-5"
          type="danger"
          :title="$t('Supprimer cette réutilisation')"
        >
          {{ $t("Attention, cette action ne peut pas être annulée.") }}
          <template #button>
            <AdminDeleteModal
              :title="$t('Êtes-vous sûr de vouloir supprimer cette réutilisation ?')"
              :delete-url="`/api/1/reuses/${route.params.id}`"
              :delete-button-label="$t('Supprimer cette réutilisation')"
              :recipient-email="getOwnerEmail(reuse)"
              object-type="reuse"
              :object-title="reuse.title"
              @deleted="onReuseDeleted"
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
                {{ $t("Cette action ne peut pas être annulée.") }}
              </p>
            </AdminDeleteModal>
          </template>
        </BannerAction>
      </div>
    </DescribeReuse>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, LoadingBlock, TranslationT, toast } from '@datagouv/components-next'
import type { Reuse, ReuseTopic, ReuseType } from '@datagouv/components-next'
import { RiArchiveLine, RiArrowGoBackLine, RiDeleteBin6Line } from '@remixicon/vue'
import DescribeReuse from '~/components/Reuses/DescribeReuse.vue'
import AdminDeleteModal from '~/components/Admin/AdminDeleteModal.vue'
import type { ReuseForm } from '~/types/types'
import { getOwnerEmail } from '~/utils/owner'

const { t } = useTranslation()
const { $api, $fileApi } = useNuxtApp()

const route = useRoute()
const { start, finish, isLoading } = useLoadingIndicator()

const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse, status, refresh } = await useAPI<Reuse>(url, { redirectOn404: true })

const { data: types } = await useAPI<Array<ReuseType>>('/api/1/reuses/types', { lazy: true })
const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics', { lazy: true })

const reuseForm = ref<ReuseForm | null>(null)
watchEffect(() => {
  if (!reuse.value) return
  reuseForm.value = reuseToForm(reuse.value, types.value || [], topics.value || [])
})

async function save() {
  if (!reuseForm.value) throw new Error('No reuse form')
  if (!reuse.value) return

  try {
    start()

    await $api(`/api/1/reuses/${reuse.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(reuseToApi(reuseForm.value, { private: reuseForm.value.private })),
    })

    if (reuseForm.value.image && typeof reuseForm.value.image !== 'string') {
      const formData = new FormData()
      formData.set('file', reuseForm.value.image)
      await $fileApi(`/api/1/reuses/${reuse.value.id}/image`, {
        method: 'POST',
        body: formData,
      })
    }

    toast.success(t('Réutilisation mise à jour !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

function onReuseDeleted() {
  refresh()
  toast.success(t('Réutilisation supprimée !'))
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}

async function archiveReuse() {
  if (!reuseForm.value) throw new Error('No reuse form')
  if (!reuse.value) return

  try {
    start()

    await $api(`/api/1/reuses/${reuse.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(reuseToApi(reuseForm.value, { archived: reuseForm.value.archived ? null : (new Date()).toISOString() })),
    })

    await refresh()
    if (reuse.value?.archived) {
      toast.success(t('Réutilisation archivée !'))
    }
    else {
      toast.success(t('Réutilisation désarchivée !'))
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function switchReusePrivate() {
  if (!reuseForm.value) throw new Error('No reuse form')
  if (!reuse.value) return

  try {
    start()

    await $api(`/api/1/reuses/${reuse.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(reuseToApi(reuseForm.value, { private: !reuseForm.value.private })),
    })

    await refresh()
    if (reuse.value?.private) {
      toast.success(t('Réutilisation passée en brouillon !'))
    }
    else {
      toast.success(t('Réutilisation publiée !'))
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function restoreReuse() {
  if (!reuseForm.value) throw new Error('No reuse form')
  if (!reuse.value) return

  try {
    start()

    await $api(`/api/1/reuses/${reuse.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(reuseToApi(reuseForm.value, { deleted: null })),
    })

    await refresh()
    toast.success(t('Réutilisation restaurée !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
  finally {
    finish()
  }
}

async function feature() {
  if (!reuse.value) return
  const method = reuse.value.featured ? 'DELETE' : 'POST'
  try {
    start()
    await $api(`/api/1/reuses/${route.params.id}/featured`, {
      method,
    })
    await refresh()
    if (method === 'DELETE') {
      toast.success(t('Réutilisation retirée de la mise en avant !'))
    }
    else {
      toast.success(t('Réutilisation mise en avant !'))
    }
  }
  catch {
    toast.error(t('Impossible de mettre en avant cette réutilisation'))
  }
  finally {
    finish()
  }
}
</script>
