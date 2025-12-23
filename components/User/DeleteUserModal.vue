<template>
  <ModalWithButton
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
      <p class="fr-text--bold">
        {{ $t("Cette action est irréversible.") }}
      </p>
      <p>{{ $t("Tous les contenus publiés en votre nom resteront en ligne, aux mêmes URL, mais sous forme anonyme, c’est-à-dire sans être rattachés à un producteur de données.") }}</p>
      <p>{{ $t("Si vous souhaitez aussi supprimer les contenus publiées que vous avez publiés, commencez par supprimer les contenus avant de supprimer votre compte.") }}</p>
    </template>
    <template #footer>
      <div class="w-full flex justify-end space-x-4">
        <div
          v-if="isMeAdmin()"
        >
          <BrandedButton
            color="warning"
            :disabled="loading"
            @click="() => deleteUser({ spam: true })"
          >
            {{ $t("Supprimer comme spam (pas d'envoi de mail et suppression des discussions)") }}
          </BrandedButton>
        </div>
        <div>
          <BrandedButton
            color="danger"
            :disabled="loading"
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
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiDeleteBin6Line } from '@remixicon/vue'
import { BrandedButton, type User, toast } from '@datagouv/components-next'
import { useLogout } from '~/utils/auth'

const props = defineProps<{
  user: User
}>()

const me = useMe()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()
const { t } = useTranslation()

const loading = ref(false)

const logout = useLogout()

async function deleteUser({ spam = false }) {
  loading.value = true
  try {
    let deleteUserUrl = props.user.id === me.value.id ? '/api/1/me/' : `/api/1/users/${props.user.id}/`
    if (props.user.id !== me.value.id && spam) {
      deleteUserUrl += '?no_mail=true&delete_comments=true'
    }
    await $api(deleteUserUrl, {
      method: 'DELETE',
    })
    if (props.user.id === me.value.id) {
      toast.success(t('Votre compte a bien été supprimé. Vous êtes maintenant déconnecté.'))
      if (config.public.enableCdataSecurityViews) {
        await logout()
      }
      else {
        await navigateTo(`${config.public.apiBase}/logout`, { external: true })
      }
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
</script>
