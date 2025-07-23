<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ $t('Édito') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="fr-h3 fr-mb-5v">
      {{ $t("Édito") }}
    </h1>

    <PageForm
      v-if="page"
      v-model="page"
      :loading
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

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useI18n()

const loading = ref(false)
const page = ref<Page | null>(null)
const { data: site } = await useAPI<Site>('/api/1/site')

watchEffect(async () => {
  if (page.value) return
  if (!site.value) return

  if (site.value && site.value.datasets_page_id) {
    page.value = await $api(`/api/1/pages/${site.value.datasets_page_id}`)
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
      page.value = await $api<Page>(`/api/1/pages/${site.value.datasets_page_id}/`, {
        method: 'PUT',
        body: page.value,
      })
    }
    else {
      page.value = await $api<Page>(`/api/1/pages/`, {
        method: 'POST',
        body: page.value,
      })
    }

    await $api(`/api/1/site/`, {
      method: 'PATCH',
      body: {
        datasets_page_id: page.value.id,
      },
    })
    toast.success(t('Page sauvegardée'))
  }
  finally {
    loading.value = false
  }
}
</script>
