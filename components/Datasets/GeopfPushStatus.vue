<template>
  <component
    :is="disabledReason ? Tooltip : 'div'"
    v-if="push.status === null"
  >
    <BrandedButton
      color="secondary"
      size="xs"
      :icon="RiUploadCloud2Line"
      :disabled="!!disabledReason"
      :loading="pushing"
      @click="startPush"
    >
      {{ t('Envoyer vers cartes.gouv.fr') }}
    </BrandedButton>

    <template #tooltip>
      {{ disabledReason }}
    </template>
  </component>

  <AdminBadge
    v-else-if="push.status === 'pending'"
    size="xs"
    type="primary"
  >
    {{ t('Envoi en cours…') }}
  </AdminBadge>

  <div
    v-else-if="push.status === 'done'"
    class="flex flex-col items-start"
  >
    <AdminBadge
      size="xs"
      type="success"
    >
      {{ t('Synchronisé') }}
    </AdminBadge>
    <span
      v-if="push.last_synced_at"
      class="text-xs text-gray-medium"
    >
      {{ formatDate(push.last_synced_at) }}
    </span>
  </div>

  <div
    v-else
    class="flex flex-col items-start gap-1"
  >
    <Tooltip>
      <AdminBadge
        size="xs"
        type="danger"
      >
        {{ push.status === 'timeout' ? t('Délai dépassé') : t("Échec de l'envoi") }}
      </AdminBadge>

      <template #tooltip>
        {{ push.error }}
      </template>
    </Tooltip>

    <BrandedButton
      color="tertiary"
      size="xs"
      :icon="RiRefreshLine"
      :disabled="!!disabledReason"
      :loading="pushing"
      @click="startPush"
    >
      {{ t('Réessayer') }}
    </BrandedButton>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, Tooltip, useFormatDate } from '@datagouv/components-next'
import { RiRefreshLine, RiUploadCloud2Line } from '@remixicon/vue'
import { isGeopfReauthRequired, type GeopfPushableResource } from '~/utils/geopf'

const props = defineProps<{
  resource: GeopfPushableResource
  datasetId: string
  connected: boolean | null
  datastoreId: string | null
  refresh: () => Promise<void>
}>()

const emit = defineEmits<{
  reauthRequired: []
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()
const { formatDate } = useFormatDate()

const push = computed(() => props.resource.push)

const disabledReason = computed(() => {
  if (props.connected !== true) return t('Connectez-vous à cartes.gouv.fr pour envoyer ce fichier.')
  if (!props.datastoreId) return t('Choisissez d\'abord l\'entrepôt cartes.gouv.fr de ce jeu de données.')
  return null
})

const pushing = ref(false)

const startPush = async () => {
  pushing.value = true
  try {
    await $api(`/api/1/geopf/push/${props.datasetId}/${props.resource.id}/`, {
      method: 'POST',
      body: { datastore_id: props.datastoreId },
    })
    // Awaited: udata marks the resource `pending` before enqueueing, so this returns
    // the new status and the button never re-enables in between.
    await props.refresh()
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
