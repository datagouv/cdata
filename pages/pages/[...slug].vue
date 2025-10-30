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
    <LoadingBlock :status>
      <div
        v-if="status === 'success' && data"
        :class="markdownClasses"
      >
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
      <div
        v-else
        class="py-9 prose"
      >
        <h1>{{ $t('Erreur 404') }}</h1>
        <p>{{ $t("La page que vous recherchez est introuvable.") }}</p>
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const route = useRoute()
const config = useRuntimeConfig()

const { data, status } = useFetch<{
  data: {
    title: string
    description?: string
  }
  extension: string
  content: string
}>(`/nuxt-api/pages/${route.params.slug ? route.params.slug.join('/') : ''}`)

const title = computed(() => data.value?.data.title)
const description = computed(() => data.value?.data.description)

useSeoMeta({
  title,
  description,
})

useHead({
  script: [
    {
      'data-udata': config.public.frontBase,
      'src': '/oembed.js',
      'body': true,
    },
  ],
})

const compTemplate = computed(() => data.value?.content)

const ComponentDefinedInSetup = computed(() => h({
  template: compTemplate.value,
}) as Component)
</script>
