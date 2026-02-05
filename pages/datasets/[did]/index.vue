<template>
  <div class="space-y-5">
    <template v-if="useNewExplorer">
      <ResourceExplorer :dataset />
    </template>

    <template v-else>
      <div
        v-if="selectedResource"
        ref="selectedResourceBannerRef"
        class="space-y-4"
      >
        <SimpleBanner

          type="primary"
          class="flex justify-between items-center"
        >
          <p class="!mb-0">
            {{ $t('Vous consultez une resource spécifique.') }}
          </p>
          <BrandedButton
            color="tertiary"
            keep-margins-even-without-borders
            :icon="RiCloseCircleLine"
            :href="{ name: route.name, params: route.params, query: { ...route.query, resource_id: undefined } }"
          >
            {{ $t("Voir toutes les resources") }}
          </BrandedButton>
        </SimpleBanner>
        <ResourceAccordion
          :dataset
          :resource="selectedResource"
          expanded-on-mount
          :can-edit="dataset.permissions.edit_resources"
        />
      </div>

      <div
        v-for="{ data, status }, index in resourcesByTypes"
        v-else
        :key="RESOURCE_TYPE[index]"
        class="space-y-1"
      >
        <div
          v-if="data.value"
          class="uppercase text-gray-plain text-sm font-bold"
        >
          {{ getResourceLabel(RESOURCE_TYPE[index], data.value.total) }}
        </div>
        <div class="space-y-2.5">
          <SearchInput
            v-if="data.value && (data.value.total > data.value.page_size || searchByResourceType[index].value)"
            v-model="searchByResourceType[index].value"
            :placeholder="$t('Rechercher')"
          />
          <LoadingBlock
            v-slot="{ data: resourcesData }"
            :status="status.value"
            :data="data.value"
          >
            <div class="space-y-2.5">
              <ResourceAccordion
                v-for="resource in resourcesData.data"
                :key="resource.id"
                :dataset
                :resource
                :can-edit="dataset.permissions.edit_resources"
              />
              <Pagination
                :total-results="resourcesData.total"
                :page-size="resourcesData.page_size"
                :page="resourcesData.page"
                @change="(newPage) => pageByResourceType[index].value = newPage"
              />
            </div>
            <div
              v-if="!resourcesData.total"
              class="flex flex-col items-center"
            >
              <nuxt-img
                src="/illustrations/dataset.svg"
                class="h-20"
              />
              <p class="fr-text--bold fr-my-3v">
                {{ $t(`Pas de résultats pour « {q} »`, { q: searchByResourceType[index].value }) }}
              </p>
              <BrandedButton
                color="primary"
                @click="searchByResourceType[index].value = ''"
              >
                {{ $t('Réinitialiser les filtres') }}
              </BrandedButton>
            </div>
          </LoadingBlock>
        </div>
      </div>
    </template>

    <RecommendationsDatasets :dataset />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, getResourceLabel, LoadingBlock, Pagination, RESOURCE_TYPE, ResourceAccordion, SearchInput, SimpleBanner, type DatasetV2, type Resource } from '@datagouv/components-next'
import { RiCloseCircleLine } from '@remixicon/vue'
import { refDebounced } from '@vueuse/core'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{ dataset: DatasetV2 }>()

const config = useRuntimeConfig()
const route = useRoute()

// Feature flag: ?new_explorer=1 to enable, ?new_explorer=0 to disable, persisted in cookie
const newExplorerCookie = useCookie('new_explorer', { maxAge: 60 * 60 * 24 * 7, path: '/' })
const queryFlag = route.query.new_explorer as string | undefined
if (queryFlag === '1') {
  newExplorerCookie.value = '1'
}
else if (queryFlag === '0') {
  newExplorerCookie.value = null
}
// useCookie uses `destr` which deserializes '1' as the number 1
const useNewExplorer = computed(() => String(newExplorerCookie.value) === '1')

// --- Old layout logic (only used when useNewExplorer is false) ---
const url = computed(() => `/api/2/datasets/${props.dataset.id}/resources/`)
const pageSize = ref(10)

const pageByResourceType: Array<Ref<number>> = RESOURCE_TYPE.map(() => ref(1))
const searchByResourceType: Array<Ref<string>> = RESOURCE_TYPE.map(() => ref(''))
const searchDebouncedByResourceType: Array<Ref<string>> = searchByResourceType.map(ref => refDebounced(ref, config.public.searchDebounce))

watch(searchByResourceType, (newQueries, oldQueries) => {
  for (const index in newQueries) {
    if (newQueries[index] != oldQueries[index]) {
      pageByResourceType[index].value = 1
    }
  }
})

const queryParamsByResourceType = RESOURCE_TYPE.map((type, index) => {
  return computed(() => ({
    type,
    page_size: pageSize.value,
    page: pageByResourceType[index].value,
    q: searchDebouncedByResourceType[index].value,
  }))
})

const rawResourcesByTypes = await Promise.all(
  RESOURCE_TYPE.map((type, index) => useAPI<PaginatedArray<Resource>>(url, { query: queryParamsByResourceType[index] })),
)

const resourcesByTypes = computed(() => {
  const result = {} as Record<number, typeof rawResourcesByTypes[number]>
  for (let i = 0; i < rawResourcesByTypes.length; i++) {
    if ((rawResourcesByTypes[i].data.value?.total ?? 0) > 0 || searchByResourceType[i].value) {
      result[i] = rawResourcesByTypes[i]
    }
  }
  return result
})

const hasResourceId = computed(() => 'resource_id' in route.query && route.query.resource_id)
const { $api } = useNuxtApp()
const selectedResource = ref<Resource | null>(null)
const selectedResourceBanner = useTemplateRef('selectedResourceBannerRef')
watchEffect(async () => {
  if (useNewExplorer.value) return
  if (hasResourceId.value) {
    selectedResource.value = await $api<Resource>(`/api/1/datasets/${props.dataset.id}/resources/${route.query.resource_id}/`)
    nextTick(() => {
      selectedResourceBanner.value?.scrollIntoView({ behavior: 'smooth' })
    })
  }
  else {
    selectedResource.value = null
  }
})

if (import.meta.server && hasResourceId.value) {
  useSeoMeta({
    robots: 'noindex',
  })
}
</script>
