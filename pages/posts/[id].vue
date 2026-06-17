<!-- eslint-disable vue/no-v-html -->
<template>
  <LoadingBlock
    v-slot="{ data: post }"
    :status="status"
    :data="post"
  >
    <!-- Full page blocs mode: no header, no breadcrumb, just the blocs -->
    <EditoBlocs
      v-if="isFullPageBlocs"
      :blocs="post.blocs ?? []"
      editable
      :on-save="saveBlocs"
    />

    <!-- Standard news mode -->
    <div
      v-else
      class="mb-24"
    >
      <div class="container">
        <div class="flex items-center">
          <Breadcrumb class="flex-1">
            <BreadcrumbItem
              to="/"
            >
              {{ $t('Accueil') }}
            </BreadcrumbItem>
            <BreadcrumbItem to="/posts">
              {{ $t('Articles') }}
            </BreadcrumbItem>
            <BreadcrumbItem v-if="post">
              {{ post.name }}
            </BreadcrumbItem>
          </Breadcrumb>

          <div
            v-if="isMeAdmin()"
            class="flex gap-2"
          >
            <EditButton
              :id="post.id"
              type="posts"
            />
            <BrandedButton
              v-if="post.body_type === 'blocs'"
              color="warning"
              :icon="RiEdit2Line"
              size="xs"
              @click="editContent"
            >
              {{ $t('Modifier le contenu') }}
            </BrandedButton>
          </div>
        </div>
        <div class="max-w-4xl">
          <h1 class="text-4.5xl font-extrabold text-gray-title mb-0">
            {{ post.name }}
          </h1>
          <template v-if="post.published || isMeAdmin()">
            <p
              v-if="post.published"
              class="text-xs mt-2 mb-0"
            >
              {{ $t('Publié le {date}', { date: formatDate(post.published) }) }}
            </p>
            <p
              v-else
              class="text-xs mb-0"
            >
              {{ $t('Pas encore publié') }}
            </p>
            <p class="mt-4 mb-6">
              {{ post.headline }}
            </p>
            <img
              v-if="post.image"
              :src="post.image"
              class="w-full h-auto mb-2"
            >
          </template>
          <template v-else>
            {{ $t(`Cet article n'est pas encore publié`) }}
          </template>
        </div>
      </div>
      <template v-if="post.published || isMeAdmin()">
        <!-- Blocs render full-width so the striped backgrounds reach the screen edges
             and the bloc toolbar sits in the side margins instead of over the content.
             pt-24 keeps the first striped band from hugging the header image, matching
             the vertical rhythm between consecutive blocs. -->
        <div
          v-if="post.body_type === 'blocs'"
          ref="blocsSection"
          class="pt-24"
        >
          <EditoBlocs
            :blocs="post.blocs ?? []"
            editable
            hide-edit-button
            :on-save="saveBlocs"
          />
        </div>
        <div
          v-else-if="post.body_type === 'markdown'"
          class="container"
        >
          <MarkdownViewer
            :content="post.content"
            :min-heading="2"
            size="md"
            class="max-w-4xl"
          />
        </div>
        <div
          v-else
          class="container"
        >
          <div
            class="max-w-4xl"
            :class="markdownClasses"
            v-html="post.content"
          />
        </div>

        <div class="container">
          <DiscussionsList
            v-if="config.public.allowDiscussionsInPosts"
            class="mt-16 max-w-4xl"
            type="Post"
            :subject="post"
          />
        </div>
      </template>
    </div>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { markdownClasses, MarkdownViewer, LoadingBlock, BrandedButton, toast, useFormatDate } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'
import type { PageBloc } from '~/types/pages'
import type { Post } from '~/types/posts'

// Keep the scroll position when toggling the `edit` query, otherwise the global
// scrollBehavior resets to the top and cancels the scroll-to-blocs below.
definePageMeta({
  keepScroll: true,
})

const config = useRuntimeConfig()
const siteConfig = useSiteConfig()
const route = useRoute()
const router = useRouter()
const { formatDate } = useFormatDate()

const blocsSection = ref<HTMLElement | null>(null)

// Enter edit mode and scroll to the blocs, which start below the article image:
// with a tall image the user would otherwise see no visible change on click.
async function editContent() {
  await router.push({ query: { ...route.query, edit: 'true' } })
  await nextTick()
  blocsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const url = computed(() => `/api/1/posts/${route.params.id}/`)
const { data: post, status, refresh: refreshPost } = await useAPI<Post>(url, { redirectOn404: true, lazy: true })

const { $api } = useNuxtApp()
const { t } = useTranslation()

const name = computed(() => post.value?.name)
const robots = computed(() => !post.value?.published ? 'noindex, nofollow' : 'all')

const isFullPageBlocs = computed(() => post.value?.kind === 'page' && post.value?.body_type === 'blocs')

async function saveBlocs(blocs: Array<PageBloc>) {
  if (!post.value) return
  try {
    await $api(`/api/1/posts/${post.value.id}/`, {
      method: 'PUT',
      body: { blocs },
    })
    await refreshPost()
    toast.success(t('Page sauvegardée'))
  }
  catch {
    toast.error(t('Erreur lors de la sauvegarde'))
  }
}

useSeoMeta({
  title: name,
  description: () => post.value?.headline || undefined,
  robots: robots,
})
defineOgImage('MainPage.takumi', {
  title: post.value?.name ?? 'Articles',
  uri: '/posts',
})
useHead({
  script: [
    {
      'data-udata': siteConfig.url,
      'src': '/oembed.js',
      'tagPosition': 'bodyClose',
    },
  ],
})
</script>
