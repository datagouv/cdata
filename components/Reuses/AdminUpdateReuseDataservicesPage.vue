<template>
  <div
    v-if="dataservices"
    class="fr-p-3w bg-white"
  >
    <DataservicesSelect v-model="dataservices" />
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
import type { Dataservice, Reuse } from '@datagouv/components-next'
import DataservicesSelect from '../DataservicesSelect.vue'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { toast } = useToast()

const route = useRoute()
const url = computed(() => `/api/1/reuses/${route.params.id}`)
const { data: reuse } = await useAPI<Reuse>(url, { redirectOn404: true })
const dataservices = ref<Array<Dataservice>>([])
watchEffect(async () => {
  if (!reuse.value) return
  dataservices.value = reuse.value.dataservices
})

const submit = async () => {
  if (!reuse.value) return
  await $api(`/api/1/reuses/${reuse.value.id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      dataservices: dataservices.value.map(({ id }) => id),
    }),
  })

  toast.success(t('Réutilisation mise à jour !'))
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
}
</script>
