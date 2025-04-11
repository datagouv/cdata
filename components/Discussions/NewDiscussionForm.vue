<template>
  <form
    class="space-y-4"
    @submit.prevent="send"
  >
    <div class="flex justify-between items-center">
      <div class="font-bold uppercase text-sm/loose text-gray-title">
        {{ $t('New discussion') }}
      </div>
      <BrandedButton
        :icon="RiCloseLine"
        color="secondary-softer"
        size="xs"
        @click="$emit('close')"
      >
        {{ $t('Close') }}
      </BrandedButton>
    </div>
    <div class="flex flex-col w-full space-y-4">
      <RequiredExplanation />

      <ProducerSelect
        v-model="form.owned"
        :label="t('Choose the identity with which you want to publish this message')"
        :required="true"
        :error-text="getFirstError('owned')"
        :warning-text="getFirstWarning('owned')"
      />

      <InputGroup
        v-model="form.title"
        :label="$t('Title')"
        :required="true"
        :has-error="!!getFirstError('title')"
        :has-warning="!!getFirstWarning('title')"
        :error-text="getFirstError('title')"
      />

      <InputGroup
        v-model="form.comment"
        :label="$t('Your message')"
        :required="true"
        type="textarea"
        :has-error="!!getFirstError('comment')"
        :has-warning="!!getFirstWarning('comment')"
        :error-text="getFirstError('comment')"
        :placeholder="$t('Please remain courteous and constructive. Avoid sharing personal information.')"
      />
    </div>

    <div class="w-full flex justify-end">
      <BrandedButton
        type="submit"
        color="primary"
        size="xs"
        :loading
      >
        {{ t("Send") }}
      </BrandedButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { BrandedButton, type Owned } from '@datagouv/components-next'
import { RiCloseLine } from '@remixicon/vue'
import type { DiscussionSubject } from '~/types/discussions'

const props = defineProps<{
  subject: DiscussionSubject
}>()
const emit = defineEmits<{
  new: []
  close: []
}>()

const { t } = useI18n()
const { $api } = useNuxtApp()

const loading = ref(false)
const { form, getFirstError, getFirstWarning } = useForm({
  owned: null as Owned | null,
  title: '',
  comment: '',
})

const send = async () => {
  loading.value = true

  try {
    await $api(`/api/1/discussions/`, {
      method: 'POST',
      body: JSON.stringify({
        organization: form.value.owned?.organization,
        subject: props.subject,
        title: form.value.title,
        comment: form.value.comment,
      }),
    })
    emit('new')
  }
  finally {
    loading.value = false
  }
}
</script>
