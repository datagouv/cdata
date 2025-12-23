<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-gray-title font-extrabold text-2xl">
        {{ $t('Se connecter') }}
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
              :id="rememberMeId"
              v-model="rememberMe"
              type="checkbox"
            >
            <label
              class="fr-label"
              :for="rememberMeId"
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
        </form>

        <div class="text-center text-gray-plain text-sm">
          {{ $t('Mot de passe oublié ?') }} <CdataLink to="/reset">
            {{ $t('Récupérer votre mot de passe') }}
          </CdataLink>
        </div>
        <div
          v-if="config.public.requireEmailConfirmation"
          class="text-center text-gray-plain text-sm"
        >
          {{ $t('Instructions de confirmation non reçues ?') }} <CdataLink to="/resend-confirm-email">
            {{ $t('Renvoyer les instructions') }}
          </CdataLink>
        </div>

        <Divider>{{ $t('ou') }}</Divider>

        <form :action="proconnectUrl">
          <div class="fr-connect-group flex flex-col items-center">
            <button class="fr-connect">
              <span class="fr-connect__login">{{ $t('Se connecter avec') }}</span>
              <span class="fr-connect__brand">ProConnect</span>
            </button>
            <p>
              <CdataLink
                :href="config.public.proconnect.homepage"
                target="_blank"
                rel="noopener"
              >
                {{ $t(`Qu'est-ce que ProConnect ?`) }}
              </CdataLink>
            </p>
          </div>
        </form>
      </div>
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
import { BrandedButton, SimpleBanner, toast } from '@datagouv/components-next'
import type { FieldsErrors } from '~/types/form'
import { usePostApiWithCsrf } from '~/utils/api'

definePageMeta({
  matomoIgnore: true,
})

const { t } = useTranslation()
const config = useRuntimeConfig()

useSeoMeta({ title: t('Connexion') })

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const rememberMeId = useId()
const loading = ref(false)
const errors = ref<FieldsErrors>({})
const me = useMe()

const route = useRoute()

onMounted(() => {
  if (route.query.next) {
    sessionStorage.setItem('next', route.query.next as string)
  }
})

const postApiWithCsrf = usePostApiWithCsrf()
const connect = async () => {
  loading.value = true
  errors.value = {}

  try {
    await postApiWithCsrf('/login/', {
      email: email.value,
      password: password.value,
      remember: rememberMe.value,
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

const proconnectUrl = computed(() => `${config.public.apiBase}/api/1/proconnect/login/`)
</script>
