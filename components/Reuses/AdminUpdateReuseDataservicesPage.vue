<template>
  <div
    v-if="dataservices"
    class="fr-p-3w bg-white"
  >
    <DataservicesSelect
      v-model="dataservices"
      :read-only="!canEdit"
    >
      <template #empty>
        <p class="text-sm text-gray-medium">
          {{ t('Aucune API associée.') }}
        </p>
      </template>
    </DataservicesSelect>
    <div
      v-if="canEdit"
      class="fr-grid-row fr-grid-row--right"
    >
      <BrandedButton
        color="primary"
        @click="submit"
      >
        {{ t("Sauvegarder") }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import type { Dataservice, Reuse } from '@datagouv/components-next'
import DataservicesSelect from '../DataservicesSelect.vue'
import type { PaginatedArray } from '~/types/types'

const { t } = useTranslation()
const { $api } = useNuxtApp()

const route = useRoute()
const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse } = await useAPI<Reuse>(url, { showErrorPage: true })
const canEdit = computed(() => reuse.value?.permissions.edit ?? false)

// The reuse only carries references to its dataservices: the full objects needed by
// the cards come from the listing, in one request.
const linkedQuery = computed(() => ({
  reuse: route.params.id,
  page_size: Math.max(reuse.value?.dataservices.length ?? 0, 1),
}))
const { data: linked } = await useAPI<PaginatedArray<Dataservice>>('/api/1/dataservices/', { query: linkedQuery })

const linkedById = computed(() => new Map((linked.value?.data ?? []).map(dataservice => [dataservice.id, dataservice])))

// The listing hides what the user may not see (others' private or archived APIs):
// they stay linked on save, since the user cannot see them to choose to remove them.
const hiddenIds = computed(() => (reuse.value?.dataservices ?? [])
  .map(({ id }) => id)
  .filter(id => !linkedById.value.has(id)))

const dataservices = ref<Array<Dataservice>>([])
watchEffect(() => {
  if (!reuse.value) return
  // The listing does not keep the order of the reuse, which the user can change here
  dataservices.value = reuse.value.dataservices
    .map(({ id }) => linkedById.value.get(id))
    .filter(dataservice => dataservice !== undefined)
})

const submit = async () => {
  if (!reuse.value) return
  await $api(`/api/1/reuses/${reuse.value.id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      dataservices: [...dataservices.value.map(({ id }) => id), ...hiddenIds.value],
    }),
  })

  toast.success(t('Réutilisation mise à jour !'))
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>
