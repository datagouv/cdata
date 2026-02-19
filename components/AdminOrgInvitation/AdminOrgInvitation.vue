<template>
  <div class="relative bg-white shadow rounded-sm p-5 mt-3">
    <AdminBadge
      class="absolute top-0 left-2.5 -translate-y-1/2"
      size="sm"
      type="primary"
      :icon="RiUserAddLine"
    >
      {{ $t('Invitation') }}
    </AdminBadge>

    <div class="flex flex-wrap justify-between gap-5">
      <div class="space-y-1">
        <div class="flex flex-wrap items-start gap-2">
          <NuxtImg
            v-if="invitation.organization.logo"
            class="rounded-sm border border-gray-default size-10 object-contain bg-white"
            :src="invitation.organization.logo"
            loading="lazy"
            alt=""
          />
          <div
            v-else
            class="size-10 rounded-sm border border-gray-default bg-gray-lower flex items-center justify-center"
          >
            <RiBuilding2Line class="size-5 text-gray-medium" />
          </div>
          <div>
            <div class="flex flex-wrap items-baseline gap-1 text-gray-title text-sm/6">
              <div class="font-bold">
                {{ invitation.organization.name }}
              </div>
              <div>{{ t("vous invite à rejoindre l'organisation.") }}</div>
            </div>
            <div
              v-if="roleLabel"
              class="text-sm text-gray-medium"
            >
              {{ t('Rôle proposé :') }}
              <AdminBadge
                size="xs"
                :type="invitation.role === 'admin' ? 'primary' : invitation.role === 'partial_editor' ? 'default' : 'secondary'"
              >
                {{ roleLabel }}
              </AdminBadge>
            </div>
          </div>
        </div>
        <div
          v-if="invitation.comment"
          class="flex items-stretch gap-1"
        >
          <div class="w-10 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-default" />
          </div>
          <div class="text-xs/5 italic">
            « {{ invitation.comment }} »
          </div>
        </div>
        <div class="text-sm/6 text-gray-medium">
          {{ formatDate(new Date(invitation.created), { dateStyle: 'long', timeStyle: 'short' }) }}
        </div>
      </div>
      <div class="flex flex-col gap-2.5 items-end">
        <BrandedButton
          color="primary"
          size="xs"
          :icon="RiCheckLine"
          :loading="loading"
          @click="accept"
        >
          {{ $t('Accepter') }}
        </BrandedButton>
        <BrandedButton
          color="danger"
          size="xs"
          :loading="loading"
          @click="refuse"
        >
          {{ t("Refuser") }}
        </BrandedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, useFormatDate } from '@datagouv/components-next'
import { ref } from 'vue'
import { RiBuilding2Line, RiCheckLine, RiUserAddLine } from '@remixicon/vue'
import AdminBadge from '../AdminBadge/AdminBadge.vue'
import type { MemberRole, OrgInvitation } from '~/types/types'

const props = defineProps<{
  invitation: OrgInvitation
}>()
const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { formatDate } = useFormatDate()
const loading = ref(false)

const { data: roles } = await useAPI<Array<{ id: MemberRole, label: string }>>('/api/1/organizations/roles/', { lazy: true })

const roleLabel = computed(() => {
  if (!roles.value) return null
  const role = roles.value.find(r => r.id === props.invitation.role)
  return role?.label ?? props.invitation.role
})

const accept = async () => {
  try {
    loading.value = true
    await $api(`/api/1/me/org_invitations/${props.invitation.id}/accept/`, {
      method: 'POST',
    })
    emits('refresh')
  }
  finally {
    loading.value = false
  }
}

const refuse = async () => {
  try {
    loading.value = true
    await $api(`/api/1/me/org_invitations/${props.invitation.id}/refuse/`, {
      method: 'POST',
    })
    emits('refresh')
  }
  finally {
    loading.value = false
  }
}
</script>
