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
        { href: '/admin/site/edito/dataservices', label: t('API') },
      ]"
    />

    <div class="bg-white py-6">
      <EditoBlocs
        :blocs="blocs"
        edit
        :on-save="saveBlocs"
        @cancel="resetBlocs"
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
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'
import type { PageBloc } from '~/types/pages'

const props = defineProps<{
  label: string
  publicPage: string
  siteKey: 'datasets_blocs' | 'reuses_blocs' | 'dataservices_blocs'
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()

const { data: site, refresh } = await useAPI<Site>('/api/1/site/', {
  key: `site-edito-${props.siteKey}`,
  headers: { 'X-Fields': `{${props.siteKey}}` },
})

const blocs = ref<Array<PageBloc>>([])
const originalBlocs = ref<Array<PageBloc>>([])

watch(() => site.value, (siteValue) => {
  if (!siteValue) return
  const siteBlocs = siteValue[props.siteKey] ?? []
  blocs.value = siteBlocs
  originalBlocs.value = structuredClone(toRaw(siteBlocs))
}, { immediate: true })

function resetBlocs() {
  blocs.value = structuredClone(toRaw(originalBlocs.value))
}

const saveBlocs = async (updatedBlocs: Array<PageBloc>) => {
  if (!site.value) return

  try {
    await $api(`/api/1/site/`, {
      method: 'PATCH',
      body: { [props.siteKey]: updatedBlocs },
    })
    await refresh()
    toast.success(t('Page sauvegardée'))
  }
  catch {
    toast.error(t('Erreur lors de la sauvegarde'))
  }
}
</script>
