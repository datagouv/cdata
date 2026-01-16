<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-gray-title font-extrabold text-2xl">
        {{ $t('Authentification deux facteurs') }}
      </h1>

      <p>
        {{ $t('En plus de votre email et mot de passe, vous allez devoir utiliser un code de double authentification.') }}
      </p>
      <div class="space-y-6">
        <SimpleBanner
          v-if="getAllErrorsInErrorFields(errors, '')"
          type="danger"
        >
          {{ getAllErrorsInErrorFields(errors, "") }}
        </SimpleBanner>

        <RequiredExplanation />

        <form
          class="space-y-6"
          @submit.prevent="connect"
        >
          <p>
            {{ $t('Ouvrez une application d’authentification sur votre appareil et scannez le QR code suivant (ou saisissez manuellement le code ci-dessous) pour commencer à recevoir des codes :') }}
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

          <div class="flex justify-center">
            <BrandedButton
              type="submit"
              :loading="loading"
            >
              {{ $t('Soumettre') }}
            </BrandedButton>
          </div>
        </form>

        <div class="text-center text-gray-plain text-sm">
          {{ $t('Problème d’accès à votre compte ? / Appareil mobile perdu ?') }} <CdataLink to="/support">
            {{ $t('Contacter le support') }}
          </CdataLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner, toast } from '@datagouv/components-next'
import type { FieldsErrors } from '~/types/form'
import { usePostApiWithCsrf } from '~/utils/api'
import { renderSVG } from 'uqr'

definePageMeta({
  matomoIgnore: true,
})

const { t } = useTranslation()

useSeoMeta({ title: t('Connexion') })

const qrcode = ref('')
const totpKey = ref('')
const code = ref('')
const loading = ref(false)
const errors = ref<FieldsErrors>({})
const me = useMe()

const route = useRoute()
onMounted(async () => {
  if (route.query.next) {
    sessionStorage.setItem('next', route.query.next as string)
  }

  loading.value = true
  // Setup qrcode
  try {
    const { response } = await postApiWithCsrf<{ response: { tf_authr_issuer: string, tf_authr_username: string, tf_authr_key: string } }>('/tf-setup', {
      setup: 'authenticator',
    })
    qrcode.value = renderSVG(`otpauth://totp/${response.tf_authr_issuer}:${response.tf_authr_username}?secret=${response.tf_authr_key}&issuer=${response.tf_authr_issuer}`)
    totpKey.value = response.tf_authr_key
  }
  catch {
    toast.error(t('Erreur de récupération du qrcode'))
  }
  finally {
    loading.value = false
  }
})

const postApiWithCsrf = usePostApiWithCsrf()
const connect = async () => {
  loading.value = true
  errors.value = {}

  try {
    await postApiWithCsrf('/tf-validate', {
      code: code.value,
    })

    toast.success(t('Vous êtes maintenant connecté.'))
    await loadMe(me)

    const next = sessionStorage.getItem('next')
    if (next) {
      navigateTo(next)
    }
    else {
      await navigateTo('/')
    }
  }
  catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldsErrors = (e as any)?.response?._data?.response?.field_errors
    if (fieldsErrors) errors.value = fieldsErrors
  }
  finally {
    loading.value = false
  }
}

useSeoMeta({ robots: 'noindex' })
</script>
