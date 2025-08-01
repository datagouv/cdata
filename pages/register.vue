<template>
  <div class="bg-gray-some py-6 space-y-6">
    <div class="container bg-white max-w-xl p-6 border border-gray-lower">
      <h1 class="text-center text-gray-title font-extrabold text-2xl">
        {{ $t('S\'enregistrer') }}
      </h1>

      <p><a :href="config.public.guidesCreateAccount">{{ $t('Pourquoi créer un compte ?') }}</a></p>

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

        <div>
          <InputGroup
            v-model="passwordConfirmation"
            type="password"
            :label="$t('Confirmer le mot de passe')"
            class="w-full !mb-0"
            :error-text="getAllErrorsInErrorFields(errors, 'password_confirm')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'password_confirm')"
            required
          />
        </div>

        <div>
          <InputGroup
            v-model="firstname"
            type="text"
            :label="$t('Prénom')"
            :error-text="getAllErrorsInErrorFields(errors, 'first_name')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'first_name')"
            class="w-full !mb-0"
            required
          />
        </div>
        <div>
          <InputGroup
            v-model="lastname"
            type="text"
            :label="$t('Nom')"
            :error-text="getAllErrorsInErrorFields(errors, 'last_name')"
            :has-error="!! getAllErrorsInErrorFields(errors, 'last_name')"
            class="w-full !mb-0"
            required
          />
        </div>

        <div class="fr-checkbox-group fr-checkbox-group--sm">
          <input
            id="checkboxes-hint-el-sm-1"
            v-model="acceptConditions"
            name="checkboxes-hint-el-sm-1"
            type="checkbox"
            aria-describedby="checkboxes-hint-el-sm-1-messages"
          >
          <label
            class="fr-label"
            for="checkboxes-hint-el-sm-1"
          >
            <i18n-t
              keypath="J'ai lu et j'accepte {link}"
              tag="p"
              class="fr-m-0 fr-mb-1w"
            >
              <template #link>
                <CdataLink to="/pages/legal/cgu">{{ $t('les conditions générales d\'utilisation du service') }}</CdataLink>
              </template>
            </i18n-t>
          </label>
        </div>

        <div>
          <Captchetat
            v-model:uuid="captchaUuid"
            v-model:code="captchaCode"
            :errors="getAllErrorsInErrorFields(errors, 'captcha_code')"
          />
        </div>

        <SimpleBanner
          v-if="success"
          type="success"
        >
          {{ $t('Un email vous a été envoyé afin de confirmer votre adresse email.') }}
        </SimpleBanner>
        <div
          v-else
          class="flex justify-center"
        >
          <BrandedButton
            type="submit"
            :loading="loading"
          >
            {{ $t('S\'enregistrer') }}
          </BrandedButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import type { FieldsErrors } from '~/types/form'

const config = useRuntimeConfig()
const { $api } = useNuxtApp()
const { t } = useI18n()
const route = useRoute()

useSeoMeta({ title: t('S\'enregistrer') })

const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const firstname = ref('')
const lastname = ref('')
const acceptConditions = ref(false)
const captchaCode = ref('')
const captchaUuid = ref('')
const loading = ref(false)
const errors = ref<FieldsErrors>({})
const success = ref(false)

onMounted(() => {
  if (route.query.next) {
    sessionStorage.setItem('next', route.query.next as string)
  }
})

const connect = async () => {
  if (success.value) return

  loading.value = true
  errors.value = {}

  try {
    await $api('/fr/register/', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        password_confirm: passwordConfirmation.value,
        first_name: firstname.value,
        last_name: lastname.value,
        captcha_uuid: captchaUuid.value,
        captcha_code: captchaCode.value,
      },
    })

    if (config.public.requireEmailConfirmation) {
      success.value = true
    }
    else {
      const next = sessionStorage.getItem('next')
      if (next) {
        navigateTo(next)
      }
      else {
        await navigateTo('/')
      }
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
</script>
