<template>
  <PageShow
    v-if="page"
    :page
    :edit="isEditing"
    :main-color
    @save="savePage"
    @cancel="exitEditMode"
  />
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import { toast } from 'vue-sonner'
import PageShow from './PageShow.vue'
import type { Page } from '~/types/pages'

const props = withDefaults(defineProps<{
  pageId: string
  mainColor?: ComponentProps<typeof PageShow>['mainColor']
}>(), {
  mainColor: 'primary',
})

const { $api } = useNuxtApp()
const { t } = useTranslation()
const route = useRoute()
const router = useRouter()

const { data: page, refresh } = await useAPI<Page>(`/api/1/pages/${props.pageId}`)

const isEditing = computed(() => route.query.edit === 'true')

async function savePage(updatedPage: Page) {
  try {
    await $api(`/api/1/pages/${props.pageId}/`, {
      method: 'PUT',
      body: updatedPage,
    })
    toast.success(t('Page sauvegardée'))
    await refresh()
    exitEditMode()
  }
  catch {
    toast.error(t('Erreur lors de la sauvegarde'))
  }
}

function exitEditMode() {
  router.replace({ query: { ...route.query, edit: undefined } })
}
</script>
