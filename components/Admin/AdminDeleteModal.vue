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
        v-if="isMeAdmin()"
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
          :disabled="isMeAdmin() && !mailOption"
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
import RadioButtons from '~/components/RadioButtons.vue'

type MailOption = 'auto' | 'custom'
type ObjectType = 'dataset' | 'reuse' | 'dataservice' | 'organization' | 'user' | 'discussion' | 'comment'

const props = withDefaults(defineProps<{
  title: string
  deleteUrl: string
  deleteButtonLabel?: string
  recipientEmail?: string | null
  objectType: ObjectType
  objectTitle?: string
}>(), {
  recipientEmail: null,
})

const emit = defineEmits<{
  deleted: []
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { generateMailtoLink } = useDeleteMailto()

const isOpen = ref(false)
const loading = ref(false)
const deleted = ref(false)
const mailOption = ref<MailOption | null>(null)

const mailOptions = computed(() => [
  { value: 'auto' as const, label: t('Envoyer un mail automatique (voies de recours)') },
  { value: 'custom' as const, label: t('Envoyer un mail personnalisé') },
])

const mailtoLink = computed(() => {
  return generateMailtoLink(props.recipientEmail || '', props.objectType, props.objectTitle)
})

const deleteButtonLabel = computed(() => props.deleteButtonLabel || t('Supprimer'))

watch(isOpen, (newVal) => {
  if (!newVal) {
    deleted.value = false
    mailOption.value = null
  }
})

async function handleDelete(closeModal: () => void) {
  loading.value = true
  try {
    let url = props.deleteUrl
    if (isMeAdmin() && mailOption.value === 'auto') {
      url += url.includes('?') ? '&send_legal_notice=true' : '?send_legal_notice=true'
    }

    await $api(url, { method: 'DELETE' })

    if (isMeAdmin() && mailOption.value === 'custom') {
      deleted.value = true
    }
    else {
      closeModal()
    }

    emit('deleted')
  }
  finally {
    loading.value = false
  }
}

function handleClose(closeModal: () => void) {
  closeModal()
}
</script>
