<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          :sorted="sorted('title')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('title', direction)"
        >
          {{ t('Titre du jeu de données') }}
        </AdminTableTh>
        <AdminTableTh
          class="w-20"
          scope="col"
        >
          {{ t("Statut") }}
        </AdminTableTh>
        <AdminTableTh
          class="w-36"
          :sorted="sorted('created')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('created', direction)"
        >
          {{ t('Créé le') }}
        </AdminTableTh>
        <AdminTableTh
          class="min-w-56"
          :sorted="sorted('last_update')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('last_update', direction)"
        >
          {{ t('Dernière activité sur {site} le', { site: config.public.title }) }}
        </AdminTableTh>
        <AdminTableTh
          class="w-16"
          scope="col"
        >
          {{ t('Fichiers') }}
        </AdminTableTh>
        <AdminTableTh
          class="w-36"
          scope="col"
        >
          {{ t('Score') }}
        </AdminTableTh>
        <AdminTableTh scope="col">
          {{ t("Actions") }}
        </AdminTableTh>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="dataset in datasets"
        :key="dataset.id"
      >
        <td>
          <AdminContentWithTooltip>
            <CdataLink
              class="fr-link fr-reset-link"
              :to="getDatasetAdminUrl(dataset)"
            >
              <TextClamp
                :text="dataset.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </CdataLink>
          </AdminContentWithTooltip>
        </td>
        <td>
          <DatasetBadge :dataset />
        </td>
        <td>
          {{ formatDate(dataset.created_at) }}
        </td>
        <td>
          <div v-if="dataset.id in activities">
            <p>{{ formatDate(activities[dataset.id].created_at) }}</p>
            <p class="inline-flex items-center">
              {{ t('par ') }}
              <AvatarWithName
                class="fr-ml-1v"
                :user="activities[dataset.id].actor"
              />
            </p>
          </div>
          <template v-else>
            {{ formatDate(dataset.last_modified) }}
          </template>
        </td>
        <td class="font-mono text-right">
          {{ getFilesCount(dataset) }}
        </td>
        <td>
          <Tooltip>
            <DatasetQualityScore
              class="w-full"
              :score="dataset.quality.score"
            />
            <template #tooltip>
              <DatasetQualityTooltipContent :quality="dataset.quality" />
            </template>
          </Tooltip>
        </td>
        <td>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="dataset.page"
            :icon="RiEyeLine"
            icon-only
            external
            keep-margins-even-without-borders
          >
            {{ $t('Voir la page publique') }}
          </BrandedButton>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="getDatasetAdminUrl(dataset)"
            :icon="RiPencilLine"
            icon-only
            keep-margins-even-without-borders
          >
            {{ $t('Modifier') }}
          </BrandedButton>
          <slot
            name="actions"
            :dataset
          />
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { DatasetQualityScore, DatasetQualityTooltipContent, BrandedButton, AvatarWithName, Tooltip, useFormatDate } from '@datagouv/components-next'
import type { Activity, Dataset, DatasetV2 } from '@datagouv/components-next'
import { RiEyeLine, RiPencilLine } from '@remixicon/vue'
import AdminBadge from '../../AdminBadge/AdminBadge.vue'
import AdminContentWithTooltip from '../../AdminContentWithTooltip/AdminContentWithTooltip.vue'
import AdminTable from '../Table/AdminTable.vue'
import AdminTableTh from '../Table/AdminTableTh.vue'
import type { DatasetSortedBy, SortDirection } from '~/types/types'
import DatasetBadge from '~/components/AdminBadge/DatasetBadge.vue'

const emit = defineEmits<{
  (event: 'sort', column: DatasetSortedBy, direction: SortDirection): void
}>()

const props = withDefaults(defineProps<{
  activities?: Record<string, Activity>
  datasets: Array<Dataset | DatasetV2>
  sortDirection?: SortDirection
  sortedBy?: DatasetSortedBy
}>(), {
  activities: () => ({}),
})

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const { getDatasetStatus } = useDatasetStatus()

const config = useRuntimeConfig()

function updateSort(column: DatasetSortedBy, direction: SortDirection) {
  emit('sort', column, direction)
}

function sorted(column: DatasetSortedBy) {
  if (!props.sortedBy) {
    return undefined
  }
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}

function getFilesCount(dataset: Dataset | DatasetV2) {
  if (Array.isArray(dataset.resources)) {
    return dataset.resources.length
  }
  return dataset.resources.total
}
</script>
