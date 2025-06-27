<template>
  <div class="bg-gray-some py-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-2xl">
        {{ $t('Réinitialiser le mot de passe') }}
      </h1>

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
            v-model="password"
            type="password"
            :label="$t('Mot de passe')"
            class="w-full !mb-0"
            :error-text="getAllErrorsInErrorFields(errors, 'password')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'password')"
            required
          />
        </div>
        <div>
          <InputGroup
            v-model="passwordConfirmation"
            type="password"
            :label="$t('Confirmer le mot de passe')"
            class="w-full !mb-0"
            :error-text="getAllErrorsInErrorFields(errors, 'passwordConfirmation')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'passwordConfirmation')"
            required
          />
        </div>

        <div class="flex justify-center">
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

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const me = useMaybeMe()

useSeoMeta({ title: t('Réinitialiser le mot de passe') })

watchEffect(async () => {
  if (me.value) {
    toast.success(t('Vous êtes déjà connecté.'))
    await navigateTo(localePath('/'))
  }
})

const password = ref('')
const passwordConfirmation = ref('')

const loading = ref(false)
const errors = ref<FieldsErrors>({})

const reset = async () => {
  loading.value = true
  errors.value = {}

  try {
    await $api(`/fr/reset/${route.params.token}/`, {
      method: 'POST',
      body: {
        password: password.value,
        password_confirm: passwordConfirmation.value,
      },
    })

    toast.success(t('Votre mot de passe a bien été réinitialisé. Vous êtes maintenant connecté.'))
    await loadMe(me)
    await navigateTo(localePath('/'))
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
