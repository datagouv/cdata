<template>
  <ModalWithButton
    v-model="isOpen"
    :title="$t('Se connecter uniquement avec ProConnect ?')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiShieldCheckLine"
        :disabled="disabled || loading"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Se connecter uniquement avec ProConnect') }}
      </BrandedButton>
    </template>

    <template #default>
      <p>
        {{ $t('Votre mot de passe et votre authentification deux facteurs data.gouv.fr seront supprimés. Vous vous connecterez uniquement avec ProConnect, et sa double authentification protégera votre compte.') }}
      </p>
      <p>
        {{ $t('Vos autres sessions ouvertes seront déconnectées.') }}
      </p>
      <SimpleBanner
        v-if="errorMessage"
        type="danger"
        class="mt-4"
      >
        {{ errorMessage }}
      </SimpleBanner>
    </template>

    <template #footer="{ close: _close }">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="_close"
          >
            {{ $t('Annuler') }}
          </BrandedButton>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            color="primary"
            :loading="loading"
            @click="() => switchToProConnectOnly(_close)"
          >
            {{ $t('Se connecter uniquement avec ProConnect') }}
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

defineProps<{
  // udata refuses the switch from a session that didn't present the second factor of the
  // account's trusted ProConnect identity.
  disabled: boolean
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()
const me = useMe()

// The request lives in the URL, as for the 2FA setup: when the switch requires a fresh
// session, the agent is sent to /verify with this URL as `next`, and comes back to the
// confirmation rather than to a page where they would have to start it again.
const route = useRoute()
const router = useRouter()
const isOpen = computed({
  get: () => route.query.proconnect_only === 'confirm',
  set: (open) => {
    if (!open) errorMessage.value = null
    router.replace({ query: { ...route.query, proconnect_only: open ? 'confirm' : undefined } })
  },
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function switchToProConnectOnly(close: () => void) {
  loading.value = true
  errorMessage.value = null
  try {
    await $api('/api/1/proconnect/only/', { method: 'POST' })
    await loadMe(me)
    toast.success(t('Votre compte se connecte maintenant uniquement avec ProConnect.'))
    close()
  }
  catch (e) {
    // A 401 has already sent the agent to /verify, with this page's URL as `next`.
    if (e instanceof FetchError && e.statusCode === 401) return
    errorMessage.value = e instanceof FetchError && e.statusCode === 403
      ? t('Connectez-vous avec ProConnect et sa double authentification (clé de sécurité, application d\'authentification) pour activer cette option.')
      : t('Votre compte n\'a pas pu passer à ProConnect.')
  }
  finally {
    loading.value = false
  }
}
</script>
