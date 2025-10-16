<template>
  <form
    class="p-6 bg-white"
    @submit.prevent="save"
  >
    <InputGroup
      v-model="form.name"
      :label="$t('Nom')"
      :required="true"
      :spellcheck="false"
    />
    <InputGroup
      v-model="form.description"
      :label="$t('Description')"
      type="markdown"
    />

    <TagsSelect
      v-model="form.tags"
      :error-text="getFirstError('tags')"
      :warning-text="getFirstWarning('tags')"
    />

    <div class="flex justify-end">
      <BrandedButton type="submit">
        {{ $t('Sauvegarder') }}
      </BrandedButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { TopicV2 } from '@datagouv/components-next'
import { BrandedButton } from '@datagouv/components-next'

const props = defineProps<{
  topic: TopicV2
}>()
const emit = defineEmits<{
  refresh: []
}>()

const { form, validate, getFirstError, getFirstWarning } = useForm({
  name: props.topic.name,
  description: props.topic.description,
  tags: props.topic.tags.map(text => ({ text })),
}, {
  name: [required()],
}, {})

const { $api } = useNuxtApp()
const { toast } = useToast()
const { t } = useTranslation()

const save = async () => {
  if (await validate()) {
    await $api(`/api/2/topics/${props.topic.id}/`, {
      method: 'PUT',
      body: {
        name: form.value.name,
        description: form.value.description,
        tags: form.value.tags.map(({ text }) => text),
      },
    })

    emit('refresh')
    toast.success(t('Sauvegardé.'))
  }
}
</script>
