<template>
  <ModalWithButton
    v-model="isOpen"
    :title="$t('Authentification deux facteurs')"
    size="lg"
    form
    @submit.prevent="($el, _close) => submit(_close)"
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
import { FetchError } from 'ofetch'
import RequiredExplanation from '~/components/RequiredExplanation/RequiredExplanation.vue'

const { t } = useTranslation()
const me = useMe()
const isConfigured = ref(false)

// The request for the setup lives in the URL, unlike other modals: when the setup requires
// a fresh session, the agent is sent to /verify with this URL as `next`, and comes back to
// the setup itself rather than to a page where they would have to start it again.
const route = useRoute()
const router = useRouter()
const requested = computed(() => route.query.two_factor === 'setup')
const setRequested = (value: boolean) => router.replace({ query: { ...route.query, two_factor: value ? 'setup' : undefined } })
// Shown only once udata accepts the setup, so that it does not flash before /verify.
const shown = ref(false)
const isOpen = computed({
  get: () => shown.value,
  set: (open) => {
    if (!open) shown.value = false
    setRequested(open)
  },
})

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

const { $api } = useNuxtApp()
const fetchStatusAndQRCode = async () => {
  // fetch two factor status. If freshness is required, a 401 is returned with automatic handling and redirection to /verify
  try {
    const { response } = await $api<{ response: { tf_primary_method: string | null } | null }>('/tf-setup')
    isConfigured.value = !!response?.tf_primary_method
  }
  catch (e) {
    // A 401 has already sent the agent to /verify or /login, with this page's URL as
    // `next`: rewriting the query now would strip it from the new page. Any other error
    // leaves them here, so the request is dropped for the button to ask again.
    if (!(e instanceof FetchError) || e.statusCode !== 401) setRequested(false)
    return
  }
  shown.value = true
  await fetchQRCode()
}

watch(requested, (value) => {
  if (value) fetchStatusAndQRCode()
  else shown.value = false
})
onMounted(() => {
  if (requested.value) fetchStatusAndQRCode()
})

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
