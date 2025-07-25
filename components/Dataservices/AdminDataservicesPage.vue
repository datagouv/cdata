<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('API') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t("API") }}
    </h1>
    <TransferRequestList
      v-if="props.organization || props.user"
      type="Dataservice"
      :recipient="props.organization || props.user"
      @done="refresh"
    />
    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t('{n} API', pageData.total) }}
        </h2>
      </div>
      <div class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2">
        <AdminInput
          v-model="q"
          type="search"
          :icon="RiSearchLine"
          :placeholder="$t('Recherche')"
        />
        <BrandedButton
          v-if="organization"
          :href="pageData.total ? `${config.public.apiBase}/api/1/organizations/${organization.id}/dataservices.csv` : undefined"
          size="xs"
          :external="true"
          :icon="RiDownloadLine"
        >
          {{ t('Télécharger le catalogue') }}
        </BrandedButton>
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminDataservicesTable
          :activities="dataserviceActivities"
          :dataservices="pageData ? pageData.data : []"
          :sort-direction="direction"
          :sorted-by
          @sort="sort"
        />
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
        src="/illustrations/dataservice.svg"
        class="h-20"
      />
      <template v-if="q">
        <p class="fr-text--bold fr-my-3v">
          {{ t(`Pas de résultats pour « {q} »`, { q }) }}
        </p>
        <BrandedButton
          color="primary"
          @click="q = qDebounced = ''"
        >
          {{ $t('Réinitialiser les filtres') }}
        </BrandedButton>
      </template>
      <template v-else>
        <p class="fr-text--bold fr-my-3v">
          {{ t(`Vous n'avez pas encore publié d'API`) }}
        </p>
        <AdminPublishButton type="dataservice" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { Pagination, type Dataservice, type Organization, type User } from '@datagouv/components-next'
import { refDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiDownloadLine, RiSearchLine } from '@remixicon/vue'
import AdminInput from '../AdminInput.vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import AdminDataservicesTable from '~/components/AdminTable/AdminDataservicesTable/AdminDataservicesTable.vue'
import type { DataserviceSortedBy, PaginatedArray, SortDirection } from '~/types/types'
import type { Activity } from '~/types/activity'

const { t } = useI18n()
const { $api } = useNuxtApp()

const config = useRuntimeConfig()
const page = ref(1)
const pageSize = ref(20)
const sortedBy = ref<DataserviceSortedBy>('title')
const direction = ref<SortDirection>('desc')
const sortDirection = computed(() => `${direction.value === 'asc' ? '' : '-'}${sortedBy.value}`)
const q = ref('')
const qDebounced = refDebounced(q, 500) // TODO add 500 in config
const dataserviceActivities = ref<Record<Dataservice['id'], Activity>>({})

const props = defineProps<{
  organization?: Organization | null
  user?: User | null
}>()

function sort(column: DataserviceSortedBy, newDirection: SortDirection) {
  sortedBy.value = column
  direction.value = newDirection
}

const params = computed(() => {
  return {
    organization: props.organization?.id,
    owner: props.user?.id,

    sort: sortDirection.value,
    q: qDebounced.value,
    page_size: pageSize.value,
    page: page.value,
  }
})

const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Dataservice>>('/api/1/dataservices/', { lazy: true, query: params })

watchEffect(async () => {
  if (pageData.value) {
    const activities = await getActitiesForObjects($api, pageData.value.data)
    dataserviceActivities.value = { ...dataserviceActivities.value, ...activities }
  }
})
</script>
