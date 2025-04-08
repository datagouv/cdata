<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="container mb-7">
    <Breadcrumb>
      <BreadcrumbItem
        :external="true"
        to="/"
      >
        Accueil
      </BreadcrumbItem>
      <BreadcrumbItem v-if="data?.data">
        {{ data.data.title }}
      </BreadcrumbItem>
    </Breadcrumb>
    <LoadingBlock :status>
      <div v-if="status === 'success' && data">
        <MarkdownViewer
          v-if="data.data.extension === 'md'"
          :content="data.content"
          :min-heading="1"
          size="md"
        />
        <ComponentDefinedInSetup
          v-else
          :class="markdownClasses"
        />
      </div>
      <div
        v-else
        class="py-9 prose"
      >
        <h1>{{ $t('Error 404') }}</h1>
        <p>{{ $t("The page you're looking for cannot be found.") }}</p>
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const route = useRoute()

const { data, status } = useFetch<{
  data: {
    extension: string
    title: string
  }
  content: string
}>(`/nuxt-api/pages/${route.params.slug ? route.params.slug.join('/') : ''}`)

const title = computed(() => data.value?.data.title)

useSeoMeta({
  title,
})

const compTemplate = computed(() => data.value?.content)

const ComponentDefinedInSetup = computed(() => h({
  template: compTemplate.value,
}) as Component)
</script>
