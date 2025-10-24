<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          :sorted="sorted('title')"
          scope="col"
          class="w-1/3"
          @sort="(direction: SortDirection) => $emit('sort', 'title', direction)"
        >
          {{ t("Titre de l'API") }}
        </AdminTableTh>
        <AdminTableTh class="w-24">
          {{ t("Statut") }}
        </AdminTableTh>
        <AdminTableTh class="w-24">
          {{ t("Accès") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Créé le") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Modifié le") }}
        </AdminTableTh>
        <AdminTableTh class="w-64">
          {{ t("Limite d'appels") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Disponibilité") }}
        </AdminTableTh>
        <AdminTableTh scope="col">
          {{ t("Actions") }}
        </AdminTableTh>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="dataservice in dataservices"
        :key="dataservice.id"
      >
        <td>
          <AdminContentWithTooltip>
            <CdataLink
              class="fr-link fr-reset-link"
              :to="getDataserviceAdminUrl(dataservice)"
            >
              <TextClamp
                :text="dataservice.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </CdataLink>
          </AdminContentWithTooltip>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getDataserviceStatus(dataservice).type"
          >
            {{ getDataserviceStatus(dataservice).label }}
          </AdminBadge>
        </td>
        <td>
          <DataserviceAccessTypeBadge :dataservice />
        </td>
        <td>{{ formatDate(dataservice.created_at) }}</td>
        <td>
          <div v-if="dataservice.id in activities">
            <p>{{ formatDate(activities[dataservice.id].created_at) }}</p>
            <p class="inline-flex items-center">
              {{ t('par ') }}
              <AvatarWithName
                class="fr-ml-1v"
                :user="activities[dataservice.id].actor"
              />
            </p>
          </div>
          <template v-else>
            {{ formatDate(dataservice.metadata_modified_at) }}
          </template>
        </td>
        <td>{{ dataservice.rate_limiting }}</td>
        <td class="font-mono text-right">
          <span v-if="dataservice.availability">{{ dataservice.availability }}%</span>
        </td>
        <td>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="dataservice.self_web_url"
            :icon="RiEyeLine"
            icon-only
            keep-margins-even-without-borders
          >
            {{ $t('Voir la page publique') }}
          </BrandedButton>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="getDataserviceAdminUrl(dataservice)"
            :icon="RiPencilLine"
            icon-only
            keep-margins-even-without-borders
          >
            {{ $t('Modifier') }}
          </BrandedButton>
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import type { Activity, Dataservice } from '@datagouv/components-next'
import { AvatarWithName, BrandedButton, useFormatDate } from '@datagouv/components-next'
import { RiEyeLine, RiPencilLine } from '@remixicon/vue'
import AdminBadge from '../../../components/AdminBadge/AdminBadge.vue'
import AdminTable from '../../../components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../../../components/AdminTable/Table/AdminTableTh.vue'
import AdminContentWithTooltip from '../../../components/AdminContentWithTooltip/AdminContentWithTooltip.vue'
import DataserviceAccessTypeBadge from './DataserviceAccessTypeBadge.vue'
import type { DataserviceSortedBy, SortDirection } from '~/types/types'

const props = withDefaults(defineProps<{
  activities?: Record<string, Activity>
  dataservices: Array<Dataservice>
  sortedBy: DataserviceSortedBy
  sortDirection: SortDirection
}>(), {
  activities: () => ({}),
})

defineEmits<{
  (event: 'sort', column: DataserviceSortedBy, direction: SortDirection): void
}>()

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const { getDataserviceStatus } = useDataserviceStatus()

function sorted(column: DataserviceSortedBy) {
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}
</script>
