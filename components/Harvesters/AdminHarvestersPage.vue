<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Harvesters') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-bold text-2xl mb-5">
      {{ t("Harvesters") }}
    </h1>
    <div
      v-if="pageData && pageData.total"
      class="flex items-center justify-between"
    >
      <h2
        class="text-sm font-bold uppercase m-0"
      >
        {{ t('{n} harvesters', pageData.total) }}
      </h2>
      <div class="flex space-x-2.5 fr-grid-row fr-grid-row--right">
        <AdminInput
          v-if="!organization"
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Search')"
        />
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminTable>
          <thead>
            <tr>
              <AdminTableTh scope="col">
                {{ t("Name") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-56"
              >
                {{ t("Status") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-56"
              >
                {{ t("Implementation") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-32"
              >
                {{ t("Created at") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-32"
              >
                {{ t("Last run") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-24"
                align="right"
              >
                {{ t("Datasets") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-24"
                align="right"
              >
                {{ t("Dataservices") }}
              </AdminTableTh>
              <AdminTableTh
                scope="col"
                class="w-28"
              >
                {{ t("Actions") }}
              </AdminTableTh>
            </tr>
          </thead>
          <tbody v-if="pageData">
            <tr
              v-for="harvester in pageData.data"
              :key="harvester.id"
            >
              <td>
                <AdminContentWithTooltip>
                  <NuxtLinkLocale
                    class="fr-link fr-reset-link"
                    :href="getHarvesterAdminUrl(harvester)"
                  >
                    <TextClamp
                      :text="harvester.name"
                      :auto-resize="true"
                      :max-lines="2"
                    />
                  </NuxtLinkLocale>
                </AdminContentWithTooltip>
              </td>
              <td>
                <HarvesterBadge :harvester />
              </td>
              <td>{{ harvester.backend }}</td>
              <td>{{ formatDate(harvester.created_at) }}</td>
              <td>
                <template v-if="harvester.last_job?.ended">
                  {{ formatDate(harvester.last_job.ended) }}
                </template>
                <template v-else>
                  {{ t('Not yet') }}
                </template>
              </td>
              <td class="font-mono text-right">
                {{ getHarvesterDatasets(harvester) }}
              </td>
              <td class="font-mono text-right">
                {{ getHarvesterDataservices(harvester) }}
              </td>
              <td>
                <BrandedButton
                  size="xs"
                  color="secondary-softer"
                  :href="getHarvesterAdminUrl(harvester)"
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
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </LoadingBlock>

    <div
      v-if="pageData && !pageData.total"
      class="flex flex-col items-center"
    >
      <nuxt-img
        src="/illustrations/harvester.svg"
        class="w-24"
      />
      <template
        v-if="organization"
      >
        <p class="fr-text--bold fr-my-3v">
          {{ t(`You haven't published a harvester yet`) }}
        </p>
        <AdminPublishButton type="harvester" />
      </template>
      <template v-else-if="q">
        <p class="fr-text--bold fr-my-3v">
          {{ t(`No results for "{q}"`, { q }) }}
        </p>
        <BrandedButton
          color="primary"
          @click="q = qDebounced = ''"
        >
          {{ $t('Reset filters') }}
        </BrandedButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pagination, BrandedButton, type Organization } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiPencilLine, RiSearchLine } from '@remixicon/vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import HarvesterBadge from './HarvesterBadge.vue'
import type { PaginatedArray } from '~/types/types'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import type { HarvesterJob, HarvesterSource } from '~/types/harvesters'
import { getHarvesterAdminUrl } from '~/utils/harvesters'

const props = defineProps<{
  organization?: Organization | null
}>()
const { t } = useI18n()
const config = useRuntimeConfig()
const { $api } = useNuxtApp()

const page = ref(1)
const pageSize = ref(20)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config

const url = computed(() => {
  const url = new URL(`/api/1/harvest/sources/`, config.public.apiBase)

  if (props.organization) {
    url.searchParams.set('owner', props.organization.id)
  }

  url.searchParams.set('deleted', 'true')
  url.searchParams.set('q', qDebounced.value)
  url.searchParams.set('page_size', pageSize.value.toString())
  url.searchParams.set('page', page.value.toString())

  return url.toString()
})

const { data: pageData, status } = await useAPI<PaginatedArray<HarvesterSource>>(url, { lazy: true })

const jobs = ref<Record<string, HarvesterJob>>({})
const jobsPromises = ref<Record<string, Promise<void>>>({})

watchEffect(async () => {
  if (!pageData.value) return

  for (const source of pageData.value.data) {
    if (!source.last_job) continue
    if (source.last_job.id in jobsPromises.value) continue

    jobsPromises.value[source.last_job.id] = $api<HarvesterJob>(`/api/1/harvest/job/${source.last_job.id}/`)
      .then((job) => {
        if (source.last_job) {
          jobs.value[source.last_job.id] = job // Working because there is no conflicts between IDs from different types
        }
      })
  }

  await Promise.all(Object.values(jobsPromises.value))
})

function getHarvesterDataservices(harvester: HarvesterSource) {
  if (!harvester.last_job || !jobs.value[harvester.last_job.id]) {
    return 0
  }
  return jobs.value[harvester.last_job.id].items.filter(item => item.dataservice).length
}

function getHarvesterDatasets(harvester: HarvesterSource) {
  if (!harvester.last_job || !jobs.value[harvester.last_job.id]) {
    return 0
  }
  return jobs.value[harvester.last_job.id].items.filter(item => item.dataset).length
}
</script>
