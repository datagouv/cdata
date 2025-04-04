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
          v-if="data.extension === 'md'"
          :content="data.content"
          :min-heading="1"
        />
        <ComponentDefinedInSetup
          v-else
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

const { data, status } = useFetch(`/nuxt-api/pages/${route.params.slug ? route.params.slug.join('/') : ''}`)

const title = computed(() => data.value?.data.title)

useSeoMeta({
  title,
})

const compTemplate = computed(() => data.value.content)

const ComponentDefinedInSetup = computed(() => h({
  class: markdownClasses,
  template: compTemplate.value,
}) as Component)
</script>
