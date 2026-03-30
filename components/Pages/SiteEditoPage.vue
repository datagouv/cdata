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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiEyeLine, RiPencilLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import EditoBlocs from '~/components/Pages/EditoBlocs.vue'

const props = defineProps<{
  label: string
  publicPage: string
  siteKey: 'datasets_blocs' | 'reuses_blocs' | 'dataservices_blocs'
}>()

const { t } = useTranslation()

const { blocs, saveBlocs } = await useSiteBlocs(props.siteKey)
</script>
