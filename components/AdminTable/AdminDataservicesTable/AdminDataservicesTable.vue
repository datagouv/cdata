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
          {{ t("Dataservice title") }}
        </AdminTableTh>
        <AdminTableTh class="w-24">
          {{ t("Status") }}
        </AdminTableTh>
        <AdminTableTh class="w-24">
          {{ t("Access") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Created at") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Modified at") }}
        </AdminTableTh>
        <AdminTableTh class="w-64">
          {{ t("Rate limiting") }}
        </AdminTableTh>
        <AdminTableTh>
          {{ t("Availability") }}
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
            <NuxtLinkLocale
              class="fr-link fr-reset-link"
              :to="getDataserviceAdminUrl(dataservice)"
            >
              <TextClamp
                :text="dataservice.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </NuxtLinkLocale>
          </AdminContentWithTooltip>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getStatus(dataservice).type"
          >
            {{ getStatus(dataservice).label }}
          </AdminBadge>
        </td>
        <td>
          <DataserviceAccessTypeBadge :dataservice />
        </td>
        <td>{{ formatDate(dataservice.created_at) }}</td>
        <td>{{ formatDate(dataservice.metadata_modified_at) }}</td>
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
            external
            keep-margins-even-without-borders
          >
            {{ $t('Show public page') }}
          </BrandedButton>
          <BrandedButton
            size="xs"
            color="secondary-softer"
            :href="getDataserviceAdminUrl(dataservice)"
            :icon="RiPencilLine"
            icon-only
            keep-margins-even-without-borders
          >
            {{ $t('Edit') }}
          </BrandedButton>
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { BrandedButton, formatDate, type Dataservice } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiEyeLine, RiPencilLine } from '@remixicon/vue'
import AdminBadge from '../../../components/AdminBadge/AdminBadge.vue'
import AdminTable from '../../../components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '../../../components/AdminTable/Table/AdminTableTh.vue'
import AdminContentWithTooltip from '../../../components/AdminContentWithTooltip/AdminContentWithTooltip.vue'
import DataserviceAccessTypeBadge from './DataserviceAccessTypeBadge.vue'
import type { AdminBadgeType, DataserviceSortedBy, SortDirection } from '~/types/types'

const props = defineProps<{
  dataservices: Array<Dataservice>
  sortedBy: DataserviceSortedBy
  sortDirection: SortDirection
}>()

defineEmits<{
  (event: 'sort', column: DataserviceSortedBy, direction: SortDirection): void
}>()

const { t } = useI18n()

function sorted(column: DataserviceSortedBy) {
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}

function getStatus(dataservice: Dataservice): { label: string, type: AdminBadgeType } {
  if (dataservice.deleted_at) {
    return {
      label: t('Deleted'),
      type: 'danger',
    }
  }
  else if (dataservice.private) {
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
