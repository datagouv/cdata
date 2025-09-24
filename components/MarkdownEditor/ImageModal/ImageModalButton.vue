<template>
  <ModalWithButton
    :title="t('Ajouter une image')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <TooltipButton
        data-fr-opened="false"
        :icon="RiImageAddFill"
        :title="t('Image')"
        data-testid="image-modal-button"
        v-bind="attrs"
        v-on="listeners"
      />
    </template>
    <template #iconTitle>
      <RiImageLine class="size-7" />
    </template>
    <p>{{ t("Collez un lien de votre image pour l'ajouter à votre description. Il est recommandé de fournir également une alternative textuelle pour une image informative et un titre.") }}</p>
    <RequiredExplanation />
    <InputGroup
      v-model="form.src"
      :label="t(`Lien de l'image`)"
      :placeholder="t('Collez votre lien…')"
      :required="true"
      type="url"
      :has-error="!!getFirstError('src')"
      :error-text="getFirstError('src')"
    />
    <details>
      <summary data-testid="summary">
        {{ t("Personnaliser les options d'accessibilité") }}
      </summary>
      <div class="my-2">
        <InputGroup
          v-model="form.alt"
          :label="t(`Texte alternatif de l'image`)"
        />
        <InputGroup
          v-model="form.title"
          :label="t(`Titre de l'image`)"
        />
      </div>
    </details>
    <template #footer="{ close }">
      <div class="flex-1 flex justify-end">
        <BrandedButton
          color="primary"
          data-testid="add-image-button"
          @click="send(close)"
        >
          {{ t('Ajouter une image') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiImageAddFill, RiImageLine } from '@remixicon/vue'
import TooltipButton from '../EditorButton.vue'

export type ImageModalForm = {
  src: string
  title: string
  alt: string
}

defineOptions({
  inheritAttrs: false,
})

const emit = defineEmits<{
  (event: 'send', form: ImageModalForm): void
}>()

const { t } = useTranslation()

const initialState = {
  src: '',
  title: '',
  alt: '',
}

const form = reactive<ImageModalForm>({ ...initialState })

const { getFirstError, removeErrorsAndWarnings, validate } = useForm(form, {
  src: [required()],
})

function resetForm(close: () => void) {
  form.src = initialState.src
  form.title = initialState.title
  form.alt = initialState.alt
  removeErrorsAndWarnings()
  close()
};

async function send(close: () => void) {
  if (await validate()) {
    emit('send', { ...form })
    resetForm(close)
  }
};
</script>
