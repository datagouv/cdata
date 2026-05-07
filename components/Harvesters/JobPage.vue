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
        <span>{{ $t('Débuté le :') }}</span>
        <span class="font-mono">{{ formatDate(job.started || job.created, { dateStyle: 'long', timeStyle: 'short' }) }}</span>
      </div>
      <div class="space-x-1">
        <RiCalendarEventLine class="inline size-3" />
        <span>{{ $t('Terminé le :') }}</span>
        <span class="font-mono">{{ job.ended ? formatDate(job.ended, { dateStyle: 'long', timeStyle: 'short' }) : '—' }}</span>
      </div>
      <div class="space-x-1">
        <RiCheckboxCircleLine class="inline size-3" />
        <span>{{ $t('Statut :') }}</span>
        <JobBadge :job />
      </div>
      <div class="space-x-1">
        <RiInformationLine class="inline size-3" />
        <span>{{ $t('Éléments :') }}</span>
        <span class="space-x-2">
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiCheckLine class="inline size-3.5" />
              <span>{{ counts.done }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments finis') }}
            </template>
          </Tooltip>
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiEyeOffLine class="inline size-3.5" />
              <span>{{ counts.skipped }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments ignorés') }}
            </template>
          </Tooltip>
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiArchiveLine class="inline size-3.5" />
              <span>{{ counts.archived }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments archivés') }}
            </template>
          </Tooltip>
          <Tooltip class="inline">
            <span class="space-x-0.5 text-sm">
              <RiCloseLine class="inline size-3.5" />
              <span>{{ counts.failed }}</span>
            </span>
            <template #tooltip>
              {{ $t('Éléments en échec') }}
            </template>
          </Tooltip>
          <span>{{ $t('({count} au total)', { count: counts.total }) }}</span>
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
            {{ $t('{n} éléments | {n} élément | {n} éléments', counts.total) }}
          </h2>
          <span
            v-if="preview && counts.total >= config.public.harvesterPreviewMaxItems"
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
            :options="itemStatusOptions"
            :display-value="(option: { label: string }) => option.label"
            :multiple="false"
            class="mb-0"
            hide-label
          />
        </div>
      </div>
      <AdminTable
        v-if="counts.total"
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
            v-for="item in displayedItems"
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
        :total-results="displayedTotal"
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
import { Pagination, SearchableSelect, Tooltip, useFormatDate } from '@datagouv/components-next'
import { RiAlertLine, RiArchiveLine, RiCalendarEventLine, RiCheckboxCircleLine, RiCheckLine, RiCloseLine, RiEyeOffLine, RiInformationLine } from '@remixicon/vue'
import type { ComputedRef } from 'vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import JobBadge from '~/components/Harvesters/JobBadge.vue'
import type { HarvesterJob, HarvesterJobPreview, HarvestItem, HarvestItemStatus } from '~/types/harvesters'
import type { AdminBadgeType, PaginatedArray } from '~/types/types'

const config = useRuntimeConfig()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const props = withDefaults(defineProps<{
  job: HarvesterJob | HarvesterJobPreview
  items?: Array<HarvestItem>
  preview?: boolean
}>(), {
  preview: false,
  items: () => [],
})

const itemStatusMap: Record<HarvestItemStatus, { label: string, type: AdminBadgeType }> = {
  pending: { label: t('En attente'), type: 'secondary' },
  started: { label: t('Commencé'), type: 'primary' },
  done: { label: t('Terminé'), type: 'success' },
  failed: { label: t('Échoué'), type: 'danger' },
  skipped: { label: t('Ignoré'), type: 'secondary' },
  archived: { label: t('Archivé'), type: 'secondary' },
}

const itemStatusOptions = Object.entries(itemStatusMap).map(([id, status]) => ({ id: id as HarvestItemStatus, ...status }))

const page = ref(1)
const pageSize = ref(15)
const selectedItemStatus = ref<{ id: HarvestItemStatus, label: string, type: AdminBadgeType } | null>(null)

watch(selectedItemStatus, () => {
  page.value = 1
})

type Counts = Record<HarvestItemStatus, number> & { total: number }

let displayedItems: ComputedRef<Array<HarvestItem>>
let displayedTotal: ComputedRef<number>
let counts: ComputedRef<Counts>

// Preview vs real divergence: previews carry the full items array client-side
// (filter & paginate locally), while real jobs go through the paginated
// subresource endpoint with server-side filter & pagination.
if (props.preview) {
  const filteredPreviewItems = computed(() => {
    if (!selectedItemStatus.value) return props.items
    return props.items.filter(item => item.status === selectedItemStatus.value!.id)
  })
  displayedItems = computed(() => filteredPreviewItems.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
  displayedTotal = computed(() => filteredPreviewItems.value.length)
  counts = computed(() => ({
    pending: props.items.filter(i => i.status === 'pending').length,
    started: props.items.filter(i => i.status === 'started').length,
    done: props.items.filter(i => i.status === 'done').length,
    failed: props.items.filter(i => i.status === 'failed').length,
    skipped: props.items.filter(i => i.status === 'skipped').length,
    archived: props.items.filter(i => i.status === 'archived').length,
    total: props.items.length,
  }))
}
else {
  const realJob = props.job as HarvesterJob
  const itemsUrl = computed(() => `/api/1/harvest/job/${realJob.id}/items/`)
  const itemsParams = computed(() => ({
    page: page.value,
    page_size: pageSize.value,
    ...(selectedItemStatus.value ? { status: selectedItemStatus.value.id } : {}),
  }))
  const { data: itemsPage } = await useAPI<PaginatedArray<HarvestItem>>(itemsUrl, { lazy: true, query: itemsParams })
  displayedItems = computed(() => itemsPage.value?.data ?? [])
  displayedTotal = computed(() => itemsPage.value?.total ?? 0)
  counts = computed(() => ({
    ...realJob.items.by_status,
    total: realJob.items.total,
  }))
}

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
