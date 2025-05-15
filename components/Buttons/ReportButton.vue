<template>
  <ModalWithButton
    v-if="object"
    :title="t('Signaler le contenu')"
    :icon="RiFlagLine"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :loading="isLoading"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ t("Signaler") }}
      </BrandedButton>
    </template>
    <template #default>
      <SimpleBanner
        class="mb-4"
        type="warning"
      >
        <RiErrorWarningLine class="mr-1" />
        {{ t("Please only report in case of serious concern.") }}
        <NuxtLinkLocale
          to="/pages/legal/cgu/"
        >
          {{ t("See our usage policy") }}
        </NuxtLinkLocale>
      </SimpleBanner>
      <LoadingBlock :status>
        <SelectGroup
          v-model="reason"
          :label="t('Report reason')"
          :required="true"
          :has-error="fieldHasError('reason')"
          :error-text="getErrorText('reason')"
          :options="data"
        />
      </LoadingBlock>
      <InputGroup
        v-model="message"
        type="textarea"
        :label="t('Message')"
        :required="true"
        :has-error="fieldHasError('message')"
        :error-text="getErrorText('message')"
        :placeholder="t(`Reason of your report.{newline}Don't include any personal data.`)"
      />
    </template>
    <template #footer="{ close }">
      <div
        class="flex-1 flex justify-end"
      >
        <BrandedButton
          color="primary"
          :loading="isLoading"
          @click="send(close)"
        >
          {{ $t('Send') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { SimpleBanner } from '@datagouv/components-next'
import type { Dataservice, Dataset, DatasetV2, Organization, Reuse } from '@datagouv/components-next'
import { RiFlagLine, RiErrorWarningLine } from '@remixicon/vue'

const props = defineProps<{
  type: 'organizations' | 'posts' | 'reuses' | 'dataservices'
  object: Organization | Dataservice | Dataset | DatasetV2 | Reuse
}>()

const { t } = useI18n()
const { start, finish, isLoading } = useLoadingIndicator()

const { $api } = useNuxtApp()

const { toast } = useToast()

const reason = ref('')
const message = ref('')

const { data, status } = await useAPI('api/1/reports/reasons/')

async function send(close: () => void) {
  try {
    start()
    await $api<Report>('/reports/', {
      method: 'POST',
      body: {
        subject: {
          id: props.object.id,
          class: props.type,
        },
        reason: reason.value,
        message: message.value,
      },
    })
    close()
  }
  catch (_e) {
    toast.error(t('An unexpected error occured while reporting this content.'))
  }
  finally {
    finish()
  }
}
</script>
