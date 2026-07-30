<template>
  <component
    :is="disabledReason ? Tooltip : 'div'"
    v-if="pushState.status === null"
  >
    <BrandedButton
      color="secondary"
      size="xs"
      :icon="RiUploadCloud2Line"
      :disabled="!!disabledReason"
      :loading="pushing"
      @click="push"
    >
      {{ t('Envoyer vers cartes.gouv.fr') }}
    </BrandedButton>

    <template #tooltip>
      {{ disabledReason }}
    </template>
  </component>

  <AdminBadge
    v-else-if="pushState.status === 'pending'"
    size="xs"
    :type="getGeopfBadgeType(pushState.status)"
  >
    {{ t('Envoi en cours…') }}
  </AdminBadge>

  <div
    v-else-if="pushState.status === 'done'"
    class="flex flex-col items-start"
  >
    <AdminBadge
      size="xs"
      :type="getGeopfBadgeType(pushState.status)"
    >
      {{ t('Synchronisé') }}
    </AdminBadge>
    <span
      v-if="pushState.lastSyncedAt"
      class="text-xs text-gray-medium"
    >
      {{ formatDate(pushState.lastSyncedAt) }}
    </span>
  </div>

  <div
    v-else
    class="flex flex-col items-start gap-1"
  >
    <Tooltip>
      <AdminBadge
        size="xs"
        :type="getGeopfBadgeType(pushState.status)"
      >
        {{ pushState.status === 'timeout' ? t('Délai dépassé') : t("Échec de l'envoi") }}
      </AdminBadge>

      <template #tooltip>
        {{ pushState.error }}
      </template>
    </Tooltip>

    <BrandedButton
      color="tertiary"
      size="xs"
      :icon="RiRefreshLine"
      :disabled="!!disabledReason"
      :loading="pushing"
      @click="push"
    >
      {{ t('Réessayer') }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Tooltip, useFormatDate, type Resource } from '@datagouv/components-next'
import { RiRefreshLine, RiUploadCloud2Line } from '@remixicon/vue'
import { getGeopfBadgeType, getGeopfPushState, isGeopfReauthRequired } from '~/utils/geopf'

const props = defineProps<{
  resource: Resource
  datasetId: string
  connected: boolean | null
  datastoreId: string | null
}>()

const emit = defineEmits<{
  pushed: []
  reauthRequired: []
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const pushState = computed(() => getGeopfPushState(props.resource))

const disabledReason = computed(() => {
  if (props.connected !== true) return t('Connectez-vous à cartes.gouv.fr pour envoyer ce fichier.')
  if (!props.datastoreId) return t('Choisissez d\'abord l\'entrepôt cartes.gouv.fr de ce jeu de données.')
  return null
})

const pushing = ref(false)

const push = async () => {
  pushing.value = true
  try {
    await $api(`/api/1/geopf/push/${props.datasetId}/${props.resource.id}/`, {
      method: 'POST',
      body: { datastore_id: props.datastoreId },
    })
    emit('pushed')
  }
  catch (error) {
    if (isGeopfReauthRequired(error)) {
      emit('reauthRequired')
    }
    // Otherwise plugins/api.ts already toasted the error.
  }
  finally {
    pushing.value = false
  }
}
</script>
