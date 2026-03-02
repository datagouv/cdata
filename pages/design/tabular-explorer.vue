<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/tabular-explorer">
        {{ $t('Tabular Explorer') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="mb-3">
      Tabular Explorer
    </h1>

    <div class="flex items-end gap-3 mb-6">
      <form
        class="flex-1"
        @submit.prevent="key++"
      >
        <label
          for="resource-id"
          class="block text-sm font-medium mb-1"
        >Resource ID</label>
        <input
          id="resource-id"
          v-model="resourceId"
          type="text"
          class="fr-input w-full"
          placeholder="Resource ID"
        >
        <button
          type="button"
          @click="resourceId = '79e2c14d-8278-4407-84b5-e8c279fc578c'"
        >
          indicateurs data.gouv
        </button>
        <button
          type="button"
          @click="resourceId = 'd0574a19-9005-4fff-92db-050b5fb2c72c'"
        >
          données véhicules
        </button>
      </form>
    </div>

    <TabularExplorer
      :key
      :resource-id="resourceId"
    />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import { TabularExplorer } from '@datagouv/components-next'

const key = ref(1)
const resourceId = ref('d0574a19-9005-4fff-92db-050b5fb2c72c')
</script>
