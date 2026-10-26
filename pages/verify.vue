<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-gray-title font-extrabold text-2xl">
        {{ $t('Confirmer votre identité') }}
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
              v-model="password"
              type="password"
              :label="$t('Mot de passe')"
              class="w-full !mb-0"
              :error-text="getAllErrorsInErrorFields(errors, 'password')"
              :has-error="!! getAllErrorsInErrorFields(errors, 'password')"
              required
            />
          </div>
          <div class="flex justify-center">
            <BrandedButton
              type="submit"
              :loading="loading"
            >
              {{ $t('Vérifier le mot de passe') }}
            </BrandedButton>
          </div>
        </form>

        <Divider>{{ $t('ou') }}</Divider>

        <ProConnectButton :label="$t('S’identifier avec')">
          <input
            type="hidden"
            name="reauth"
            value="1"
          >
        </ProConnectButton>
      </div>
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

useSeoMeta({ title: t('Réauthentification'), robots: 'noindex' })

const password = ref('')
const loading = ref(false)
const errors = ref<FieldsErrors>({})
const me = useMe()

const route = useRoute()
// Read before the site header consumes the flash and strips it from the URL.
const proconnectSucceeded = route.query.flash === 'proconnect_reauth_success'

const goToNext = async () => {
  const next = sessionStorage.getItem('next')
  if (next) {
    navigateTo(next)
  }
  else {
    await navigateTo('/')
  }
}

onMounted(async () => {
  if (route.query.next) {
    sessionStorage.setItem('next', route.query.next as string)
  }
  // Back from ProConnect: udata redirects here, the destination stayed in `sessionStorage`.
  if (proconnectSucceeded) {
    await goToNext()
  }
})

const postApiWithCsrf = usePostApiWithCsrf()
const connect = async () => {
  loading.value = true
  errors.value = {}

  try {
    await postApiWithCsrf<{ response: { tf_required: boolean, tf_state: string } }>('/verify', {
      password: password.value,
    })

    toast.success(t('Compte confirmé.'))
    await loadMe(me)
    await goToNext()
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
