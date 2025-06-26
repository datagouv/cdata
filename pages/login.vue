<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-2xl">
        {{ $t('Se connecter') }}
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

        <div class="fr-checkbox-group fr-checkbox-group--sm">
          <input
            id="checkboxes-hint-el-sm-1"
            v-model="rememberMe"
            name="checkboxes-hint-el-sm-1"
            type="checkbox"
            aria-describedby="checkboxes-hint-el-sm-1-messages"
          >
          <label
            class="fr-label"
            for="checkboxes-hint-el-sm-1"
          >
            {{ $t('Se souvenir de moi') }}
          </label>
        </div>

        <div class="flex justify-center">
          <BrandedButton
            type="submit"
            :loading="loading"
          >
            {{ $t('Se connecter') }}
          </BrandedButton>
        </div>

        <div class="text-center text-gray-plain text-sm">
          {{ $t('Mot de passe oublié ?') }} <NuxtLinkLocale to="/reset">
            {{ $t('Récupérer votre mot de passe') }}
          </NuxtLinkLocale>
        </div>
        <div class="text-center text-gray-plain text-sm">
          {{ $t('Instructions de confirmation non reçues ?') }} <NuxtLinkLocale to="/confirm">
            {{ $t('Renvoyer les instructions') }}
          </NuxtLinkLocale>
        </div>
      </form>
    </div>
    <div class="container bg-white max-w-xl p-6 border border-gray-lower flex flex-col sm:items-center">
      <p class="font-bold text-sm text-center">
        {{ $t('Vous n\'avez pas de compte ?') }}
      </p>
      <BrandedButton href="/register">
        {{ $t('Créer un compte') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import type { FieldsErrors } from '~/types/form'

const { $api } = useNuxtApp()
const { t } = useI18n()
const { toast } = useToast()
const localePath = useLocalePath()

useSeoMeta({ title: t('Connexion') })

const email = ref('thibaud.dauce@data.gouv.fr')
const password = ref('password')
const rememberMe = ref(false)
const loading = ref(false)
const errors = ref<FieldsErrors>({})
const me = useMe()

const connect = async () => {
  loading.value = true
  errors.value = {}

  try {
    await $api<{ response: { user: { authentication_token: string } } }>('/fr/login/', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        remember: rememberMe.value,
      },
    })

    toast.success(t('Vous êtes maintenant connecté.'))
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
