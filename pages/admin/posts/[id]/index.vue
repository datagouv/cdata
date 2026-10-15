<template>
  <div>
    <DescribePost
      v-if="post && postForm"
      :post="postForm"
      type="update"
      :submit-label="t('Sauvegarder')"
      :loading
      @submit="save"
    >
      <div class="mt-5 space-y-5">
        <BannerAction
          type="warning"
          :title="post.published ? $t(`Dépublier l'article`) : $t(`Publier l'article`)"
        >
          <template v-if="post.published">
            {{ $t("Attention l'article ne sera plus visible.") }}
          </template>
          <template v-else>
            {{ $t("Attention l'article sera visible par tous une fois publié.") }}
          </template>

          <template #button>
            <BrandedButton
              @click="publishPost"
            >
              {{ post.published ? $t('Dépublier') : $t('Publier') }}
            </BrandedButton>
          </template>
        </BannerAction>
        <BannerAction
          type="danger"
          :title="$t(`Supprimer l'article`)"
        >
          {{ $t("Attention, cette action ne peut pas être annulée.") }}
          <template #button>
            <ModalWithButton
              :title="$t(`Êtes-vous sûr de vouloir supprimer cet article ?`)"
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
                    :loading="deleting"
                    @click="deletePost"
                  >
                    {{ $t(`Supprimer l'article`) }}
                  </BrandedButton>
                </div>
              </template>
            </ModalWithButton>
          </template>
        </BannerAction>
      </div>
    </DescribePost>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, toast } from '@datagouv/components-next'
import { RiDeleteBin6Line } from '@remixicon/vue'
import DescribePost from '~/components/Posts/DescribePost.vue'
import type { Post, PostForm } from '~/types/posts'

const { t } = useTranslation()
const { $api, $fileApi } = useNuxtApp()

const route = useRoute()
const url = computed(() => `/api/1/posts/${route.params.id}/`)
const { data: post, refresh } = await useAPI<Post>(url, { redirectOn404: true })
const postForm = computed(() => post.value ? postToForm(post.value) : null)

const loading = ref(false)

const save = async (form: PostForm) => {
  if (!post.value) return

  try {
    loading.value = true

    await $api(`/api/1/posts/${post.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(postToApi(form)),
    })

    if (form.image && typeof form.image !== 'string') {
      const formData = new FormData()
      formData.set('file', form.image)
      await $fileApi(`/api/1/posts/${post.value.id}/image/`, {
        method: 'POST',
        body: formData,
      })
    }

    toast.success(t('Article mis à jour !'))
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    refresh()
  }
  finally {
    loading.value = false
  }
}

const publishPost = async () => {
  if (!post.value) return

  await $api(`/api/1/posts/${post.value.id}/publish`, {
    method: post.value.published ? 'DELETE' : 'POST',
  })
  await refresh()
}

const deleting = ref(false)

const deletePost = async () => {
  if (!post.value) return

  deleting.value = true
  try {
    await $api(`/api/1/posts/${post.value.id}/`, {
      method: 'DELETE',
    })
    toast.success(t('Article supprimé !'))
    await navigateTo('/admin/site/posts', { replace: true })
  }
  finally {
    deleting.value = false
  }
}
</script>
