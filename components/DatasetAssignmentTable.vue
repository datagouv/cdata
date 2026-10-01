<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          scope="col"
          class="w-10"
        />
        <AdminTableTh scope="col">
          {{ t('Titre') }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-24"
        >
          {{ t('Statut') }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-28"
        >
          {{ t('Créé le') }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-32"
        >
          {{ t('Mis à jour le') }}
        </AdminTableTh>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="dataset in datasets"
        :key="dataset.id"
        class="cursor-pointer"
        @click="toggle(dataset.id)"
      >
        <td class="text-center">
          <input
            type="checkbox"
            :checked="selectedIds.has(dataset.id)"
            class="size-4 cursor-pointer"
            @click.stop="toggle(dataset.id)"
          >
        </td>
        <td>
          {{ dataset.title }}
        </td>
        <td>
          <DatasetBadge :dataset />
        </td>
        <td><FormattedDate :date="dataset.created_at" /></td>
        <td><FormattedDate :date="dataset.last_modified" /></td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { FormattedDate } from '@datagouv/components-next'
import type { DatasetV2 } from '@datagouv/components-next'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import DatasetBadge from '~/components/AdminBadge/DatasetBadge.vue'

defineProps<{
  datasets: Array<DatasetV2>
}>()

const selectedIds = defineModel<Set<string>>({ required: true })

const { t } = useTranslation()

function toggle(datasetId: string) {
  const next = new Set(selectedIds.value)
  if (next.has(datasetId)) {
    next.delete(datasetId)
  }
  else {
    next.add(datasetId)
  }
  selectedIds.value = next
}
</script>
