<template>
  <div class="bg-gray-some py-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-2xl">
        {{ $t('Réinitialiser le mot de passe') }}
      </h1>

      <p class="text-gray-plain text-sm">
        {{ $t('Vous avez oublié votre mot de passe ? Saisissez votre adresse email ci-dessous et nous vous enverrons les instructions pour en définir un nouveau.') }}
      </p>

      <form
        class="space-y-6"
        @submit.prevent="reset"
      >
        <RequiredExplanation />

        <div
          v-if="errorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ errorMessage }}
        </div>

        <div>
          <InputGroup
            v-model="email"
            type="email"
            :label="$t('Adresse email')"
            class="w-full !mb-0"
          />
        </div>

        <div>
          <Captchetat
            v-model:uuid="captchaUuid"
            v-model:code="captchaCode"
          />
        </div>

        <SimpleBanner
          v-if="success"
          type="success"
        >
          {{ $t('Les instructions de réinitialisation de votre mot de passe ont été envoyées à {email}.', { email }) }}
        </SimpleBanner>
        <div
          v-else
          class="flex justify-center"
        >
          <BrandedButton
            type="submit"
            :loading
          >
            {{ $t('Réinitialiser le mot de passe') }}
          </BrandedButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'

const { t } = useI18n()
const { $api } = useNuxtApp()

useSeoMeta({ title: t('Réinitialiser le mot de passe') })

const email = ref('thibaud.dauce@data.gouv.fr')
const captchaUuid = ref('')
const captchaCode = ref('')

const loading = ref(false)
const success = ref(false)
const errorMessage = ref('')

const reset = async () => {
  loading.value = true

  try {
    await $api('/fr/reset/', {
      method: 'POST',
      body: {
        email: email.value,
        captcha_uuid: captchaUuid.value,
        captcha_code: captchaCode.value,
      },
    })

    success.value = true
  }
  finally {
    loading.value = false
  }
}
</script>
