<template>
  <div class="fr-p-3w bg-white">
    <InputGroup
      v-model="form.content"
      type="markdown"
      :min-heading="2"
      :label="$t('Contenu')"
      :required="true"
      :has-error="!!getFirstError('content')"
      :has-warning="!!getFirstWarning('content')"
      :error-text="getFirstError('content')"
      @blur="touch('content')"
    />
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
  submit: [{ content: string }]
}>()

const { form, touch, getFirstError, getFirstWarning, validate } = useForm({
  content: props.post.content,
}, {
  content: [required()],
}, {
})

async function submit() {
  if (await validate()) {
    emit('submit', form.value)
  }
};
</script>
