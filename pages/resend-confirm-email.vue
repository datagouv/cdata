<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-gray-title font-extrabold text-2xl">
        {{ $t('Renvoyer les instructions de confirmation') }}
      </h1>

      <form
        class="space-y-6"
        @submit.prevent="connect"
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
            :error-text="getAllErrorsInErrorFields(errors, 'email')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'email')"
            class="w-full !mb-0"
            required
          />
        </div>

        <SimpleBanner
          v-if="success"
          type="success"
        >
          {{ $t('Un email vous a été renvoyé afin de confirmer votre adresse email.') }}
        </SimpleBanner>
        <div
          v-else
          class="flex justify-center"
        >
          <BrandedButton
            type="submit"
            :loading="loading"
          >
            {{ $t('Renvoyer les instructions de confirmation') }}
          </BrandedButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import type { FieldsErrors } from '~/types/form'

const { t } = useI18n()

useSeoMeta({ title: t('Renvoyer les instructions de confirmation') })

const email = ref('')
const loading = ref(false)
const errors = ref<FieldsErrors>({})
const success = ref(false)

const postApiWithCsrf = usePostApiWithCsrf()
const connect = async () => {
  if (success.value) return
  loading.value = true
  errors.value = {}

  try {
    await postApiWithCsrf('/confirm/', {
      email: email.value,
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
