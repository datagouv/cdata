<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div
      v-if="!isFullPageBlocs"
      class="container"
    >
      <div class="flex items-center">
        <Breadcrumb class="flex-1">
          <BreadcrumbItem
            v-for="crumb in breadcrumb"
            :key="crumb.to ?? 'current'"
            :to="crumb.to"
          >
            {{ crumb.label }}
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
    </div>

    <!-- Full page blocs mode: no header, just the blocs, the breadcrumb at the top of the first
         section, on its background. -->
    <EditoBlocs
      v-if="isFullPageBlocs"
      :blocs="post.blocs ?? []"
      editable
      untitled
      follow-links
      :sidemenu="post.sidemenu"
      :on-save="saveBlocs"
    >
      <template #breadcrumb>
        <Breadcrumb>
          <BreadcrumbItem
            v-for="crumb in breadcrumb"
            :key="crumb.to ?? 'current'"
            :to="crumb.to"
          >
            {{ crumb.label }}
          </BreadcrumbItem>
        </Breadcrumb>
      </template>
    </EditoBlocs>

    <!-- Header mode: news, and pages that are not full page blocs -->
    <div
      v-else
      class="mb-24"
    >
      <div class="container">
        <div class="max-w-4xl">
          <h1 class="text-4.5xl font-extrabold text-gray-title mb-0">
            {{ post.name }}
          </h1>
          <template v-if="post.published || isMeAdmin()">
            <TranslationT
              v-if="post.published"
              tag="p"
              class="text-xs mt-2 mb-0"
              keypath="Publié le {date}"
            >
              <template #date>
                <FormattedDate :date="post.published" />
              </template>
            </TranslationT>
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
            follow-links
            hide-edit-button
            :sidemenu="post.sidemenu"
            :on-save="saveBlocs"
          />
        </div>
        <div
          v-else
          class="container"
          :class="{ 'md:flex md:gap-8': anchoredBody?.headings.length }"
        >
          <HeadingsSidemenu
            v-if="anchoredBody?.headings.length"
            :headings="anchoredBody.headings"
            class="md:w-1/4 shrink-0"
          />
          <div class="max-w-4xl min-w-0 flex-1">
            <MarkdownViewer
              v-if="post.body_type === 'markdown'"
              :content="post.content"
              :min-heading="2"
              size="md"
              follow-links
            />
            <div
              v-else
              :class="markdownClasses"
              v-html="anchoredBody?.html ?? post.content"
            />
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { formatMarkdown, markdownClasses, MarkdownViewer, BrandedButton, toast, FormattedDate, TranslationT } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'
import HeadingsSidemenu from '~/components/Sidemenu/HeadingsSidemenu.vue'
import type { PageBloc } from '~/types/pages'
import type { Post } from '~/types/posts'

const props = defineProps<{
  post: Post
  onRefresh: () => Promise<unknown>
}>()

const config = useRuntimeConfig()
const siteConfig = useSiteConfig()
const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { t } = useTranslation()
const absoluteUrlToRelative = useAbsoluteUrlToRelative()

const blocsSection = ref<HTMLElement | null>(null)

// Only with the side menu: an HTML body is then rendered again with ids on its headings.
// Markdown goes through the options of the MarkdownViewer below to get the same ids.
const anchoredBody = computed(() => {
  if (!props.post.sidemenu || props.post.body_type === 'blocs') return null
  return anchorHeadings(props.post.body_type === 'markdown'
    ? formatMarkdown(props.post.content, { minDepth: 2, noHeadings: false })
    : props.post.content)
})

// Enter edit mode and scroll to the blocs, which start below the article image:
// with a tall image the user would otherwise see no visible change on click.
async function editContent() {
  await router.push({ query: { ...route.query, edit: 'true' } })
  await nextTick()
  blocsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const isFullPageBlocs = computed(() => props.post.kind === 'page' && props.post.body_type === 'blocs')

const breadcrumb = computed(() => [
  { label: t('Accueil'), to: '/' },
  ...(props.post.kind === 'page'
    ? props.post.ancestors.map(ancestor => ({ label: ancestor.name, to: ancestor.page }))
    : [{ label: t('Articles'), to: '/posts' }]),
  { label: props.post.name, to: undefined },
])

async function saveBlocs(blocs: Array<PageBloc>) {
  try {
    await $api(`/api/1/posts/${props.post.id}/`, {
      method: 'PUT',
      body: { blocs },
    })
    await props.onRefresh()
    toast.success(t('Page sauvegardée'))
  }
  catch (error) {
    toast.error(t('Erreur lors de la sauvegarde'))
    // The editor keeps the changes that could not be saved
    throw error
  }
}

useSeoMeta({
  title: () => props.post.name,
  description: () => props.post.headline || undefined,
  robots: () => props.post.published ? 'all' : 'noindex, nofollow',
})
defineOgImage('MainPage.takumi', {
  title: props.post.name,
  uri: props.post.kind === 'page' ? absoluteUrlToRelative(props.post.page) : '/posts',
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
