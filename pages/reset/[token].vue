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
        <RequiredExplanation />

        <div
          v-if="errorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ errorMessage }}
        </div>

        <div>
          <InputGroup
            v-model="password"
            type="password"
            :label="$t('Mot de passe')"
            class="w-full !mb-0"
          />
        </div>
        <div>
          <InputGroup
            v-model="passwordConfirmation"
            type="password"
            :label="$t('Confirmer le mot de passe')"
            class="w-full !mb-0"
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
import { BrandedButton } from '@datagouv/components-next'

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useI18n()

useSeoMeta({ title: t('Réinitialiser le mot de passe') })

const password = ref('')
const passwordConfirmation = ref('')
const route = useRoute()

const loading = ref(false)
const errorMessage = ref('')

const reset = async () => {
  loading.value = true

  try {
    await $api(`/fr/reset/${route.params.token}`, {
      method: 'POST',
      body: {
        password: password.value,
      },
    })

    toast.success(t('Votre mot de passe a bien été réinitialisé. Vous êtes maintenant connecté.'))
    await navigateTo('/login')
  }
  finally {
    loading.value = false
  }
}
</script>
