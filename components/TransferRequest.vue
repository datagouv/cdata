<template>
  <div>
    <BannerNotif
      type="warning"
      :icon="RiSendPlaneLine"
      class="mb-4"
      :badge="$t('Transfert en attente')"
      :user="transfer.user"
      :date="new Date(transfer.created)"
    >
      <template #title>
        {{ $t('a demandé un transfert') }}
      </template>
      <template #subtitle>
        <LinkToSubject
          :type="transfer.subject.class"
          :subject="transfer.subject"
        />
        &nbsp;
        <template v-if="transfer.recipient.class === 'Organization'">
          {{ $t('vers votre organization') }}
          <a
            :href="transfer.recipient.page"
            class="link"
          >{{ transfer.recipient.name }}</a>
        </template>
        <template v-if="transfer.recipient.class === 'User'">
          {{ $t('vers') }}
          <a
            :href="transfer.recipient.page"
            class="link"
          >{{ transfer.recipient.first_name }} {{ transfer.recipient.last_name }}</a>
        </template>
      </template>

      <template #body>
        {{ transfer.comment }}
      </template>

      <template #buttons>
        <BrandedButton
          v-if="showActions"
          color="primary"
          size="xs"
          :icon="RiCheckLine"
          :aria-controls="modalId"
          @click="isOpen = true"
        >
          {{ $t('Accepter') }}
        </BrandedButton>
        <BrandedButton
          v-if="showActions"
          color="danger"
          size="xs"
          :icon="RiCloseLine"
          :aria-controls="modalId"
          @click="isOpen = true"
        >
          {{ $t('Refuser') }}
        </BrandedButton>
      </template>
    </BannerNotif>
    <ModalClient
      :modal-id="modalId"
      :opened="isOpen"
      :title="$t('Transfert en attente')"
      size="lg"
      @close="isOpen = false"
    >
      <TransferRequest
        :transfer
        :show-actions="false"
      />

      <InputGroup
        v-model="comment"
        type="textarea"
        :label="$t('Commentaire')"
      />

      <template #footer>
        <div class="w-full flex justify-end space-x-4">
          <BrandedButton
            color="primary"
            size="xs"
            :icon="RiCheckLine"
            :aria-controls="modalId"
            @click="respond('accept')"
          >
            {{ $t('Accepter') }}
          </BrandedButton>
          <BrandedButton
            color="danger"
            size="xs"
            :icon="RiCloseLine"
            :aria-controls="modalId"
            @click="respond('refuse')"
          >
            {{ $t('Refuser') }}
          </BrandedButton>
        </div>
      </template>
    </ModalClient>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiCheckLine, RiCloseLine, RiSendPlaneLine } from '@remixicon/vue'
import ModalClient from './Modal/Modal.client.vue'
import type { TransferRequest } from '~/types/types'

const props = withDefaults(defineProps<{
  transfer: TransferRequest
  showActions?: boolean
}>(), {
  showActions: true,
})
const emit = defineEmits<{
  (e: 'done'): void
}>()

const { $api } = useNuxtApp()

const modalId = useId()
const isOpen = ref(false)
const loading = ref(false)
const comment = ref('')

const respond = async (response: 'accept' | 'refuse') => {
  loading.value = true
  try {
    await $api(`/api/1/transfer/${props.transfer.id}/`, {
      method: 'POST',
      body: JSON.stringify({
        comment: comment.value,
        response,
      }),
    })
    isOpen.value = false
    emit('done')
  }
  finally {
    loading.value = false
  }
}
</script>
