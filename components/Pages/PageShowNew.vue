<template>
  <PageShow
    :page="emptyPage"
    :edit="true"
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
  siteKey: 'datasets_page' | 'reuses_page' | 'dataservices_page'
  mainColor?: ComponentProps<typeof PageShow>['mainColor']
}>(), {
  mainColor: 'primary',
})

const emit = defineEmits<{
  created: [id: string]
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()
const router = useRouter()
const route = useRoute()

const emptyPage: Page = {
  id: '',
  blocs: [],
}

async function savePage(updatedPage: Page) {
  try {
    const createdPage = await $api<Page>('/api/1/pages/', {
      method: 'POST',
      body: updatedPage,
    })

    await $api('/api/1/site/', {
      method: 'PATCH',
      body: { [props.siteKey]: createdPage.id },
    })

    toast.success(t('Page créée'))
    emit('created', createdPage.id)
    exitEditMode()
  }
  catch {
    toast.error(t('Erreur lors de la création de la page'))
  }
}

function exitEditMode() {
  router.replace({ query: { ...route.query, edit: undefined } })
}
</script>
