<template>
  <div>
    <AdminBreadcrumb v-if="reuse">
      <BreadcrumbItem
        v-if="reuse.owner"
        :to="me.id === reuse.owner.id ? `/admin/me/reuses` : `/admin/users/${reuse.owner.id}/reuses`"
      >
        {{ t('Réutilisations') }}
      </BreadcrumbItem>
      <BreadcrumbItem
        v-else-if="reuse.organization"
        :to="`/admin/organizations/${reuse.organization.id}/reuses`"
      >
        {{ t('Réutilisations') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-if="reuse">
        {{ reuse.title }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <div v-if="reuse">
      <div class="flex flex-wrap items-center justify-between mb-5 gap-x-4 gap-y-2">
        <h1 class="flex-none w-full md:flex-1 font-bold text-2xl !mb-0">
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

      <div class="text-sm text-mentionGrey space-y-1.5 mb-5">
        <div class="space-x-1">
          <span>{{ $t('Statut') }}:</span>
          <AdminBadge
            size="xs"
            :type="getReuseStatus(reuse).type"
          >
            {{ getReuseStatus(reuse).label }}
          </AdminBadge>
        </div>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: getReuseAdminUrl(reuse), label: t('Metadata') },
          { href: `${getReuseAdminUrl(reuse)}/datasets`, label: t('Datasets') },
          { href: `${getReuseAdminUrl(reuse)}/discussions`, label: t('Discussions') },
          { href: `${getReuseAdminUrl(reuse)}/activities`, label: t('Activities') },
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

const me = useMe()
const route = useRoute()
const { getReuseStatus } = useReuseStatus()
const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse } = await useAPI<Reuse>(url, { lazy: true })
</script>
