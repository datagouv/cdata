<template>
  <div class="bg-gray-some py-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center font-extrabold text-gray-title text-2xl">
        {{ $t('Réinitialiser le mot de passe') }}
      </h1>

      <p class="text-gray-plain text-sm">
        {{ $t('Vous avez oublié votre mot de passe ? Saisissez votre adresse email ci-dessous et nous vous enverrons les instructions pour en définir un nouveau.') }}
      </p>

      <form
        class="space-y-6"
        @submit.prevent="reset"
      >
        <SimpleBanner
          v-if="getAllErrorsInErrorFields(errors, '')"
          type="danger"
        >
          {{ getAllErrorsInErrorFields(errors, "") }}
        </SimpleBanner>

        <RequiredExplanation />

        <div>
          <InputGroup
            v-model="email"
            type="email"
            :label="$t('Adresse email')"
            class="w-full !mb-0"
            :error-text="getAllErrorsInErrorFields(errors, 'email')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'email')"
            required
          />
        </div>

        <div>
          <Captchetat
            v-if="config.public.captcheta.enabled"
            v-model:uuid="captchaUuid"
            v-model:code="captchaCode"
            :errors="getAllErrorsInErrorFields(errors, 'captcha_code')"
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
import type { FieldsErrors } from '~/types/form'

definePageMeta({
  matomoIgnore: true,
})

const { t } = await useTranslation()
const config = useRuntimeConfig()

useSeoMeta({ title: t('Réinitialiser le mot de passe') })

const email = ref('')
const captchaUuid = ref('')
const captchaCode = ref('')

const loading = ref(false)
const success = ref(false)
const errors = ref<FieldsErrors>({})

const postApiWithCsrf = usePostApiWithCsrf()
const reset = async () => {
  if (success.value) return

  loading.value = true
  errors.value = {}

  try {
    await postApiWithCsrf('/reset/', {
      email: email.value,
      captcha_uuid: captchaUuid.value,
      captcha_code: captchaCode.value,
    })

    success.value = true
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
</script>
