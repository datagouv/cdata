<template>
  <div>
    <div
      v-if="pageData"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="w-full flex-none md:flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ $t('{n} reuses', pageData.total) }}
        </h2>
      </div>
      <div class="flex-none flex flex-wrap items-center md:gap-x-6 gap-2">
        <ModalWithButton
          :title="$t('Add reuses')"
          size="xl"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              size="xs"
              :icon="RiAddLine"
              v-bind="attrs"
              v-on="listeners"
            >
              {{ $t('Add reuses') }}
            </BrandedButton>
          </template>

          <ReusesSelect
            v-model="reuses"
            :allow-reorder="false"
          />

          <template #footer="{ close }">
            <div class="flex-1 flex justify-end">
              <BrandedButton
                color="primary"
                :disabled="!reuses.length"
                @click="save(close)"
              >
                {{ $t("Save") }}
              </BrandedButton>
            </div>
          </template>
        </ModalWithButton>
      </div>
    </div>

    <LoadingBlock :status>
      <div v-if="pageData && pageData.total > 0">
        <AdminReusesTable
          :reuses="pageData ? pageData.data : []"
        >
          <template #actions="{ reuse }">
            <BrandedButton
              icon-only
              color="secondary-softer"
              keep-margins-even-without-borders
              :icon="RiDeleteBinLine"
              size="xs"
              @click="removeReuse(reuse)"
            >
              {{ $t('Remove reuse') }}
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
import type { Reuse, TopicV2 } from '@datagouv/components-next'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiDeleteBinLine } from '@remixicon/vue'
import AdminReusesTable from '~/components/AdminTable/AdminReusesTable/AdminReusesTable.vue'
import ReusesSelect from '~/components/ReusesSelect.vue'
import Pagination from '~/datagouv-components/src/components/Pagination.vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  topic: TopicV2
}>()

const reuses = ref<Array<Reuse>>([])

const page = ref(1)
const params = computed(() => {
  return { page: page.value }
})
const { data: pageData, status, refresh } = await useAPI<PaginatedArray<Reuse>>(`/api/2/topics/${props.topic.id}/reuses/`, { lazy: true, query: params })

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useI18n()
const save = async (close: () => void) => {
  await $api(`/api/2/topics/${props.topic.id}/reuses/`, {
    method: 'POST',
    body: reuses.value,
  })

  toast.success(t('Saved.'))
  close()
  reuses.value = []
  await refresh()
}
const removeReuse = async (reuse: Reuse) => {
  await $api(`/api/2/topics/${props.topic.id}/reuses/${reuse.id}/`, { method: 'DELETE' })

  toast.success(t('Removed.'))
  await refresh()
}
</script>
