<template>
  <ModalWithButton
    :title="$t('Changer de mot de passe')"
    size="lg"
    form
    @submit.prevent="($el, close) => submit(close)"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiEditLine"
        :disabled="loading"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t("Changer de mot de passe") }}
      </BrandedButton>
    </template>

    <template #default="{ close }">
      <SimpleBanner
        v-if="getAllErrorsInErrorFields(errors, '')"
        type="danger"
      >
        {{ getAllErrorsInErrorFields(errors, "") }}
      </SimpleBanner>

      <div>
        <InputGroup
          v-model="oldPassword"
          type="password"
          :label="$t('Mot de passe actuel')"
          :error-text="getAllErrorsInErrorFields(errors, 'password')"
          :has-error="!! getAllErrorsInErrorFields(errors, 'password')"
          required
        />
        <InputGroup
          v-model="newPassword"
          type="password"
          :label="$t('Nouveau mot de passe')"
          :error-text="getAllErrorsInErrorFields(errors, 'new_password')"
          :has-error="!! getAllErrorsInErrorFields(errors, 'new_password')"
          required
        />
        <InputGroup
          v-model="confirmNewPassword"
          type="password"
          :label="$t('Confirmer le nouveau mot de passe')"
          :error-text="getAllErrorsInErrorFields(errors, 'new_password_confirm')"
          :has-error="!! getAllErrorsInErrorFields(errors, 'new_password_confirm')"
          required
        />
      </div>
    </template>

    <template #footer="{ close }">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="close"
          >
            {{ $t("Cancel") }}
          </BrandedButton>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            type="submit"
            color="primary"
            :disabled="loading"
          >
            {{ $t("Changer de mot de passe") }}
          </BrandedButton>
        </div>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import { RiEditLine } from '@remixicon/vue'
import type { FieldsErrors } from '~/types/form'

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useI18n()

const loading = ref(false)
const errors = ref<FieldsErrors>({})

const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

const submit = async (close: () => void) => {
  loading.value = true
  errors.value = {}

  try {
    const { response: { csrf_token } } = await $api<{ response: { csrf_token: string } }>('/fr/change/')

    await $api('/fr/change/', {
      method: 'POST',
      body: {
        password: oldPassword.value,
        new_password: newPassword.value,
        new_password_confirm: confirmNewPassword.value,
      },
      headers: {
        'X-CSRFToken': csrf_token,
      },
    })

    toast.success(t('Mot de passe modifié.'))
    close()
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
