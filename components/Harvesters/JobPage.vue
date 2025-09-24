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
      <div class="mb-2.5">
        <h2 class="inline text-sm font-bold uppercase mb-0">
          {{ $t('{n} éléments | {n} élément | {n} éléments', job.items.length) }}
        </h2>
        <span
          v-if="preview && job.items.length >= config.public.harvesterPreviewMaxItems"
          class="ml-3 text-gray-medium"
        >{{ $t('Seuls les {n} premiers éléments sont affichés dans la prévisualisation.', config.public.harvesterPreviewMaxItems) }}</span>
      </div>
      <AdminTable
        v-if="job.items.length"
        class="!pt-0"
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
              <span v-else>{{ $t("Lien") }}</span>
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
            <td class="font-mono !text-right">
              <span v-if="!(item.logs.length + item.errors.length)">{{ item.logs.length + item.errors.length }}</span>
              <button
                v-else
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
        :total-results="job.items.length"
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
const { t } = await useTranslation()
const { formatDate } = useFormatDate()

const props = withDefaults(defineProps<{
  job: HarvesterJob
  preview?: boolean
}>(), {
  preview: false,
})

const page = ref(1)
const pageSize = ref(15)

const paginatedItems = computed(() => {
  return props.job.items.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
})

function getStatus(item: HarvestItem): { label: string, type: AdminBadgeType } {
  return {
    pending: { label: t('En attente'), type: 'secondary' as AdminBadgeType },
    started: { label: t('Started'), type: 'primary' as AdminBadgeType },
    done: { label: t('Terminé'), type: 'success' as AdminBadgeType },
    failed: { label: t('Échoué'), type: 'danger' as AdminBadgeType },
    skipped: { label: t('Ignoré'), type: 'secondary' as AdminBadgeType },
    archived: { label: t('Archivé'), type: 'secondary' as AdminBadgeType },
  }[item.status]
}

const showItemErrors = ref(false)
const itemInModal = ref<HarvestItem | null>(null)
const openItemErrors = (item: HarvestItem) => {
  showItemErrors.value = true
  itemInModal.value = item
}
</script>
