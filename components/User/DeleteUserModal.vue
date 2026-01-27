<template>
  <ModalWithButton
    v-model="isOpen"
    :title="$t('Êtes-vous sûrs de vouloir supprimer ce compte utilisateur ?')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="danger"
        size="xs"
        :icon="RiDeleteBin6Line"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Supprimer') }}
      </BrandedButton>
    </template>
    <template #default>
      <template v-if="!deleted">
        <p class="fr-text--bold">
          {{ $t("Cette action est irréversible.") }}
        </p>
        <p>{{ $t("Tous les contenus publiés en votre nom resteront en ligne, aux mêmes URL, mais sous forme anonyme, c'est-à-dire sans être rattachés à un producteur de données.") }}</p>
        <p>{{ $t("Si vous souhaitez aussi supprimer les contenus publiées que vous avez publiés, commencez par supprimer les contenus avant de supprimer votre compte.") }}</p>

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
            {{ $t("Vous pouvez maintenant envoyer un mail personnalisé à l'utilisateur.") }}
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
    <template #footer>
      <div class="w-full flex justify-end space-x-4">
        <template v-if="!deleted">
          <div v-if="isAdmin && user.id !== me.id">
            <BrandedButton
              color="warning"
              :disabled="loading || (!!showMailOptions && !mailOption)"
              @click="() => deleteUser({ spam: true })"
            >
              {{ $t("Supprimer comme spam (pas d'envoi de mail et suppression des discussions)") }}
            </BrandedButton>
          </div>
          <div>
            <BrandedButton
              color="danger"
              :disabled="loading || (!!showMailOptions && !mailOption)"
              @click="() => deleteUser({ spam: false })"
            >
              <span v-if="user.id === me.id">
                {{ $t("Supprimer votre compte") }}
              </span>
              <span v-else>
                {{ $t("Supprimer ce compte") }}
              </span>
            </BrandedButton>
          </div>
        </template>
        <BrandedButton
          v-else
          @click="handleClose"
        >
          {{ $t('Fermer') }}
        </BrandedButton>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiCheckLine, RiDeleteBin6Line } from '@remixicon/vue'
import { BrandedButton, type User, toast } from '@datagouv/components-next'
import { isMeAdmin, useLogout } from '~/utils/auth'
import { useDeleteMailto } from '~/composables/useDeleteMailto'
import RadioButtons from '~/components/RadioButtons.vue'
import type { MailOption } from '~/types/delete'

const props = defineProps<{
  user: User & { email?: string }
}>()

const me = useMe()
const { $api } = useNuxtApp()
const { t } = useTranslation()
const { generateMailtoLink, mailOptions } = useDeleteMailto()

const isAdmin = isMeAdmin()
const isOpen = ref(false)
const loading = ref(false)
const deleted = ref(false)
const mailOption = ref<MailOption | null>(null)

const showMailOptions = computed(() => {
  return isAdmin && props.user.id !== me.value.id && props.user.email
})

const mailtoLink = computed(() => {
  if (!props.user.email) return ''
  return generateMailtoLink([props.user.email], 'user', props.user.first_name + ' ' + props.user.last_name)
})

const logout = useLogout()

watch(isOpen, (newVal) => {
  if (!newVal) {
    deleted.value = false
    mailOption.value = null
  }
})

async function deleteUser({ spam = false }) {
  loading.value = true
  try {
    let deleteUserUrl = props.user.id === me.value.id ? '/api/1/me/' : `/api/1/users/${props.user.id}/`

    const params = new URLSearchParams()
    if (props.user.id !== me.value.id && spam) {
      params.set('no_mail', 'true')
      params.set('delete_comments', 'true')
    }
    if (isAdmin && mailOption.value === 'auto' && !spam) {
      params.set('send_legal_notice', 'true')
    }

    if (params.toString()) {
      deleteUserUrl += '?' + params.toString()
    }

    await $api(deleteUserUrl, {
      method: 'DELETE',
    })

    if (props.user.id === me.value.id) {
      toast.success(t('Votre compte a bien été supprimé. Vous êtes maintenant déconnecté.'))
      await logout()
    }
    else if (isAdmin && mailOption.value === 'custom' && props.user.email) {
      deleted.value = true
    }
    else {
      toast.success(t('Utilisateur supprimé !'))
      await navigateTo(`/admin/site/users`, { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}

async function handleClose() {
  isOpen.value = false
  toast.success(t('Utilisateur supprimé !'))
  await navigateTo(`/admin/site/users`, { replace: true })
}
</script>
