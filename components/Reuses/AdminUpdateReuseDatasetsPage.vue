<template>
  <div
    v-if="datasets"
    class="fr-p-3w bg-white"
  >
    <DatasetsSelect v-model="datasets" />
    <div class="fr-grid-row fr-grid-row--right">
      <BrandedButton
        color="primary"
        :disabled="!datasets.length"
        @click="submit"
      >
        {{ t("Sauvegarder") }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { Dataset, DatasetV2, Reuse } from '@datagouv/components-next'
import type { DatasetSuggest } from '~/types/types'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse } = await useAPI<Reuse>(url, { redirectOn404: true })
const datasets = ref<Array<Dataset | DatasetV2 | DatasetSuggest>>([])
watchEffect(async () => {
  if (!reuse.value) return
  datasets.value = reuse.value.datasets
})

const submit = async () => {
  if (!reuse.value) return
  await $api(`/api/1/reuses/${reuse.value.id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      datasets: datasets.value.map(({ id }) => id),
    }),
  })

  toast.success(t('Réutilisation mise à jour !'))
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>
