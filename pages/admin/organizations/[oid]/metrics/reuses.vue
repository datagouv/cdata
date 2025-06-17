<template>
  <div>
    <div class="flex justify-end -mt-14 pt-0.5 mb-5">
      <BrandedButton
        color="secondary"
        :disabled="!downloadStatsUrl"
        :href="downloadStatsUrl || ''"
        download="stats.csv"
        :icon="RiDownloadLine"
        size="xs"
      >
        {{ $t('Télécharger le catalogue') }}
      </BrandedButton>
    </div>
    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh
                :sorted="sorted('title')"
                scope="col"
                @sort="(direction: SortDirection) => sort('title', direction)"
              >
                {{ $t("Titre de la réutilisation") }}
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
                    {{ $t('Discussions') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                :sorted="sorted('views')"
                scope="col"
                @sort="(direction: SortDirection) => sort('views', direction)"
              >
                <Tooltip>
                  <span
                    class="fr-icon--sm fr-icon-eye-line"
                    aria-hidden="true"
                  />
                  <template #tooltip>
                    {{ $t('Vues') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
              <AdminTableTh
                class="w-16"
                :sorted="sorted('followers')"
                scope="col"
                @sort="(direction: SortDirection) => sort('followers', direction)"
              >
                <Tooltip>
                  <RiStarSLine class="size-4" />
                  <template #tooltip>
                    {{ $t('Favoris') }}
                  </template>
                </Tooltip>
              </AdminTableTh>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="reuse in pageData.data"
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
              <td class="font-mono text-right">
                {{ summarize(reuse.metrics.discussions) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(reuse.metrics.views) }}
              </td>
              <td class="font-mono text-right">
                {{ summarize(reuse.metrics.followers) }}
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
        src="/illustrations/reuse.svg"
        class="h-20"
      />
      <p class="fr-text--bold fr-my-3v">
        {{ $t(`Vous n'avez pas encore publié de réutilisation.`) }}
      </p>
      <AdminPublishButton type="reuse" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiDownloadLine, RiStarSLine } from '@remixicon/vue'
import { BrandedButton, Pagination, summarize, type Organization, type Reuse } from '@datagouv/components-next'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import type { PaginatedArray, ReuseSortedBy, SortDirection } from '~/types/types'

const props = defineProps<{
  organization: Organization
}>()

const downloadStatsUrl = computed(() => `/api/1/organizations/${props.organization.id}/reuses.csv`)

const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<ReuseSortedBy>('created')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)

const params = computed(() => {
  return {
    organization: props.organization.id,

    sort: sortDirection.value,
    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<Reuse>>('/api/1/reuses/', { lazy: true, query: params })

function sort(column: ReuseSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

function sorted(column: ReuseSortedBy) {
  if (sortedBy.value === column) {
    return direction.value
  }
  return null
}
</script>
