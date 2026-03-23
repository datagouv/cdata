<template>
  <ModalWithButton
    v-model="isOpen"
    :title
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <slot
        name="button"
        :attrs="attrs"
        :listeners="listeners"
      />
    </template>

    <template v-if="!deleted">
      <slot />

      <div
        v-if="showMailOptions"
        class="mt-6 pt-4 border-t border-default-grey"
      >
        <RadioButtons
          v-model="mailOption"
          :label="$t('Notification par email')"
          :options="mailOptions"
        />
      </div>
    </template>

    <template v-else-if="mailOption === 'custom'">
      <div class="flex flex-col items-center gap-4 py-6">
        <div class="flex items-center gap-2 text-success-dark">
          <RiCheckLine class="size-6" />
          <span class="font-bold">{{ $t('Suppression effectuée') }}</span>
        </div>
        <p class="text-center text-mention-grey">
          {{ $t("Vous pouvez maintenant envoyer un mail personnalisé au propriétaire.") }}
        </p>
        <a
          :href="mailtoLink"
          class="fr-btn fr-btn--secondary"
          target="_blank"
        >
          {{ $t('Envoyer le mail personnalisé') }}
        </a>
      </div>
    </template>

    <template #footer="{ close: closeModal }">
      <div class="w-full flex justify-end gap-4">
        <BrandedButton
          v-if="!deleted"
          color="secondary"
          :disabled="loading"
          @click="closeModal"
        >
          {{ $t('Annuler') }}
        </BrandedButton>
        <BrandedButton
          v-if="!deleted"
          color="danger"
          :loading
          :disabled="showMailOptions && !mailOption"
          @click="() => handleDelete(closeModal)"
        >
          {{ deleteButtonLabel }}
        </BrandedButton>
        <BrandedButton
          v-else
          @click="handleClose(closeModal)"
        >
          {{ $t('Fermer') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiCheckLine } from '@remixicon/vue'
import { isMeAdmin } from '~/utils/auth'
import { useDeleteMailto } from '~/composables/useDeleteMailto'
import { getOwnerEmails } from '~/utils/owner'
import RadioButtons from '~/components/RadioButtons.vue'
import type { ObjectType, MailOption, DeletableObject } from '~/types/delete'

const props = defineProps<{
  title: string
  deleteUrl: string
  deleteButtonLabel?: string
  deletableObject: DeletableObject
  objectType: ObjectType
  objectTitle?: string
}>()

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { generateMailtoLink, mailOptions } = useDeleteMailto()

const isAdmin = isMeAdmin()
const isOpen = ref(false)
const loading = ref(false)
const deleted = ref(false)
const mailOption = ref<MailOption | null>(null)
const recipientEmails = ref<string[]>([])

const showMailOptions = computed(() => isAdmin && recipientEmails.value.length > 0)

const mailtoLink = computed(() => {
  return generateMailtoLink(recipientEmails.value, props.objectType, props.objectTitle)
})

const deleteButtonLabel = computed(() => props.deleteButtonLabel || t('Supprimer'))

watch(isOpen, async (newVal) => {
  if (newVal && isAdmin) {
    recipientEmails.value = await getOwnerEmails($api, props.deletableObject)
  }
  if (!newVal) {
    deleted.value = false
    mailOption.value = null
    recipientEmails.value = []
  }
})

async function handleDelete(closeModal: () => void) {
  loading.value = true
  try {
    let url = props.deleteUrl
    if (showMailOptions.value && mailOption.value === 'auto') {
      url += url.includes('?') ? '&send_legal_notice=true' : '?send_legal_notice=true'
    }

    await $api(url, { method: 'DELETE' })

    if (showMailOptions.value && mailOption.value === 'custom') {
      deleted.value = true
    }
    else {
      closeModal()
      emit('deleted')
    }
  }
  finally {
    loading.value = false
  }
}

function handleClose(closeModal: () => void) {
  closeModal()
  emit('deleted')
}
</script>
