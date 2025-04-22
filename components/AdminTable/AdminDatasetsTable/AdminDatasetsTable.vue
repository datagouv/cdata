<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          :sorted="sorted('title')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('title', direction)"
        >
          {{ t('Title of the dataset') }}
        </AdminTableTh>
        <AdminTableTh
          class="w-20"
          scope="col"
        >
          {{ t("Status") }}
        </AdminTableTh>
        <AdminTableTh
          class="w-36"
          :sorted="sorted('created')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('created', direction)"
        >
          {{ t('Created at') }}
        </AdminTableTh>
        <AdminTableTh
          class="w-36"
          :sorted="sorted('last_update')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('last_update', direction)"
        >
          {{ t('Updated at') }}
        </AdminTableTh>
        <AdminTableTh
          class="w-16"
          scope="col"
        >
          {{ t('Files') }}
        </AdminTableTh>
        <AdminTableTh
          class="w-36"
          scope="col"
        >
          {{ t('Score') }}
        </AdminTableTh>
        <AdminTableTh
          class="w-16"
          scope="col"
        >
          <Tooltip>
            <span
              class="fr-icon--sm fr-icon-chat-3-line"
              aria-hidden="true"
            />
            <template #tooltip>
              {{ t('Discussions') }}
            </template>
          </Tooltip>
        </AdminTableTh>
        <AdminTableTh
          class="w-16"
          :sorted="sorted('views')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('views', direction)"
        >
          <Tooltip>
            <span
              class="fr-icon--sm fr-icon-eye-line"
              aria-hidden="true"
            />
            <template #tooltip>
              {{ t('Views') }}
            </template>
          </Tooltip>
        </AdminTableTh>
        <AdminTableTh
          class="w-16"
          scope="col"
        >
          <Tooltip>
            <span
              class="fr-icon--sm fr-icon-download-line"
              aria-hidden="true"
            />
            <template #tooltip>
              {{ t('Downloads') }}
            </template>
          </Tooltip>
        </AdminTableTh>
        <AdminTableTh
          class="w-16"
          :sorted="sorted('reuses')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('reuses', direction)"
        >
          <Tooltip>
            <span
              class="fr-icon--sm fr-icon-line-chart-line"
              aria-hidden="true"
            />
            <template #tooltip>
              {{ t('Reuses') }}
            </template>
          </Tooltip>
        </AdminTableTh>
        <AdminTableTh
          class="w-16"
          :sorted="sorted('followers')"
          scope="col"
          @sort="(direction: SortDirection) => updateSort('followers', direction)"
        >
          <Tooltip>
            <span
              class="fr-icon--sm fr-icon-star-s-line"
              aria-hidden="true"
            />
            <template #tooltip>
              {{ t('Favorites') }}
            </template>
          </Tooltip>
        </AdminTableTh>
        <AdminTableTh
          v-if="$slots.actions"
          class="w-16"
          scope="col"
        >
          {{ $t('Actions') }}
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
            <NuxtLinkLocale
              class="fr-link fr-reset-link"
              :to="getDatasetAdminUrl(dataset)"
            >
              <TextClamp
                :text="dataset.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </NuxtLinkLocale>
          </AdminContentWithTooltip>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getStatus(dataset).type"
          >
            {{ getStatus(dataset).label }}
          </AdminBadge>
        </td>
        <td>
          {{ formatDate(dataset.created_at) }}
        </td>
        <td>
          {{ formatDate(dataset.last_modified) }}
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
        <td class="font-mono text-right">
          {{ summarize(dataset.metrics.discussions) }}
        </td>
        <td class="font-mono text-right">
          {{ summarize(dataset.metrics.views) }}
        </td>
        <td class="font-mono text-right">
          {{ summarize(dataset.metrics.resources_downloads ?? 0) }}
        </td>
        <td class="font-mono text-right">
          {{ summarize(dataset.metrics.reuses) }}
        </td>
        <td class="font-mono text-right">
          {{ summarize(dataset.metrics.followers) }}
        </td>
        <td v-if="$slots.actions">
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
import { summarize, DatasetQualityScore, DatasetQualityInline, DatasetQualityTooltipContent } from '@datagouv/components-next'
import type { Dataset, DatasetV2 } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import AdminBadge from '../../AdminBadge/AdminBadge.vue'
import AdminContentWithTooltip from '../../AdminContentWithTooltip/AdminContentWithTooltip.vue'
import AdminTable from '../Table/AdminTable.vue'
import AdminTableTh from '../Table/AdminTableTh.vue'
import Tooltip from '../../Tooltip/Tooltip.vue'
import type { AdminBadgeType, DatasetSortedBy, SortDirection } from '~/types/types'

const emit = defineEmits<{
  (event: 'sort', column: DatasetSortedBy, direction: SortDirection): void
}>()

const props = defineProps<{
  datasets: Array<Dataset | DatasetV2>
  sortDirection?: SortDirection
  sortedBy?: DatasetSortedBy
}>()

const { t } = useI18n()

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

function getStatus(dataset: Dataset | DatasetV2): { label: string, type: AdminBadgeType } {
  if (dataset.deleted) {
    return {
      label: t('Deleted'),
      type: 'danger',
    }
  }
  else if (dataset.archived) {
    return {
      label: t('Archived'),
      type: 'warning',
    }
  }
  else if (dataset.private) {
    return {
      label: t('Draft'),
      type: 'secondary',
    }
  }
  else {
    return {
      label: t('Public'),
      type: 'primary',
    }
  }
}
</script>
