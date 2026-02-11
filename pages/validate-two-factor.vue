<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-gray-title font-extrabold text-2xl">
        {{ $t('Authentification deux facteurs') }}
      </h1>

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

definePageMeta({
  matomoIgnore: true,
})

const { t } = useTranslation()

useSeoMeta({ title: t('Connexion'), robots: 'noindex' })

const me = useMe()

const route = useRoute()

const {
  code,
  loading,
  errors,
  validateCode,
} = useTwoFactorSetup()

onMounted(() => {
  if (route.query.next) {
    sessionStorage.setItem('next', route.query.next as string)
  }
})

const connect = async () => {
  await validateCode(async () => {
    toast.success(t('Vous êtes maintenant connecté.'))
    await loadMe(me)

    const next = sessionStorage.getItem('next')
    if (next) {
      navigateTo(next)
    }
    else {
      await navigateTo('/')
    }
  })
}
</script>
