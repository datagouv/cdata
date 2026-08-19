<template>
  <BannerAction
    :type="bannerType"
    :title="bannerTitle"
  >
    <template v-if="reauthRequired">
      {{ t('Votre connexion a expiré ou a été révoquée.') }}
    </template>
    <template v-else-if="connected === false">
      {{ t('Connectez-vous pour envoyer des fichiers et récupérer les services publiés sur cartes.gouv.fr.') }}
    </template>
    <template v-else-if="connected === true">
      {{ t('Vous pouvez envoyer des fichiers vers cartes.gouv.fr depuis la liste ci-dessous.') }}
    </template>

    <template #button>
      <a
        v-if="connected !== true || reauthRequired"
        class="fr-btn fr-btn--sm"
        :href="geopfLoginUrl"
      >
        {{ t('Se connecter') }}
      </a>
      <BrandedButton
        v-else
        color="tertiary"
        size="xs"
        :icon="RiLogoutBoxLine"
        :loading="disconnecting"
        @click="disconnect"
      >
        {{ t('Se déconnecter') }}
      </BrandedButton>
    </template>
  </BannerAction>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, toast } from '@datagouv/components-next'
import { RiLogoutBoxLine } from '@remixicon/vue'

const props = defineProps<{
  // Id, not slug: /geopf/login/ only resolves by id.
  datasetId: string
  connected: boolean | null
  reauthRequired?: boolean
}>()

const emit = defineEmits<{
  disconnected: []
}>()

const { $api } = useNuxtApp()
const { t } = useTranslation()
const config = useRuntimeConfig()

const geopfLoginUrl = computed(() => `${config.public.apiBase}/api/1/geopf/login/?dataset_id=${encodeURIComponent(props.datasetId)}`)

const bannerType = computed(() => {
  if (props.reauthRequired) return 'danger'
  return props.connected === true ? 'primary' : 'warning'
})
const bannerTitle = computed(() => {
  if (props.reauthRequired) return t('Reconnexion à cartes.gouv.fr requise')
  return props.connected === true ? t('Connecté à cartes.gouv.fr') : t('Non connecté à cartes.gouv.fr')
})

const disconnecting = ref(false)

const disconnect = async () => {
  disconnecting.value = true
  try {
    await $api('/api/1/geopf/token/', { method: 'DELETE' })
    toast.success(t('Vous êtes déconnecté de cartes.gouv.fr.'))
    emit('disconnected')
  }
  finally {
    disconnecting.value = false
  }
}
</script>
