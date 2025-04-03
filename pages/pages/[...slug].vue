<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="container mb-7">
    <LoadingBlock :status>
      <MarkdownViewer
        v-if="data.extension === 'md'"
        :content="data.content"
        :min-heading="1"
      />
      <ComponentDefinedInSetup
        v-else
      />
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { data, status } = useFetch(`/nuxt-api/pages/${route.params.slug ? route.params.slug.join('/') : ''}`)

const compTemplate = computed(() => data.value.content)

const ComponentDefinedInSetup = computed(() => h({
  class: markdownClasses,
  template: compTemplate.value,
}) as Component)
</script>
