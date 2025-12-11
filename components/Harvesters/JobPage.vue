<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h1 class="text-2xl font-extrabold text-gray-title !mb-0">
        {{ job.id }}
      </h1>
    </div>

    <div class="text-sm text-mentionGrey space-y-1.5 mb-5">
      <div class="space-x-1">
        <RiCalendarEventLine class="inline size-3" />
        <span>{{ $t('Débuté le :') }}</span>
        <span class="font-mono">{{ formatDate(job.started || job.created, { dateStyle: 'long', timeStyle: 'short' }) }}</span>
      </div>
      <div class="space-x-1">
        <RiCalendarEventLine class="inline size-3" />
        <span>{{ $t('Terminé le :') }}</span>
        <span class="font-mono">{{ job.ended ? formatDate(job.ended, { dateStyle: 'long', timeStyle: 'short' }) : '—' }}</span>
      </div>
      <div class="space-x-1">
        <RiCheckboxCircleLine class="inline size-3" />
        <span>{{ $t('Statut :') }}</span>
        <JobBadge :job />
      </div>
      <div class="space-x-1">
        <RiInformationLine class="inline size-3" />
        <span>{{ $t('Éléments :') }}</span>
        <span class="space-x-2">
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiCheckLine class="inline size-3.5" />
              <span>{{ job.items.filter((i) => i.status === 'done').length }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments finis') }}
            </template>
          </Tooltip>
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiEyeOffLine class="inline size-3.5" />
              <span>{{ job.items.filter((i) => i.status === 'skipped').length }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments ignorés') }}
            </template>
          </Tooltip>
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiArchiveLine class="inline size-3.5" />
              <span>{{ job.items.filter((i) => i.status === 'archived').length }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments archivés') }}
            </template>
          </Tooltip>
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiCloseLine class="inline size-3.5" />
              <span>{{ job.items.filter((i) => i.status === 'failed').length }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments en échec') }}
            </template>
          </Tooltip>
          <span>{{ $t('({count} au total)', { count: job.items.length }) }}</span>
        </span>
      </div>
    </div>

    <div
      v-if="job.errors.length"
      class="mb-4"
    >
      <h2 class="text-sm font-bold uppercase mb-2.5">
        {{ $t('Erreurs') }}
      </h2>

      <div class="bg-white p-2">
        <div
          v-for="(error, index) in job.errors"
          :key="index"
          class="space-y-1"
        >
          <div>
            <AdminBadge
              type="danger"
              size="sm"
            >
              {{ $t('Erreur') }}
            </AdminBadge>
            {{ error.message }}
          </div>
          <div
            v-if="error.details"
            class="text-mention-grey bg-gray-some p-2 text-xs/4"
          >
            {{ error.details }}
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <div class="w-full flex-none md:flex-1">
          <h2 class="inline text-sm font-bold uppercase mb-0">
            {{ $t('{n} éléments | {n} élément | {n} éléments', job.items.length) }}
          </h2>
          <span
            v-if="preview && job.items.length >= config.public.harvesterPreviewMaxItems"
            class="ml-3 text-gray-medium"
          >{{ $t('Seuls les {n} premiers éléments sont affichés dans la prévisualisation.', config.public.harvesterPreviewMaxItems) }}</span>
        </div>
        <div
          v-if="!preview"
          class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2"
        >
          <SearchableSelect
            v-model="selectedItemStatus"
            :placeholder="$t('Filtrer par statut')"
            :label="$t('Filtrer par statut')"
            :options="itemStatus"
            :display-value="(option) => option.label"
            :multiple="false"
            class="mb-0"
            hide-label
          />
        </div>
      </div>
      <AdminTable
        v-if="job.items.length"
        class="fr-mb-2w"
      >
        <thead>
          <tr>
            <AdminTableTh scope="col">
              {{ $t("ID") }}
            </AdminTableTh>
            <AdminTableTh scope="col">
              {{ $t("Statut") }}
            </AdminTableTh>
            <AdminTableTh scope="col">
              <span v-if="preview">{{ $t("Nom") }}</span>
              <span v-else>{{ $t("Lien data.gouv.fr") }}</span>
            </AdminTableTh>
            <AdminTableTh scope="col">
              {{ $t("Lien source") }}
            </AdminTableTh>
            <AdminTableTh scope="col">
              <Tooltip class="ml-auto">
                <RiAlertLine class="size-3.5" />
                <template #tooltip>
                  {{ $t('Erreurs et logs') }}
                </template>
              </Tooltip>
            </AdminTableTh>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in paginatedItems"
            :key="item.remote_id"
          >
            <td>
              {{ item.remote_id }}
            </td>
            <td>
              <AdminBadge
                size="xs"
                :type="getStatus(item).type"
              >
                {{ getStatus(item).label }}
              </AdminBadge>
            </td>
            <td>
              <div v-if="preview">
                {{ item.dataset?.title || item.dataservice?.title }}
              </div>
              <div v-else>
                <LinkToSubject
                  v-if="item.dataset"
                  type="Dataset"
                  :subject="item.dataset"
                />
                <LinkToSubject
                  v-if="item.dataservice"
                  type="Dataservice"
                  :subject="item.dataservice"
                />
              </div>
            </td>
            <td>
              <CdataLink
                v-if="item.remote_url"
                class="link"
                :to="item.remote_url"
                external
              >
                <TextClamp
                  :text="item.remote_url"
                  :auto-resize="true"
                  :max-lines="1"
                />
              </CdataLink>
            </td>
            <td class="font-mono !text-right">
              <span
                v-if="!(item.logs.length + item.errors.length)"
                class="px-2"
              >-</span>
              <button
                v-else
                class="text-danger-dark bg-danger-lightest text-xs/6 px-2"
                type="button"
                @click="openItemErrors(item)"
              >
                {{ item.logs.length + item.errors.length }}
              </button>
            </td>
          </tr>
        </tbody>
      </AdminTable>
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total-results="currentItems.length"
        @change="(changedPage: number) => page = changedPage"
      />
    </div>

    <Modal
      :title="t('Erreurs et logs')"
      :opened="showItemErrors"
      size="lg"
      @close="showItemErrors = false"
    >
      <div class="space-y-4">
        <div
          v-for="(error, index) in itemInModal?.errors || []"
          :key="index"
          class="space-y-1"
        >
          <div>
            <AdminBadge
              type="danger"
              size="sm"
            >
              {{ $t('Erreur') }}
            </AdminBadge>
            {{ error.message }}
          </div>
          <div
            v-if="error.details"
            class="text-mention-grey bg-gray-some p-2 text-xs/4"
          >
            {{ error.details }}
          </div>
        </div>

        <div
          v-for="(log, index) in itemInModal?.logs || []"
          :key="index"
          class="space-y-1"
        >
          <AdminBadge
            type="warning"
            size="sm"
          >
            {{ $t('Log') }} {{ log.level }}
          </AdminBadge>
          {{ log.message }}
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { Pagination, Tooltip, useFormatDate } from '@datagouv/components-next'
import { RiAlertLine, RiArchiveLine, RiCalendarEventLine, RiCheckboxCircleLine, RiCheckLine, RiCloseLine, RiEyeOffLine, RiInformationLine } from '@remixicon/vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import JobBadge from '~/components/Harvesters/JobBadge.vue'
import type { HarvesterJob, HarvestItem } from '~/types/harvesters'
import type { AdminBadgeType } from '~/types/types'

const config = useRuntimeConfig()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const props = withDefaults(defineProps<{
  job: HarvesterJob
  preview?: boolean
}>(), {
  preview: false,
})

const page = ref(1)
const pageSize = ref(15)
const currentItems = ref<Array<HarvestItem>>(props.job.items)

const selectedItemStatus = ref<{ id: string, label: string, type: AdminBadgeType } | null>(null)

watch(selectedItemStatus, () => {
  page.value = 1
  currentItems.value = props.job.items
  const status = selectedItemStatus.value
  if (status)
    currentItems.value = currentItems.value.filter(item => item.status == status.id)
})

const paginatedItems = computed(() => {
  return currentItems.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
})

const itemStatusMap: Record<HarvestItem['status'], { label: string, type: AdminBadgeType }> = {
  pending: { label: t('En attente'), type: 'secondary' },
  started: { label: t('Commencé'), type: 'primary' },
  done: { label: t('Terminé'), type: 'success' },
  failed: { label: t('Échoué'), type: 'danger' },
  skipped: { label: t('Ignoré'), type: 'secondary' },
  archived: { label: t('Archivé'), type: 'secondary' },
}

const itemStatus = Object.entries(itemStatusMap).map(([id, status]) => ({ id, ...status }))

function getStatus(item: HarvestItem): { label: string, type: AdminBadgeType } {
  return itemStatusMap[item.status]
}

const showItemErrors = ref(false)
const itemInModal = ref<HarvestItem | null>(null)
const openItemErrors = (item: HarvestItem) => {
  showItemErrors.value = true
  itemInModal.value = item
}
</script>
