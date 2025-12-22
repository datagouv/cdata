<template>
  <div
    v-if="datasets"
    class="fr-p-3w bg-white"
  >
    <div v-if="tooManyDatasets">
      <SimpleBanner
        type="primary"
        class="mb-4 flex items-center space-x-5"
      >
        <NuxtImg
          src="/illustrations/list.svg"
          loading="lazy"
          class="size-14 shrink-0"
          alt=""
        />
        <div class="w-full">
          <p class="font-bold mb-1">
            {{ t(`Trop de jeux de données associés`) }}
          </p>
          <p class="m-0 text-xs/5">
            {{ t('Cette API a de nombreux jeux de données associés. La liste des jeux de données n\'est pas éditable manuellement par interface. Au besoin, vous pouvez nous contacter via ') }}
            <a :href="config.public.supportUrl">{{ t('le support') }}</a>.
          </p>
        </div>
      </SimpleBanner>
    </div>
    <div v-else>
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
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import type { Dataservice, DatasetV2 } from '@datagouv/components-next'
import type { DatasetSuggest } from '~/types/types'

const config = useRuntimeConfig()

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const url = computed(() => `/api/1/dataservices/${route.params.id}`)
const { data: dataservice } = await useAPI<Dataservice>(url, { redirectOn404: true })

const tooManyDatasets = computed(() => dataservice.value?.datasets.total ?? 0 > config.public.maxNumberOfDatasetsForDataserviceUpdate)
const datasets = ref<Array<DatasetV2 | DatasetSuggest>>([])
watch(dataservice, async () => {
  if (!dataservice.value || tooManyDatasets.value) return
  datasets.value = await apiFetchAll<DatasetV2>($api, `/api/2/datasets/?dataservice=${dataservice.value.id}`)
}, { immediate: true })

const submit = async () => {
  if (!dataservice.value) return
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
