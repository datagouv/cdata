<template>
  <div class="space-y-5">
    <section
      v-if="status === 'success'"
      class="mb-5"
    >
      <h2 class="text-sm font-bold uppercase m-0 text-gray-title">
        {{ $t('{n} jeu de données | {n} jeux de données', pageData.total) }}
      </h2>
      <div
        class="grid gap-5 mt-2"
        :class="{
          'lg:grid-cols-2': pageData.total > 1,
        }"
      >
        <DatasetCardLg
          v-for="dataset in pageData.data"
          :key="dataset.id"
          class="min-w-0"
          :dataset
          :show-description="pageData.total == 1"
        />
      </div>
      <div class="w-full mt-6 flex justify-center">
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </section>
    <SectionCollapse
      :title="$t('Informations techniques')"
      :button-text="$t('Voir les informations techniques')"
    >
      <DescriptionList class="mb-2">
        <div>
          <DescriptionListTerm>{{ $t('Dernière mise à jour') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(dataservice.metadata_modified_at) }}</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('Identifiant') }}</DescriptionListTerm>
          <DescriptionListDetails class="flex items-center gap-2">
            {{ dataservice.id }}
            <CopyButton
              class="!-mt-0.5"
              :label="$t(`Copier l'identifiant`)"
              :copied-label="$t('Identifiant copié !')"
              :text="dataservice.id"
              :hide-label="true"
            />
          </DescriptionListDetails>
        </div>
      </DescriptionList>
      <DescriptionList>
        <div>
          <DescriptionListTerm>{{ $t('Date de création') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(dataservice.created_at) }}</DescriptionListDetails>
        </div>
      </DescriptionList>
    </SectionCollapse>
  </div>
</template>

<script setup lang="ts">
import { CopyButton, Pagination, useFormatDate, type Dataservice, type DatasetV2 } from '@datagouv/components-next'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{ dataservice: Dataservice }>()

const { formatDate } = useFormatDate()

const pageSize = 6
const page = ref(1)

const query = computed(() => {
  return {
    dataservice: props.dataservice.id,
    page: page.value,
    page_size: pageSize,
  }
})

const { data: pageData, status } = await useAPI<PaginatedArray<DatasetV2>>('/api/2/datasets/', { query })
</script>
