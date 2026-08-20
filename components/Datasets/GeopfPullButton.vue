<template>
  <div class="flex flex-col items-end gap-1">
    <component :is="disabledReason ? Tooltip : 'div'">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiDownloadCloud2Line"
        :disabled="!!disabledReason"
        :loading="pulling || pull.status === 'pending'"
        @click="startPull"
      >
        {{ t('Récupérer les services') }}
      </BrandedButton>

      <template #tooltip>
        {{ disabledReason }}
      </template>
    </component>

    <span
      v-if="pull.status === 'done' && pull.last_synced_at"
      class="text-xs text-gray-medium"
    >
      {{ t('Dernière synchronisation : {date}', { date: formatDate(pull.last_synced_at) }) }}
    </span>
    <span
      v-else-if="pull.status === 'error'"
      class="text-xs text-new-error"
    >
      {{ pull.error }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Tooltip, useFormatDate } from '@datagouv/components-next'
import { RiDownloadCloud2Line } from '@remixicon/vue'
import { isGeopfReauthRequired, type GeopfDatasetStatus } from '~/utils/geopf'

const props = defineProps<{
  datasetId: string
  connected: boolean | null
  pull: GeopfDatasetStatus['pull']
  ficheUrl: string | null
  refresh: () => Promise<void>
}>()

const emit = defineEmits<{
  reauthRequired: []
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const disabledReason = computed(() => {
  if (props.connected !== true) return t('Connectez-vous à cartes.gouv.fr pour récupérer les services.')
  if (!props.ficheUrl) return t('Envoyez d\'abord un fichier éligible vers cartes.gouv.fr.')
  return null
})

const pulling = ref(false)

const startPull = async () => {
  pulling.value = true
  try {
    await $api(`/api/1/geopf/pull-offerings/${props.datasetId}/`, { method: 'POST' })
    // Awaited: udata marks the dataset `pending` before enqueueing, so this returns the new status.
    await props.refresh()
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
