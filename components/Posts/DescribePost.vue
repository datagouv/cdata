<template>
  <div class="fr-p-3w bg-white">
    <RequiredExplanation />
    <fieldset
      class="fr-fieldset min-width-0"
      aria-labelledby="description-legend"
    >
      <legend
        id="description-legend"
        class="fr-fieldset__legend"
      >
        <h2 class="text-sm font-bold uppercase mb-3">
          {{ $t("Description") }}
        </h2>
      </legend>
      <div class="fr-fieldset__element">
        <InputGroup
          v-model="form.name"
          :label="$t(`Titre de l'article`)"
          :required="true"
          :has-error="!!getFirstError('name')"
          :has-warning="!!getFirstWarning('name')"
          :error-text="getFirstError('name')"
          @blur="touch('name')"
        />
      </div>
      <div class="fr-fieldset__element">
        <InputGroup
          v-model="form.headline"
          :label="$t('Entête')"
          :has-error="!!getFirstError('headline')"
          :has-warning="!!getFirstWarning('headline')"
          :error-text="getFirstError('headline')"
          required
          @blur="touch('headline')"
        />
      </div>
      <div class="fr-fieldset__element">
        <RadioButtons
          v-model="form.body_type"
          :label="t('Type de contenu')"
          class="!mb-0"
          :options="[
            { value: 'html', label: t('HTML') },
            { value: 'markdown', label: t('Markdown') },
          ]"
        />
      </div>
      <div class="fr-fieldset__element">
        <TagsSelect
          v-model="form.tags"
          :error-text="getFirstError('tags')"
          :warning-text="getFirstWarning('tags')"
        />
      </div>
      <div class="fr-fieldset__element">
        <UploadGroup
          :label="$t('Couverture')"
          type="drop"
          accept="jpg,jpeg,png"
          :multiple="true"
          :hint-text="$t('Taille max : 4 Mo. Formats acceptés : JPG, JPEG, PNG')"
          show-label
          required
          :has-error="!!getFirstError('image')"
          :error-text="getFirstError('image')"
          :warning-text="getFirstWarning('image')"
          @change="setFiles"
        />
        <div
          v-if="imagePreview"
          class="text-align-center"
        >
          <NuxtImg
            :src="imagePreview"
            class="border mx-auto max-h-40 aspect-video"
            loading="lazy"
            alt=""
          />
        </div>
      </div>
    </fieldset>
    <div
      class="fr-grid-row"
      :class="{ 'fr-grid-row--right': type === 'update', 'justify-between': type === 'create' }"
    >
      <BrandedButton
        v-if="type === 'create'"
        color="secondary"
        @click="$emit('previous')"
      >
        {{ $t('Précédent') }}
      </BrandedButton>
      <BrandedButton
        color="primary"
        @click="submit"
      >
        {{ submitLabel }}
      </BrandedButton>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import type { PostForm } from '~/types/posts'

const props = defineProps<{
  submitLabel: string
  post: PostForm
  type: 'create' | 'update'
}>()
const emit = defineEmits<{
  previous: []
  submit: [PostForm]
}>()

const { t } = await useTranslation()

const { form, touch, getFirstError, getFirstWarning, validate } = useForm(props.post, {
  name: [required()],
  headline: [required()],
  image: [required()],
}, {
})

const imagePreview = computed(() => {
  if (!form.value.image) return null
  if (typeof form.value.image === 'string') return form.value.image
  return URL.createObjectURL(form.value.image)
})

async function submit() {
  if (await validate()) {
    emit('submit', form.value)
  }
};
const setFiles = (files: Array<File>) => {
  form.value.image = files[0]
}
</script>
