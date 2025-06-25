<template>
  <div class="bg-gray-some py-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-2xl">
        {{ $t('Se connecter') }}
      </h1>

      <form
        class="space-y-6"
        @submit.prevent="connect"
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
            required
          />
        </div>

        <div>
          <InputGroup
            v-model="password"
            type="password"
            :label="$t('Mot de passe')"
            class="w-full !mb-0"
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
            :disabled="isLoading"
          >
            {{ isLoading ? $t('Connexion...') : $t('Se connecter') }}
          </BrandedButton>
        </div>

        <div class="text-center text-gray-plain text-sm">
          {{ $t('Mot de passe oublié ?') }} <NuxtLinkLocale to="/reset">
            {{ $t('Récupérer votre mot de passe') }}
          </NuxtLinkLocale>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'

const { $api } = useNuxtApp()
const { t } = useI18n()

useSeoMeta({ title: t('Connexion') })

const email = ref('thibaud.dauce@data.gouv.fr')
const password = ref('password')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const me = useMe()

const connect = async () => {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    // const { response: { csrf_token } } = await $api<{ response: { csrf_token: string } }>('/fr/login/', {
    //   method: 'GET',
    // })

    // console.log(csrf_token)

    const token = useToken()

    const { response } = await $api<{ response: { user: { authentication_token: string } } }>('/fr/login/?include_auth_token=true', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        remember: rememberMe.value,
      },
      // headers: {
      //   'X-CSRF-Token': csrf_token,
      // },
    })

    // const newToken = response.user.authentication_token
    // token.value = newToken
    // refreshCookie('token')
    await loadMe(me)
  }
  catch (error: any) {
    // Gestion des erreurs Flask Security
    if (error.status === 400) {
      console.log(error)
      // Erreurs de validation
      if (error.data?.errors) {
        errorMessage.value = Object.values(error.data.errors).flat().join(', ')
      }
      else if (error.data?.error) {
        errorMessage.value = error.data.error
      }
      else {
        errorMessage.value = 'Email ou mot de passe incorrect'
      }
    }
    else if (error.status === 401) {
      errorMessage.value = 'Email ou mot de passe incorrect'
    }
    else if (error.status === 429) {
      errorMessage.value = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.'
    }
    else if (error.status === 422) {
      // Erreurs CSRF ou de validation
      errorMessage.value = 'Erreur de sécurité. Veuillez actualiser la page et réessayer.'
    }
    else {
      errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.'
    }
  }
  finally {
    isLoading.value = false
  }
}
</script>
