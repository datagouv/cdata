<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        external
      >
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/posts">
        {{ $t('Articles') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Formulaire de publication') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <Stepper
      :steps
      :current-step
    />

    <DescribePost
      v-if="currentStep === 1"
      :post="postForm"
      type="create"
      :submit-label="t('Suivant')"
      @submit="postNext"
    />
    <PostContentForm
      v-if="currentStep === 2"
      :post="postForm"
      type="create"
      :submit-label="t('Sauvegarder')"
      @submit="save"
    />
    <div class="h-64" />
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DescribePost from '~/components/Posts/DescribePost.vue'
import PostContentForm from '~/components/Posts/PostContentForm.vue'
import Stepper from '~/components/Stepper/Stepper.vue'
import type { Post, PostForm } from '~/types/posts'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { $api, $fileApi } = useNuxtApp()
const me = useMe()

const steps = computed(() => [
  t('Décrivez votre article'),
  t('Contenu'),
])

const POST_FORM_STATE = 'post-form'

const postForm = useState<PostForm>(POST_FORM_STATE, () => ({
  name: '',
  body_type: 'markdown',
  content: '',
  credit_to: '',
  credit_url: '',
  headline: '',
  published: null,
  owner: me.value,
  tags: [],
  image: null,
} satisfies PostForm))

const POST_LOADING_STATE = 'post-loading'

const newPost = useState<Post | null>(
  'new-post',
  () => null,
)

const loading = useState<boolean>(
  POST_LOADING_STATE,
  () => false,
)

const currentStep = computed(() => parseInt(route.query.step as string) || 1)
const isCurrentStepValid = computed(() => {
  if (currentStep.value < 1) return false
  if (currentStep.value > steps.value.length) return false
  if (currentStep.value === 2 && (!postForm.value || !postForm.value.name)) return false

  return true
})

function moveToStep(step: number) {
  return navigateTo({ path: route.path, query: { ...route.query, step } })
}

function postNext(form: PostForm) {
  postForm.value = form
  moveToStep(2)
}

async function save(form: { content: string }) {
  try {
    loading.value = true
    postForm.value.content = form.content
    newPost.value = await $api<Post>('/api/1/posts/', {
      method: 'POST',
      body: JSON.stringify(postToApi(postForm.value)),
    })

    if (postForm.value.image && typeof postForm.value.image !== 'string') {
      const formData = new FormData()
      formData.set('file', postForm.value.image)
      await $fileApi(`/api/1/posts/${newPost.value.id}/image/`, {
        method: 'POST',
        body: formData,
      })
    }
    await navigateTo(localePath(`/admin/posts/${newPost.value.id}`))
  }
  finally {
    clearNuxtState(POST_LOADING_STATE)
  }
}

watchEffect(() => {
  if (!isCurrentStepValid.value) {
    moveToStep(1)
  }
})
</script>
