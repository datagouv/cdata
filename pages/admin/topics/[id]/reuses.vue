<template>
  <div>
    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ $t('{n} réutilisations | {n} réutilisation | {n} réutilisations', pageData.total) }}
        </h2>
      </div>
      <div class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2">
        <ModalWithButton
          :title="$t('Ajouter des réutilisations')"
          size="xl"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              size="xs"
              :icon="RiAddLine"
              v-bind="attrs"
              v-on="listeners"
            >
              {{ $t('Ajouter des réutilisations') }}
            </BrandedButton>
          </template>

          <ReusesSelect
            v-model="selectedReuses"
            :allow-reorder="false"
          />

          <template #footer="{ close }">
            <div class="flex-1 flex justify-end">
              <BrandedButton
                color="primary"
                :disabled="!selectedReuses.length"
                @click="addReuses(close)"
              >
                {{ $t("Sauvegarder") }}
              </BrandedButton>
            </div>
          </template>
        </ModalWithButton>
      </div>
    </div>

    <LoadingBlock
      v-slot="{ data: pageData }"
      :status
      :data="pageData"
    >
      <div v-if="pageData && pageData.total > 0">
        <AdminReusesTable
          :reuses="reuses"
          sorted-by="created"
          sort-direction="desc"
        >
          <template #actions="{ reuse }">
            <BrandedButton
              icon-only
              color="tertiary"
              keep-margins-even-without-borders
              :icon="RiDeleteBinLine"
              size="xs"
              @click="removeReuse(reuse)"
            >
              {{ $t('Supprimer la réutilisation') }}
            </BrandedButton>
          </template>
        </AdminReusesTable>
        <Pagination
          :page="page"
          :total-results="pageData.total"
          @change="(changedPage: number) => page = changedPage"
        />
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import type { Reuse, TopicV2, TopicElement } from '@datagouv/components-next'
import { BrandedButton, LoadingBlock, Pagination } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine } from '@remixicon/vue'
import AdminReusesTable from '~/components/AdminTable/AdminReusesTable/AdminReusesTable.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  topic: TopicV2
}>()

const reuses = ref<Array<Reuse>>([])
const selectedReuses = ref<Array<Reuse>>([])

const page = ref(1)
const params = computed(() => {
  return { page: page.value, class: 'Reuse' }
})
const { data: pageData, status, refresh } = await useAPI<PaginatedArray<TopicElement>>(`/api/2/topics/${props.topic.id}/elements/`, { lazy: true, query: params })

const { $api } = useNuxtApp()

watch(pageData, async (_pageData) => {
  if (!_pageData) return

  reuses.value = await Promise.all(_pageData.data.map(async (element) => {
    return await $api(`/api/1/reuses/${element.element.id}/`)
  }))
}, { immediate: true })

const addReuses = async (close: () => void) => {
  await $api(`/api/2/topics/${props.topic.id}/elements/`, {
    method: 'POST',
    body: selectedReuses.value.map(reuse => ({ element: { id: reuse.id, class: 'Reuse' } })),
  })
  selectedReuses.value = []
  await refresh()
  close()
}

const removeReuse = async (reuse: Reuse) => {
  const element = pageData.value?.data.find(e => e.element.id === reuse.id)
  if (!element) return
  await $api(`/api/2/topics/${props.topic.id}/elements/${element.id}/`, { method: 'DELETE' })
  await refresh()
}
</script>
