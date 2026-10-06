<template>
  <ModalWithButton
    :title="reported ? $t(`Merci d'avoir signalé ce contenu`) : $t('Signaler ce contenu')"
    size="lg"
    form
    @submit.prevent="send"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiFlagLine"
        :title="$t('Signalement')"
        icon-only
        v-bind="attrs"
        v-on="listeners"
      />
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
        v-model="reason"
        :label="$t('Raison du signalement')"
        required
        :options="reasons"
      />

      <InputGroup
        v-model="message"
        type="textarea"
        :label="$t('Votre message')"
        :placeholder="$t('Évitez de partager des informations personnelles.')"
        required
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
          type="submit"
          color="primary"
          :loading
          :icon="RiFlagLine"
        >
          {{ $t('Signalement') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiFlagLine } from '@remixicon/vue'
import { BrandedButton, SelectGroup, SimpleBanner, toast, TranslationT } from '@datagouv/components-next'
import type { ReportReason, ReportSubject } from '@datagouv/components-next'
import CdataLink from '../CdataLink.vue'

const props = defineProps<{
  subject: ReportSubject
}>()
const emit = defineEmits<{
  (e: 'reported'): void
}>()

const config = useRuntimeConfig()
const { t } = useTranslation()
const { $api } = useNuxtApp()
const loading = ref(false)
const reported = ref(false)

const reason = ref<ReportReason['value'] | null>(null)
const message = ref('')

const reasons = ref([] as Array<ReportReason>)
onMounted(async () => {
  const allReasons = await $api<Array<ReportReason>>('/api/1/reports/reasons/')
  // `auto_spam` is set by the spam detection, users must not pick it
  reasons.value = allReasons.filter(reason => reason.value !== 'auto_spam')
})

const send = async () => {
  try {
    loading.value = true

    await $api('/api/1/reports/', {
      method: 'POST',
      body: {
        subject: props.subject,
        reason: reason.value,
        message: message.value,
      },
    })
    emit('reported')
    reported.value = true
  }
  catch {
    toast.error(t('Impossible d\'envoyer le signalement.'))
  }
  finally {
    loading.value = false
  }
}
</script>
