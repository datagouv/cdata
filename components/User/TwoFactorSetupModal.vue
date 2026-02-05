<template>
  <ModalWithButton
    v-model="isOpen"
    :title="$t('Authentification deux facteurs')"
    size="lg"
    form
    @submit.prevent="($el, _close) => submit(_close)"
    @open="fetchStatusAndQRCode"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiShieldCheckLine"
        :disabled="loading"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ isConfigured ? $t("Gérer l'authentification deux facteurs") : $t("Configurer l'authentification deux facteurs") }}
      </BrandedButton>
    </template>

    <template #default>
      <p>
        {{ isConfigured ? $t('Reconfigurez votre authentification deux facteurs en scannant le nouveau QR code ci-dessous.') : $t('En plus de votre email et mot de passe, vous allez devoir utiliser un code de double authentification.') }}
      </p>

      <SimpleBanner
        v-if="getAllErrorsInErrorFields(errors, '')"
        type="danger"
      >
        {{ getAllErrorsInErrorFields(errors, "") }}
      </SimpleBanner>

      <RequiredExplanation />

      <div class="space-y-6">
        <p>
          {{ $t('Ouvrez une application d\'authentification sur votre appareil et scannez le QR code suivant (ou saisissez manuellement le code ci-dessous) pour commencer à recevoir des codes :') }}
        </p>
        <div
          data-testid="qrcode-container"
          style="max-width: 200px;"
          v-html="qrcode"
        />
        <p data-testid="totp-key">
          {{ totpKey }}
        </p>
        <div>
          <InputGroup
            v-model="code"
            data-testid="totp-code-input"
            type="text"
            :label="$t('Code d\'identification')"
            :error-text="getAllErrorsInErrorFields(errors, 'code')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'code')"
            class="w-full !mb-0"
            required
          />
        </div>
      </div>
    </template>

    <template #footer="{ close: _close }">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="_close"
          >
            {{ $t("Annuler") }}
          </BrandedButton>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            type="submit"
            color="primary"
            :loading="loading"
          >
            {{ isConfigured ? $t("Reconfigurer") : $t("Soumettre") }}
          </BrandedButton>
        </div>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner, toast } from '@datagouv/components-next'
import { RiShieldCheckLine } from '@remixicon/vue'
import RequiredExplanation from '~/components/RequiredExplanation/RequiredExplanation.vue'

const { t } = useTranslation()
const me = useMe()
const isConfigured = ref(false)
const isOpen = ref(false)

const emit = defineEmits<{
  setupComplete: []
}>()

const {
  qrcode,
  totpKey,
  code,
  loading,
  errors,
  fetchQRCode,
  validateCode,
} = useTwoFactorSetup()

const fetchStatusAndQRCode = async () => {
  const { data: twoFactorData } = await useAPI<{ response: { tf_primary_method: string | null, reauth_required: boolean } | null }>('/tf-setup')
  isConfigured.value = !!twoFactorData.value?.response?.tf_primary_method
  if (twoFactorData.value?.response?.reauth_required) {
    toast.error(t('Vous devez vous déconnecter et reconnecter pour pouvoir configurer l\'authentification deux facteurs.'))
    isOpen.value = false
    return
  }

  await fetchQRCode()
}

const submit = async (close: () => void) => {
  const success = await validateCode(async () => {
    await loadMe(me)
    emit('setupComplete')
    close()
  })

  if (success) {
    toast.success(isConfigured.value ? t('L\'authentification deux facteurs a été reconfigurée avec succès.') : t('L\'authentification deux facteurs a été configurée avec succès.'))
    isConfigured.value = true
  }
}
</script>
