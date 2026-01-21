<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ $t('Édito') }}</BreadcrumbItem>
      <BreadcrumbItem>{{ label }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
      <h1 class="fr-h3 mb-0">
        {{ $t("Édito") }}
      </h1>
      <div class="flex gap-2">
        <BrandedButton
          color="secondary"
          :href="publicPage"
          :icon="RiEyeLine"
          target="_blank"
        >
          {{ $t('Voir la page publique') }}
        </BrandedButton>
        <BrandedButton
          :href="`${publicPage}?edit=true`"
          :icon="RiPencilLine"
        >
          {{ $t('Éditer sur la page publique') }}
        </BrandedButton>
      </div>
    </div>

    <TabLinks
      class="mb-5"
      :links="[
        { href: '/admin/site/edito/datasets', label: t('Jeux de données') },
        { href: '/admin/site/edito/reuses', label: t('Réutilisations') },
        { href: '/admin/site/edito/dataservices', label: t('APIs') },
      ]"
    />

    <div
      v-if="page"
      class="bg-white py-6"
    >
      <PageShow
        :page
        edit
        @save="savePage"
        @cancel="resetPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { toRaw } from 'vue'
import { RiEyeLine, RiPencilLine } from '@remixicon/vue'
import type { Site } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import PageShow from '~/components/Pages/PageShow.vue'
import type { Page } from '~/types/pages'

const props = defineProps<{
  label: string
  publicPage: string
  siteKey: 'datasets_page' | 'reuses_page' | 'dataservices_page'
}>()

definePageMeta({
  keepScroll: true,
})

const { $api } = useNuxtApp()
const { t } = useTranslation()

const page = ref<Page | null>(null)
const originalPage = ref<Page | null>(null)
const { data: site, refresh } = await useAPI<Site>('/api/1/site/')

watchEffect(async () => {
  if (page.value) return
  if (!site.value) return

  if (site.value && site.value[props.siteKey]) {
    const fetched = await $api<Page>(`/api/1/pages/${site.value[props.siteKey]}/`)
    page.value = fetched
    originalPage.value = structuredClone(toRaw(fetched))
  }
  else {
    page.value = { id: '', blocs: [] }
    originalPage.value = { id: '', blocs: [] }
  }
})

function resetPage() {
  if (originalPage.value) {
    page.value = structuredClone(toRaw(originalPage.value))
  }
}

const savePage = async (updatedPage: Page) => {
  if (!updatedPage) return
  if (!site.value) return

  try {
    if (updatedPage.id) {
      page.value = await $api<Page>(`/api/1/pages/${site.value[props.siteKey]}/`, {
        method: 'PUT',
        body: updatedPage,
      })
    }
    else {
      page.value = await $api<Page>(`/api/1/pages/`, {
        method: 'POST',
        body: updatedPage,
      })
      const body = {} as Record<string, string>
      body[props.siteKey] = page.value.id
      await $api(`/api/1/site/`, { method: 'PATCH', body })
      await refresh()
    }
    originalPage.value = structuredClone(toRaw(page.value))
    toast.success(t('Page sauvegardée'))
  }
  catch {
    toast.error(t('Erreur lors de la sauvegarde'))
  }
}
</script>
