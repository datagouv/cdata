<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          :sorted="sorted('title')"
          scope="col"
          @sort="(direction: SortDirection) => $emit('sort', 'title', direction)"
        >
          {{ t("Reuse title") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Status") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('created')"
          scope="col"
          @sort="(direction: SortDirection) => $emit('sort', 'created', direction)"
        >
          {{ t("Created at") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('datasets')"
          scope="col"
          @sort="(direction: SortDirection) => $emit('sort', 'datasets', direction)"
        >
          {{ t("Datasets") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-16"
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
          @sort="(direction: SortDirection) => $emit('sort', 'views', direction)"
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
          :sorted="sorted('followers')"
          scope="col"
          @sort="(direction: SortDirection) => $emit('sort', 'followers', direction)"
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
        <AdminTableTh scope="col">
          {{ t("Actions") }}
        </AdminTableTh>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="reuse in reuses"
        :key="reuse.id"
      >
        <td>
          <AdminContentWithTooltip>
            <NuxtLinkLocale
              class="fr-link fr-reset-link"
              :href="getReuseAdminUrl(reuse)"
            >
              <TextClamp
                :text="reuse.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </NuxtLinkLocale>
          </AdminContentWithTooltip>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getStatus(reuse).type"
          >
            {{ getStatus(reuse).label }}
          </AdminBadge>
        </td>
        <td>
          <div v-if="reuse.id in activities">
            <p>{{ formatDate(activities[reuse.id].created_at) }}</p>
            <p class="inline-flex items-center">
              {{ t('by ') }}
              <AvatarWithName
                class="fr-ml-1v"
                :user="activities[reuse.id].actor"
              />
            </p>
          </div>
          <template v-else>
            {{ formatDate(reuse.created_at) }}
          </template>
        </td>
        <td class="font-mono text-right">
          {{ summarize(reuse.datasets.length) }}
        </td>
        <td class="font-mono text-right">
          {{ summarize(reuse.metrics.discussions) }}
        </td>
        <td class="font-mono text-right">
          {{ summarize(reuse.metrics.views) }}
        </td>
        <td class="font-mono text-right">
          {{ summarize(reuse.metrics.followers) }}
        </td>
        <td>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="reuse.page"
            :icon="RiEyeLine"
            icon-only
            external
            keep-margins-even-without-borders
          >
            {{ $t('Show public page') }}
          </BrandedButton>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="getReuseAdminUrl(reuse)"
            :icon="RiPencilLine"
            icon-only
            keep-margins-even-without-borders
          >
            {{ $t('Edit') }}
          </BrandedButton>
          <slot
            name="actions"
            :reuse
          />
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { AvatarWithName, BrandedButton, summarize } from '@datagouv/components-next'
import type { Reuse } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiEyeLine, RiPencilLine } from '@remixicon/vue'
import AdminBadge from '../../../components/AdminBadge/AdminBadge.vue'
import AdminTable from '../../../components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../../../components/AdminTable/Table/AdminTableTh.vue'
import AdminContentWithTooltip from '../../../components/AdminContentWithTooltip/AdminContentWithTooltip.vue'
import Tooltip from '../../../components/Tooltip/Tooltip.vue'
import type { Activity } from '~/types/activity'
import type { AdminBadgeType, ReuseSortedBy, SortDirection } from '~/types/types'

const props = defineProps<{
  activities: Record<string, Activity>
  reuses: Array<Reuse>
  sortedBy: ReuseSortedBy
  sortDirection: SortDirection
}>()

defineEmits<{
  (event: 'sort', column: ReuseSortedBy, direction: SortDirection): void
}>()

const { t } = useI18n()

function sorted(column: ReuseSortedBy) {
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}

function getStatus(reuse: Reuse): { label: string, type: AdminBadgeType } {
  if (reuse.deleted) {
    return {
      label: t('Deleted'),
      type: 'danger',
    }
  }
  else if (reuse.archived) {
    return {
      label: t('Archived'),
      type: 'warning',
    }
  }
  else if (reuse.private) {
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
