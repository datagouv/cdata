<template>
  <ModalWithButton
    :title="$t(`Modifier l'adresse email`)"
    size="lg"
    form
    @submit.prevent="($el, _close) => submit(_close)"
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
        {{ $t("Modifier l'adresse email") }}
      </BrandedButton>
    </template>

    <template #default="{ close: _close }">
      <SimpleBanner
        v-if="getAllErrorsInErrorFields(errors, '')"
        type="danger"
      >
        {{ getAllErrorsInErrorFields(errors, "") }}
      </SimpleBanner>

      <div>
        <InputGroup
          v-model="newEmail"
          type="email"
          :label="$t('Nouvelle adresse email')"
          :error-text="getAllErrorsInErrorFields(errors, 'new_email')"
          :has-error="!! getAllErrorsInErrorFields(errors, 'new_email')"
          required
        />
        <InputGroup
          v-model="confirmNewEmail"
          type="email"
          :label="$t('Confirmer la nouvelle adresse email')"
          :error-text="getAllErrorsInErrorFields(errors, 'new_email_confirm')"
          :has-error="!! getAllErrorsInErrorFields(errors, 'new_email_confirm')"
          required
        />
      </div>
    </template>

    <template #footer="{ close: _close }">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="_close"
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
            {{ $t("Modifier l'adresse email") }}
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

const newEmail = ref('')
const confirmNewEmail = ref('')

const submit = async (close: () => void) => {
  loading.value = true
  errors.value = {}

  try {
    // Using change password endpoint to get a CSRF Token because change-email doesn't support JSON.
    const { response: { csrf_token } } = await $api<{ response: { csrf_token: string } }>('/fr/change/')

    await $api('/fr/change-email', {
      method: 'POST',
      body: {
        new_email: newEmail.value,
        new_email_confirm: confirmNewEmail.value,
        csrf_token,
      },
    })

    toast.success(t('Adresse email modifiée, veuillez valider le changement via le mail reçu.'))
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
