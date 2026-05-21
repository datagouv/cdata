<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="container mb-7">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
      >
        Accueil
      </BreadcrumbItem>
      <BreadcrumbItem v-if="data?.data">
        {{ data.data.title }}
      </BreadcrumbItem>
    </Breadcrumb>
    <LoadingBlock
      v-slot="{ data }"
      :status
      :data="data"
    >
      <div :class="markdownClasses">
        <MarkdownViewer
          v-if="data.extension === 'md'"
          :content="data.content"
          :min-heading="1"
          size="md"
        />
        <ComponentDefinedInSetup
          v-else
        />
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { LoadingBlock, markdownClasses, MarkdownViewer } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const route = useRoute()
const siteConfig = useSiteConfig()

// An empty slug (/pages) is not a valid page: return a clean 404 right away.
// Fetching it would build the URL `/nuxt-api/pages/` whose trailing slash gets
// 308-redirected, which ofetch follows without raising an error.
const slug = route.params.slug ? (route.params.slug as string[]).join('/') : ''
if (!slug) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}

const { data, status, error } = await useFetch<{
  data: {
    title: string
    description?: string
  }
  extension: string
  content: string
}>(`/nuxt-api/pages/${slug}`)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page Not Found', fatal: true })
}

const title = computed(() => data.value?.data.title)
const description = computed(() => data.value?.data.description)

useSeoMeta({
  title,
  description,
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

const compTemplate = computed(() => data.value?.content)

const ComponentDefinedInSetup = computed(() => h({
  template: compTemplate.value,
}) as Component)
</script>
