<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Tableau de bord des aperçus') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Tableau de bord des aperçus') }}
    </h1>

    <TabGroup size="sm">
      <TabList class="max-w-full overflow-x-auto">
        <Tab>{{ t('Statistique') }}</Tab>
        <Tab>{{ t('Fichiers') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <PreviewFormatStatsTable :resource-id="statsResourceId" />
        </TabPanel>
        <TabPanel>
          <TabularExplorer :resource-id="resourcesResourceId" />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels, TabularExplorer } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import PreviewFormatStatsTable from './PreviewFormatStatsTable.vue'

const { t } = useTranslation()

const resourcesResourceId = '982d9dd0-365a-4c4b-8a83-75dec40c36bb'
const statsResourceId = '33cf9a65-3f77-4d88-acd1-bca420d83e60'
</script>
