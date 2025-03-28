<template>
  <ModalWithButton
    :title="t('Add an image')"
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
    <p>{{ t("Paste a link of your image to add it to your description. It is recommended to also provide a textual alternative for an informative image and a title.") }}</p>
    <RequiredExplanation />
    <InputGroup
      v-model="form.src"
      :label="t('Image link')"
      :placeholder="t('Paste your link…')"
      :required="true"
      type="url"
      :has-error="fieldHasError('src')"
      :error-text="getErrorText('src')"
    />
    <details>
      <summary data-testid="summary">
        {{ t("Customize accessibility options") }}
      </summary>
      <div class="fr-my-1w">
        <InputGroup
          v-model="form.alt"
          :label="t('Image alternative text')"
        />
        <InputGroup
          v-model="form.title"
          :label="t('Image title')"
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
          {{ t('Add image') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

const nuxtApp = useNuxtApp()

const required = createRequired(nuxtApp.$i18n)

const initialState = {
  src: '',
  title: '',
  alt: '',
}

const form = reactive<ImageModalForm>({ ...initialState })

const requiredRules = {
  src: { required },
}

const { getErrorText, getFunctionalState, hasError, reset, validateRequiredRules, v$ } = useFunctionalState(form, requiredRules, requiredRules)

const state = computed(() => {
  return {
    src: getFunctionalState(v$.value.src.$dirty, v$.value.src.$error, false),
  }
})

function fieldHasError(field: string) {
  return hasError(state, field)
}

function resetForm(close: () => void) {
  form.src = initialState.src
  form.title = initialState.title
  form.alt = initialState.alt
  reset()
  close()
};

function send(close: () => void) {
  validateRequiredRules().then((valid) => {
    if (valid) {
      emit('send', { ...form })
      resetForm(close)
    }
  })
};
</script>
