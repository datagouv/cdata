<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem v-if="reuse">
        {{ reuse.title }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <div v-if="reuse">
      <div class="flex items-center justify-between mb-5">
        <h1 class="fr-h3 !mb-0">
          {{ reuse.title }}
        </h1>
        <BrandedButton
          :href="reuse.page"
          color="secondary"
          size="xs"
          :icon="RiEyeLine"
        >
          {{ t('See the reuse page') }}
        </BrandedButton>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: getReuseAdminUrl(reuse), label: t('Métadonnées') },
          { href: `${getReuseAdminUrl(reuse)}/datasets`, label: t('Associated datasets') },
        ]"
      />

      <NuxtPage
        :page-key="route => route.fullPath"
        :reuse
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Reuse } from '@datagouv/components-next'
import { RiEyeLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TabLinks from '~/components/TabLinks.vue'

const { t } = useI18n()

const { currentOrganization } = useCurrentOwned()

const route = useRoute()
const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse } = await useAPI<Reuse>(url, { lazy: true })
</script>
