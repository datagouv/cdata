<template>
  <div
    v-if="datasets"
    class="fr-p-3w bg-white"
  >
    <DatasetsSelect v-model="datasets" />
    <div class="fr-grid-row fr-grid-row--right">
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
import { BrandedButton } from '@datagouv/components-next'
import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import type { DatasetSuggest } from '~/types/types'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const url = computed(() => `/api/1/dataservices/${route.params.id}`)
const { data: dataservice } = await useAPI<Dataservice>(url, { redirectOn404: true })
const datasets = ref<Array<DatasetV2 | DatasetSuggest>>([])
watch(dataservice, async () => {
  if (!dataservice.value) return
  datasets.value = await apiFetchAll<DatasetV2>($api, `/api/2/datasets/?dataservice=${dataservice.value.id}`)
}, { immediate: true })

const submit = async () => {
  await $api(`/api/1/dataservices/${dataservice.value.id}/`, {
    method: 'PATCH',
    body: JSON.stringify({
      datasets: datasets.value.map(({ id }) => id),
    }),
  })

  toast.success(t('Fiche API mise à jour !'))
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>
