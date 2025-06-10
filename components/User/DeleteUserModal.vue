<template>
  <ModalWithButton
    :title="$t('Are you sure you want to delete this user ?')"
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
        {{ $t('Delete') }}
      </BrandedButton>
    </template>
    <template #default>
      <p class="fr-text--bold">
        {{ $t("This action can't be reverse.") }}
      </p>
      <p>{{ $t("All content published with this organization will stay online, with the same URL but in an anonymous form, i.e. without being linked to a data producer.") }}</p>
      <p>{{ $t("If you want to delete your published content too, start by deleting the contents before deleting your account.") }}</p>
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
            {{ $t("Delete as spam (no email sent and discussions deletion)") }}
          </BrandedButton>
        </div>
        <div>
          <BrandedButton
            color="danger"
            :disabled="loading"
            @click="() => deleteUser({ spam: false })"
          >
            <span v-if="user.id === me.id">
              {{ $t("Delete your account") }}
            </span>
            <span v-else>
              {{ $t("Delete this account") }}
            </span>
          </BrandedButton>
        </div>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { RiDeleteBin6Line } from '@remixicon/vue'
import { BrandedButton, type User } from '@datagouv/components-next'

const props = defineProps<{
  user: User
}>()

const localePath = useLocalePath()
const me = useMe()
const { $api } = useNuxtApp()
const config = useRuntimeConfig()
const { toast } = useToast()
const { t } = useI18n()

const loading = ref(false)

async function deleteUser({ spam = false }) {
  loading.value = true
  try {
    let deleteUserUrl = props.user.id === me.value.id ? '/api/1/me/' : `/api/1/users/${props.user.id}`
    if (props.user.id !== me.value.id && spam) {
      deleteUserUrl += '?no_mail=true&delete_comments=true'
    }
    await $api(deleteUserUrl, {
      method: 'DELETE',
    })
    if (props.user.id === me.value.id) {
      navigateTo(`${config.public.apiBase}/en/logout`, { external: true })
    }
    else {
      toast.success(t('User deleted!'))
      await navigateTo(localePath(`/admin/site/users`), { replace: true })
    }
  }
  finally {
    loading.value = false
  }
}
</script>
