<template>
  <div>
    <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle">
      <div class="fr-col">
        <h2
          v-if="pageData && pageData.total"
          class="text-sm font-bold uppercase m-0"
        >
          {{ $t('{n} jobs | {n} job | {n} jobs', pageData.total) }}
        </h2>
      </div>
      <div class="fr-col-auto fr-grid-row fr-grid-row--middle">
        <!-- Buttons -->
      </div>
    </div>

    <LoadingBlock
      v-slot="{ data: pageData }"
      :status
      :data="pageData"
    >
      <div v-if="pageData && pageData.total > 0">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ $t("ID de tâche") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ $t("Statut") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ $t("Débuté le") }}
              </AdminTableTh>
              <AdminTableTh scope="col">
                {{ $t("Terminé le") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-12"
              >
                {{ $t("Jeux de données") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-12"
              >
                {{ $t('API') }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-12"
              >
                <Tooltip class="ml-auto">
                  <RiCheckLine class="size-3.5" />
                  <template #tooltip>
                    {{ $t('Éléments finis') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-12"
              >
                <Tooltip class="ml-auto">
                  <RiEyeOffLine class="size-3.5" />
                  <template #tooltip>
                    {{ $t('Éléments ignorés') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-12"
              >
                <Tooltip class="ml-auto">
                  <RiArchiveLine class="size-3.5" />
                  <template #tooltip>
                    {{ $t('Éléments archivés') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-12"
              >
                <Tooltip class="ml-auto">
                  <RiCloseLine class="size-3.5" />
                  <template #tooltip>
                    {{ $t('Éléments en échec') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
            </tr>
          </thead>
          <tbody v-if="pageData">
            <tr
              v-for="job in pageData.data"
              :key="job.id"
            >
              <td>
                <AdminContentWithTooltip>
                  <CdataLink
                    v-if="harvester"
                    class="fr-link fr-reset-link"
                    :href="getHarvesterJobAdminUrl(harvester, job)"
                  >
                    {{ job.id }}
                  </CdataLink>
                </AdminContentWithTooltip>
              </td>
              <td>
                <JobBadge :job />
              </td>
              <td>{{ job.started ? formatDate(job.started, { dateStyle: 'long', timeStyle: 'short' }) : formatDate(job.created, { dateStyle: 'long', timeStyle: 'short' }) }}</td>
              <td>{{ job.ended ? formatDate(job.ended, { dateStyle: 'long', timeStyle: 'short' }) : '—' }}</td>
              <td class="!text-right font-mono">
                {{ job.items.filter((i) => i.dataset).length }}
              </td>
              <td class="!text-right font-mono">
                {{ job.items.filter((i) => i.dataservice).length }}
              </td>
              <td class="!text-right font-mono">
                {{ job.items.filter((i) => i.status === 'done').length }}
              </td>
              <td class="!text-right font-mono">
                {{ job.items.filter((i) => i.status === 'skipped').length }}
              </td>
              <td class="!text-right font-mono">
                {{ job.items.filter((i) => i.status === 'archived').length }}
              </td>
              <td class="!text-right font-mono">
                {{ job.items.filter((i) => i.status === 'failed').length }}
              </td>
            </tr>
          </tbody>
        </AdminTable>
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </LoadingBlock>

    <div
      v-if="status != 'pending' && pageData && !pageData.total"
      class="flex flex-col items-center"
    >
      <nuxt-img
        src="/illustrations/harvester.svg"
        class="h-20"
      />
      <p class="fr-text--bold fr-my-3v">
        {{ $t(`Aucun job pour l'instant.`) }}
      </p>
      <BrandedButton
        v-if="harvester"
        color="primary"
        size="xs"
        :href="`/admin/harvesters/${harvester.id}/configuration`"
      >
        {{ $t('Aller à la configuration') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoadingBlock, Pagination, BrandedButton, useFormatDate, Tooltip } from '@datagouv/components-next'
import { RiArchiveLine, RiCheckLine, RiCloseLine, RiEyeOffLine } from '@remixicon/vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import JobBadge from '~/components/Harvesters/JobBadge.vue'
import type { HarvesterJob, HarvesterSource } from '~/types/harvesters'
import type { PaginatedArray } from '~/types/types'

const page = ref(1)
const pageSize = ref(20)

const route = useRoute()
const { formatDate } = useFormatDate()

const sourceUrl = computed(() => `/api/1/harvest/source/${route.params.id}`)
const { data: harvester } = await useAPI<HarvesterSource>(sourceUrl, { redirectOn404: true })

const jobsUrl = computed(() => `/api/1/harvest/source/${route.params.id}/jobs`)
const jobsParams = computed(() => {
  return {
    page: page.value,
    page_size: pageSize.value,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<HarvesterJob>>(jobsUrl, { lazy: true, query: jobsParams })
</script>
