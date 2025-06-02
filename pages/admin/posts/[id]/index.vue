<template>
  <div>
    <DescribePost
      v-if="post"
      :post="postForm"
      type="update"
      :submit-label="t('Save')"
      @submit="save"
    >
      <div class="mt-5 space-y-5">
        <BannerAction
          type="warning"
          :title="post.published ? $t('Unpublish the post') : $t('Publish the post')"
        >
          <template v-if="post.published">
            {{ $t('The post will be hidden.') }}
          </template>
          <template v-else>
            {{ $t("Please note that the post will be visible to everyone once published.") }}
          </template>

          <template #button>
            <BrandedButton
              @click="publishPost"
            >
              {{ post.published ? $t('Unpublish') : $t('Publish') }}
            </BrandedButton>
          </template>
        </BannerAction>
      </div>
    </DescribePost>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import DescribePost from '~/components/Posts/DescribePost.vue'
import type { Post, PostForm } from '~/types/posts'
import { toApi } from '~/utils/posts'

const { t } = useI18n()
const { $api, $fileApi } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const url = computed(() => `/api/1/posts/${route.params.id}/`)
const { data: post, refresh } = await useAPI<Post>(url, { lazy: true })
const postForm = computed(() => postToForm(post.value))

const loading = ref(false)

const save = async (form: PostForm) => {
  try {
    loading.value = true

    await $api(`/api/1/posts/${post.value.id}/`, {
      method: 'PUT',
      body: JSON.stringify(toApi(form)),
    })

    if (form.image && typeof form.image !== 'string') {
      const formData = new FormData()
      formData.set('file', form.image)
      await $fileApi(`/api/1/posts/${post.value.id}/image/`, {
        method: 'POST',
        body: formData,
      })
    }

    toast.success(t('Post updated!'))
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
