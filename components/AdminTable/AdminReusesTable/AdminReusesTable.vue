<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          :sorted="sorted('title')"
          scope="col"
          @sort="(direction: SortDirection) => $emit('sort', 'title', direction)"
        >
          {{ t("Titre de la réutilisation") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Statut") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('created')"
          scope="col"
          @sort="(direction: SortDirection) => $emit('sort', 'created', direction)"
        >
          {{ t("Créé le") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('datasets')"
          scope="col"
          @sort="(direction: SortDirection) => $emit('sort', 'datasets', direction)"
        >
          {{ t("Jeux de données") }}
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
            <CdataLink
              class="fr-link fr-reset-link"
              :href="getReuseAdminUrl(reuse)"
            >
              <TextClamp
                :text="reuse.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </CdataLink>
          </AdminContentWithTooltip>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getReuseStatus(reuse).type"
          >
            {{ getReuseStatus(reuse).label }}
          </AdminBadge>
        </td>
        <td>
          <div v-if="reuse.id in activities">
            <p>{{ formatDate(activities[reuse.id].created_at) }}</p>
            <p class="inline-flex items-center">
              {{ t('par ') }}
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
            {{ $t('Voir la page publique') }}
          </BrandedButton>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="getReuseAdminUrl(reuse)"
            :icon="RiPencilLine"
            icon-only
            keep-margins-even-without-borders
          >
            {{ $t('Modifier') }}
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
import { AvatarWithName, BrandedButton, summarize, useFormatDate } from '@datagouv/components-next'
import type { Reuse } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiEyeLine, RiPencilLine } from '@remixicon/vue'
import AdminBadge from '../../../components/AdminBadge/AdminBadge.vue'
import AdminTable from '../../../components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../../../components/AdminTable/Table/AdminTableTh.vue'
import AdminContentWithTooltip from '../../../components/AdminContentWithTooltip/AdminContentWithTooltip.vue'
import type { Activity } from '~/types/activity'
import type { ReuseSortedBy, SortDirection } from '~/types/types'

const props = withDefaults(defineProps<{
  activities: Record<string, Activity>
  reuses: Array<Reuse>
  sortedBy: ReuseSortedBy
  sortDirection: SortDirection
}>(), {
  activities: () => ({}),
})

defineEmits<{
  (event: 'sort', column: ReuseSortedBy, direction: SortDirection): void
}>()

const { t } = useI18n()
const { formatDate } = useFormatDate()
const { getReuseStatus } = useReuseStatus()

function sorted(column: ReuseSortedBy) {
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}
</script>
