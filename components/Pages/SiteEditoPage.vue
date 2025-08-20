<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ $t('Édito') }}</BreadcrumbItem>
      <BreadcrumbItem>{{ label }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="fr-h3 fr-mb-5v">
      {{ $t("Édito") }}
    </h1>

    <TabLinks
      class="mb-5"
      :links="[
        { href: '/admin/site/edito/datasets', label: t('Jeux de données') },
        { href: '/admin/site/edito/reuses', label: t('Réutilisations') },
        { href: '/admin/site/edito/dataservices', label: t('APIs') },
      ]"
    />

    <PageForm
      v-if="page"
      v-model="page"
      :loading
      :public-page
      @submit="savePage"
    />
  </div>
</template>

<script setup lang="ts">
import type { Site } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import PageForm from '~/components/Pages/PageForm.vue'
import type { Page } from '~/types/pages'

const props = defineProps<{
  label: string
  publicPage: string
  siteKey: 'datasets_page_id' | 'reuses_page_id' | 'dataservices_page_id'
}>()

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useI18n()

const loading = ref(false)
const page = ref<Page | null>(null)
const { data: site, refresh } = await useAPI<Site>('/api/1/site/')

watchEffect(async () => {
  if (page.value) return
  if (!site.value) return

  if (site.value && site.value[props.siteKey]) {
    page.value = await $api(`/api/1/pages/${site.value[props.siteKey]}`)
  }
  else {
    page.value = { id: '', blocs: [] }
  }
})

const savePage = async () => {
  if (!page.value) return

  loading.value = true

  try {
    if (page.value.id) {
      page.value = await $api<Page>(`/api/1/pages/${site.value[props.siteKey]}/`, {
        method: 'PUT',
        body: page.value,
      })
    }
    else {
      page.value = await $api<Page>(`/api/1/pages/`, {
        method: 'POST',
        body: page.value,
      })
      const body = {} as Record<string, string>
      body[props.siteKey] = page.value.id
      await $api(`/api/1/site/`, { method: 'PATCH', body })
      await refresh()
    }
    toast.success(t('Page sauvegardée'))
  }
  finally {
    loading.value = false
  }
}
</script>
