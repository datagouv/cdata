<template>
  <PageShow
    v-if="page"
    :page
    editable
    :main-color
  />
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import PageShow from './PageShow.vue'
import type { Page } from '~/types/pages'

const props = withDefaults(defineProps<{
  pageId: string
  mainColor?: ComponentProps<typeof PageShow>['mainColor']
}>(), {
  mainColor: 'primary',
})

const { data: page } = await useAPI<Page>(`/api/1/pages/${props.pageId}`)
</script>
