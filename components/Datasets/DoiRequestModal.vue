<template>
  <ModalWithButton
    :title="$t('Demander un DOI')"
    size="lg"
    form
    @submit.prevent="(_event, close) => submit(close)"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiChatNewLine"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Demander un DOI') }}
      </BrandedButton>
    </template>

    <p>
      {{ $t("Un DOI (Digital Object Identifier) est un identifiant pérenne qui permet de citer ce jeu de données dans une publication scientifique. Votre demande ouvre une conversation avec l'équipe du support, qui étudiera si ce jeu de données peut en recevoir un.") }}
    </p>

    <InputGroup
      v-model="form.email"
      :label="$t('Votre adresse email')"
      type="email"
      required
      :has-error="!!getFirstError('email')"
      :error-text="getFirstError('email')"
      @blur="touch('email')"
    />
    <InputGroup
      v-model="form.message"
      :label="$t('Pourquoi avez-vous besoin de ce DOI ?')"
      :placeholder="$t('Décrivez la publication ou le travail dans lequel vous souhaitez citer ce jeu de données.')"
      type="textarea"
      required
      :has-error="!!getFirstError('message')"
      :error-text="getFirstError('message')"
      @blur="touch('message')"
    />

    <template #footer="{ close }">
      <div class="flex-1 flex justify-end space-x-4">
        <BrandedButton
          color="secondary"
          :disabled="loading"
          @click="close"
        >
          {{ $t('Annuler') }}
        </BrandedButton>
        <BrandedButton
          type="submit"
          color="primary"
          :loading
          :icon="RiMailSendLine"
        >
          {{ $t('Envoyer la demande') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import type { DatasetV2WithFullObject } from '@datagouv/components-next'
import { RiChatNewLine, RiMailSendLine } from '@remixicon/vue'
import ModalWithButton from '~/components/Modal/ModalWithButton.vue'

const props = defineProps<{
  dataset: DatasetV2WithFullObject
}>()

const { t } = useTranslation()
const me = useMaybeMe()
const loading = ref(false)

const { form, touch, getFirstError, validate } = useForm({
  email: me.value?.email ?? '',
  message: '',
}, {
  email: [required(), email()],
  message: [required()],
})

async function submit(close: () => void) {
  if (!await validate()) return

  loading.value = true
  try {
    await $fetch('/nuxt-api/send-message', {
      method: 'POST',
      body: {
        email: form.value.email,
        segment: 'doi',
        subject: t('Demande de DOI pour « {title} »', { title: props.dataset.title }),
        body: `${props.dataset.page}\n\n${form.value.message}`,
      },
    })
    toast.success(t('Votre demande de DOI a bien été envoyée.'))
    close()
  }
  catch {
    toast.error(t(`Une erreur est survenue lors de l'envoi de votre demande`))
  }
  finally {
    loading.value = false
  }
}
</script>
