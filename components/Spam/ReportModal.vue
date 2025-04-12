<template>
  <ModalWithButton
    :title="reported ? $t('Thanks for having reported this content') : $t('Report this content')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiFlagLine"
        icon-only
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Report') }}
      </BrandedButton>
    </template>

    <i18n-t
      v-if="reported"
      keypath="The {site} team will review the content to determine if it violates {terms}. Thank you for your help."
      tag="p"
    >
      <template #site>
        {{ config.public.title }}
      </template>
      <template #terms>
        <NuxtLinkLocale
          to="/pages/legal/cgu/"
          external
        >
          {{ $t("our terms of use") }}
        </NuxtLinkLocale>
      </template>
    </i18n-t>
    <div v-else>
      <SimpleBanner
        type="warning"
        class="mb-5"
      >
        {{ $t("Merci de ne signaler qu’en cas d’inquiétude sérieuse.") }}
        <NuxtLinkLocale
          to="/pages/legal/cgu/"
          external
        >
          {{ $t("See our terms of use.") }}
        </NuxtLinkLocale>
      </SimpleBanner>

      <SelectGroup
        v-model="form.reason"
        :label="$t('Report reason')"
        :required="true"
        :has-error="!!getFirstError('reason')"
        :has-warning="!!getFirstWarning('reason')"
        :error-text="getFirstError('reason')"
        :options="reasons"
      />

      <InputGroup
        v-model="form.message"
        type="textarea"
        :label="$t('Your message')"
        :placeholder="$t('Avoid sharing personal information.')"
        :has-error="!!getFirstError('message')"
        :has-warning="!!getFirstWarning('message')"
        :error-text="getFirstError('message')"
      />
    </div>

    <template #footer="{ close }">
      <div
        class="flex-1 flex justify-end space-x-4"
      >
        <BrandedButton
          v-if="reported"
          color="primary"
          @click="close"
        >
          {{ $t('Close') }}
        </BrandedButton>
        <BrandedButton
          v-if="! reported"
          color="secondary"
          :loading
          @click="close"
        >
          {{ $t('Cancel') }}
        </BrandedButton>
        <BrandedButton
          v-if="! reported"
          color="primary"
          :loading
          :icon="RiFlagLine"
          @click="send"
        >
          {{ $t('Report') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiFlagLine } from '@remixicon/vue'
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import SelectGroup from '../Form/SelectGroup/SelectGroup.vue'

const props = defineProps<{
  subject: { id: string, class: string }
}>()
const emit = defineEmits<{
  (e: 'reported'): void
}>()

const config = useRuntimeConfig()
const { $api } = useNuxtApp()
const loading = ref(false)
const reported = ref(false)

const { form, getFirstError, getFirstWarning } = useForm({
  reason: null,
  message: '',
}, {
  reason: [required()],
  message: [required()],
})

const reasons = ref([] as Array<{ label: string, value: string }>)
onMounted(async () => {
  reasons.value = await $api<Array<{ label: string, value: string }>>('/api/1/reports/reasons/')
})

const send = async () => {
  try {
    loading.value = true

    await $api('/api/1/reports/', {
      method: 'POST',
      body: {
        subject: props.subject,
        reason: form.value.reason,
        message: form.value.message,
      },
    })
    emit('reported')
    reported.value = true
  }
  finally {
    loading.value = false
  }
}
</script>
