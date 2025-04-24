<template>
  <form
    class="space-y-4"
    @submit.prevent="send(false)"
  >
    <div class="flex justify-between items-center">
      <div class="font-bold uppercase text-sm/loose text-gray-title">
        {{ $t('Respond') }}
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
      <ProducerSelect
        v-model="form.owned"
        :label="t('Choose the identity with which you want to publish this message')"
        :error-text="getFirstError('owned')"
        :warning-text="getFirstWarning('owned')"
      />

      <InputGroup
        v-model="form.comment"
        :label="$t('Your message')"
        type="textarea"
        :has-error="!!getFirstError('comment')"
        :has-warning="!!getFirstWarning('comment')"
        :error-text="getFirstError('comment')"
        :placeholder="$t('Please remain courteous and constructive. Avoid sharing personal information.')"
      />
    </div>

    <div class="space-x-4 w-full flex justify-end">
      <BrandedButton
        v-if="thread.permissions.close"
        color="warning"
        :loading
        :icon="RiChatDeleteLine"
        size="xs"
        @click="send(true)"
      >
        {{ $t('Respond & Close') }}
      </BrandedButton>
      <BrandedButton
        type="submit"
        color="primary"
        size="xs"
        :loading
      >
        {{ t("Respond") }}
      </BrandedButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { BrandedButton, type Owned } from '@datagouv/components-next'
import { RiChatDeleteLine, RiCloseLine } from '@remixicon/vue'
import type { Thread } from '~/types/discussions'

const props = defineProps<{
  thread: Thread
}>()
const emit = defineEmits<{
  responded: []
  close: []
}>()

const { t } = useI18n()
const { $api } = useNuxtApp()

const loading = ref(false)
const { form, getFirstError, getFirstWarning } = useForm({
  owned: null as Owned | null,
  comment: '',
})

const send = async (close: boolean) => {
  loading.value = true

  try {
    await $api(`/api/1/discussions/${props.thread.id}`, {
      method: 'POST',
      body: {
        organization: form.value.owned?.organization,
        comment: form.value.comment,
        close,
      },
    })
    emit('responded')
    form.value.comment = ''
  }
  finally {
    loading.value = false
  }
}
</script>
