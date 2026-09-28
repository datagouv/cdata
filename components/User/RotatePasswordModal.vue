<template>
  <ModalWithButton
    :title="$t('Forcer la rotation du mot de passe ?')"
    size="lg"
    @close="errorMessage = null"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="warning"
        size="xs"
        :icon="RiLockUnlockLine"
        :disabled="loading"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Forcer la rotation') }}
      </BrandedButton>
    </template>

    <template #default>
      <p>
        {{ $t("L'utilisateur sera déconnecté de toutes ses sessions actives et devra définir un nouveau mot de passe à sa prochaine connexion.") }}
      </p>
      <p>
        {{ $t("Cette action est utile si vous suspectez que le mot de passe a été compromis.") }}
      </p>
      <SimpleBanner
        v-if="errorMessage"
        type="danger"
        class="mt-4"
      >
        {{ errorMessage }}
      </SimpleBanner>
    </template>

    <template #footer="{ close: _close }">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="_close"
          >
            {{ $t('Annuler') }}
          </BrandedButton>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            color="warning"
            :loading="loading"
            @click="() => rotatePassword(_close)"
          >
            {{ $t('Forcer la rotation') }}
          </BrandedButton>
        </div>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner, toast, type User } from '@datagouv/components-next'
import { RiLockUnlockLine } from '@remixicon/vue'

const props = defineProps<{
  user: User
}>()

const emits = defineEmits<{
  rotated: []
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()

const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function rotatePassword(close: () => void) {
  loading.value = true
  errorMessage.value = null
  try {
    await $api(`/api/1/users/${props.user.id}/rotate_password/`, {
      method: 'POST',
    })
    toast.success(t('Rotation du mot de passe demandée.'))
    emits('rotated')
    close()
  }
  catch {
    errorMessage.value = t('La rotation du mot de passe n\'a pas pu être demandée.')
  }
  finally {
    loading.value = false
  }
}
</script>
