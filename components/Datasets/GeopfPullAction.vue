<template>
  <div class="flex flex-col items-end gap-1">
    <component :is="disabledReason ? Tooltip : 'div'">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiDownloadCloud2Line"
        :disabled="!!disabledReason"
        :loading="pulling || pullState.status === 'pending'"
        @click="pull"
      >
        {{ t('Récupérer les services') }}
      </BrandedButton>

      <template #tooltip>
        {{ disabledReason }}
      </template>
    </component>

    <span
      v-if="pullState.status === 'done' && pullState.lastSyncedAt"
      class="text-xs text-gray-medium"
    >
      {{ t('Dernière synchronisation : {date}', { date: formatDate(pullState.lastSyncedAt) }) }}
    </span>
    <span
      v-else-if="pullState.status === 'error'"
      class="text-xs text-new-error"
    >
      {{ pullState.error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Tooltip, useFormatDate, type DatasetV2 } from '@datagouv/components-next'
import { RiDownloadCloud2Line } from '@remixicon/vue'
import { getGeopfFicheUrl, getGeopfPullState, isGeopfReauthRequired } from '~/utils/geopf'

const props = defineProps<{
  dataset: DatasetV2
  connected: boolean | null
}>()

const emit = defineEmits<{
  pulled: []
  reauthRequired: []
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const ficheUrl = computed(() => getGeopfFicheUrl(props.dataset))
const pullState = computed(() => getGeopfPullState(props.dataset))

const disabledReason = computed(() => {
  if (props.connected !== true) return t('Connectez-vous à cartes.gouv.fr pour récupérer les services.')
  if (!ficheUrl.value) return t('Envoyez d\'abord un fichier au format GeoPackage (.gpkg) vers cartes.gouv.fr.')
  return null
})

const pulling = ref(false)

const pull = async () => {
  pulling.value = true
  try {
    await $api(`/api/1/geopf/pull-offerings/${props.dataset.id}/`, { method: 'POST' })
    emit('pulled')
  }
  catch (error) {
    if (isGeopfReauthRequired(error)) {
      emit('reauthRequired')
    }
    // Otherwise plugins/api.ts already toasted the error.
  }
  finally {
    pulling.value = false
  }
}
</script>
