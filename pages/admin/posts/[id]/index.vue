<template>
  <div>
    <DescribePost
      v-if="post && postForm"
      :post="postForm"
      type="update"
      :submit-label="t('Sauvegarder')"
      @submit="save"
    >
      <div class="mt-5 space-y-5">
        <BannerAction
          type="warning"
          :title="post.published ? $t(`Dépublier l'article`) : $t(`'Publier l'article`)"
        >
          <template v-if="post.published">
            {{ $t('Attention l’article ne sera plus visible.') }}
          </template>
          <template v-else>
            {{ $t("Attention l’article sera visible par tous une fois publié.") }}
          </template>

          <template #button>
            <BrandedButton
              @click="publishPost"
            >
              {{ post.published ? $t('Dépublier') : $t('Publier') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </div>
    </DescribePost>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, toast } from '@datagouv/components-next'
import DescribePost from '~/components/Posts/DescribePost.vue'
import type { Post, PostForm } from '~/types/posts'
import type { Page } from '~/types/pages'

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

    const formToSend = { ...form }

    if (form.body_type === 'blocs' && !form.content_as_page) {
      const page = await $api<Page>('/api/1/pages/', {
        method: 'POST',
        body: { blocs: [] },
      })
      formToSend.content_as_page = page.id
    }

    await $api(`/api/1/posts/${post.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(postToApi(formToSend)),
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
</script>
