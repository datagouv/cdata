<template>
  <ModalWithButton
    :title="reported ? $t(`Merci d'avoir signalé ce contenu`) : $t('Signaler ce contenu')"
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
        {{ $t('Signalement') }}
      </BrandedButton>
    </template>

    <TranslationT
      v-if="reported"
      keypath="L’équipe de {site} examinera le contenu pour déterminer si celui-ci enfreint {terms}. Merci pour votre aide."
      tag="p"
    >
      <template #site>
        {{ config.public.title }}
      </template>
      <template #terms>
        <CdataLink
          to="/pages/legal/cgu/"
        >
          {{ $t("nos modalités d'utilisation") }}
        </CdataLink>
      </template>
    </TranslationT>
    <div v-else>
      <SimpleBanner
        type="warning"
        class="mb-5"
      >
        {{ $t("Merci de ne signaler qu’en cas d’inquiétude sérieuse.") }}
        <CdataLink
          to="/pages/legal/cgu/"
        >
          {{ $t("Voir nos modalités d'utilisation.") }}
        </CdataLink>
      </SimpleBanner>

      <SelectGroup
        v-model="form.reason"
        :label="$t('Raison du signalement')"
        :required="true"
        :has-error="!!getFirstError('reason')"
        :has-warning="!!getFirstWarning('reason')"
        :error-text="getFirstError('reason')"
        :options="reasons"
      />

      <InputGroup
        v-model="form.message"
        type="textarea"
        :label="$t('Votre message')"
        :placeholder="$t('Évitez de partager des informations personnelles.')"
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
          {{ $t('Fermer') }}
        </BrandedButton>
        <BrandedButton
          v-if="! reported"
          color="secondary"
          :loading
          @click="close"
        >
          {{ $t('Annuler') }}
        </BrandedButton>
        <BrandedButton
          v-if="! reported"
          color="primary"
          :loading
          :icon="RiFlagLine"
          @click="send"
        >
          {{ $t('Signalement') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiFlagLine } from '@remixicon/vue'
import { BrandedButton, SimpleBanner, TranslationT } from '@datagouv/components-next'
import type { ReportReason, ReportSubject } from '@datagouv/components-next'
import SelectGroup from '../Form/SelectGroup/SelectGroup.vue'
import CdataLink from '../CdataLink.vue'

const props = defineProps<{
  subject: ReportSubject
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

const reasons = ref([] as Array<ReportReason>)
onMounted(async () => {
  reasons.value = await $api<Array<ReportReason>>('/api/1/reports/reasons/')
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
