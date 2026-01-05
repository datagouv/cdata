<template>
  <ModalWithButton
    v-model="isOpen"
    :title="t('Êtes-vous sûr de vouloir supprimer cette discussion ?')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiDeleteBin6Line"
        icon-only
        :title="$t('Supprimer')"
        v-bind="attrs"
        :loading
        v-on="listeners"
      />
    </template>

    <template #default>
      <template v-if="!deleted">
        <ThreadHeader
          :subject
          :thread
        />
        <ReadMore
          class="prose whitespace-pre-line max-w-none text-sm"
        >
          {{ thread.discussion[0].content }}
        </ReadMore>
        <div class="mt-4 font-bold">
          {{ $t('Cette action est irréversible. Tous les commentaires de cette discussion seront aussi supprimés.') }}
        </div>

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

      <template v-else>
        <div class="flex flex-col items-center gap-4 py-6">
          <div class="flex items-center gap-2 text-success-dark">
            <RiCheckLine class="size-6" />
            <span class="font-bold">{{ $t('Suppression effectuée') }}</span>
          </div>
          <p class="text-center text-mention-grey">
            {{ $t("Vous pouvez maintenant envoyer un mail personnalisé à l'auteur.") }}
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
    </template>

    <template #footer="{ close }">
      <div class="w-full flex justify-end space-x-4">
        <template v-if="!deleted">
          <BrandedButton
            color="secondary"
            size="xs"
            :loading
            @click="close"
          >
            {{ t("Annuler") }}
          </BrandedButton>
          <BrandedButton
            color="danger"
            size="xs"
            :loading
            :disabled="!!showMailOptions && !mailOption"
            @click="() => deleteThread(close)"
          >
            {{ t("Supprimer la discussion et les commentaires") }}
          </BrandedButton>
        </template>
        <BrandedButton
          v-else
          @click="handleClose(close)"
        >
          {{ $t('Fermer') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiCheckLine, RiDeleteBin6Line } from '@remixicon/vue'
import { BrandedButton, ReadMore } from '@datagouv/components-next'
import ThreadHeader from './ThreadHeader.vue'
import RadioButtons from '~/components/RadioButtons.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'
import { isMeAdmin } from '~/utils/auth'
import { useDeleteMailto } from '~/composables/useDeleteMailto'

type MailOption = 'auto' | 'custom'

const props = defineProps<{
  subject: DiscussionSubjectTypes
  thread: Thread
}>()
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

const authorEmail = computed(() => {
  const firstComment = props.thread.discussion[0]
  const user = firstComment?.posted_by
  return user && 'email' in user ? (user as { email?: string }).email : null
})

const showMailOptions = computed(() => {
  return isMeAdmin() && authorEmail.value
})

const mailOptions = computed(() => [
  { value: 'auto' as MailOption, label: t('Envoyer un mail automatique (voies de recours)') },
  { value: 'custom' as MailOption, label: t('Envoyer un mail personnalisé') },
])

const mailtoLink = computed(() => {
  if (!authorEmail.value) return ''
  return generateMailtoLink([authorEmail.value], 'discussion', props.thread.title)
})

watch(isOpen, (newVal) => {
  if (!newVal) {
    deleted.value = false
    mailOption.value = null
  }
})

const deleteThread = async (close: () => void) => {
  loading.value = true

  try {
    let url = `/api/1/discussions/${props.thread.id}/`
    if (isMeAdmin() && mailOption.value === 'auto') {
      url += '?send_legal_notice=true'
    }

    await $api(url, { method: 'DELETE' })

    if (isMeAdmin() && mailOption.value === 'custom' && authorEmail.value) {
      deleted.value = true
    }
    else {
      close()
    }
    emit('deleted')
  }
  finally {
    loading.value = false
  }
}

function handleClose(close: () => void) {
  close()
}
</script>
