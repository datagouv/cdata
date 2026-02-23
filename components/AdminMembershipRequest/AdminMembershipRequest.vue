<template>
  <!-- Sent invitation (by the organization) -->
  <div
    v-if="request.kind === 'invitation'"
    class="relative bg-white shadow rounded-sm p-5 mt-3"
  >
    <AdminBadge
      class="absolute top-0 left-2.5 -translate-y-1/2"
      size="sm"
      type="secondary"
      :icon="RiMailSendLine"
    >
      {{ $t('Invitation envoyée') }}
    </AdminBadge>

    <div class="flex flex-wrap justify-between gap-5">
      <div class="space-y-1">
        <div class="flex flex-wrap items-start gap-2">
          <Avatar
            v-if="request.user"
            :user="request.user"
            rounded
            :size="24"
          />
          <div
            v-else
            class="size-6 rounded-full border border-gray-default bg-gray-lower flex items-center justify-center"
          >
            <RiMailLine class="size-3 text-gray-medium" />
          </div>
          <div>
            <div class="flex flex-wrap items-baseline gap-1 text-gray-title text-sm/6">
              <template v-if="request.user">
                <div class="font-bold">
                  {{ request.user.first_name }} {{ request.user.last_name }}
                </div>
                <code
                  v-if="request.user.email"
                  class="text-gray-medium bg-gray-lower px-1 text-sm rounded-sm break-all"
                >{{ request.user.email }}</code>
              </template>
              <code
                v-else-if="request.email"
                class="text-gray-medium bg-gray-lower px-1 text-sm rounded-sm break-all"
              >{{ request.email }}</code>
              <div>{{ t("a été invité(e) à rejoindre l'organisation.") }}</div>
            </div>
            <div
              v-if="roleLabel"
              class="text-sm text-gray-medium"
            >
              {{ t('Rôle proposé :') }}
              <AdminBadge
                size="xs"
                :type="request.role === 'admin' ? 'primary' : request.role === 'partial_editor' ? 'default' : 'secondary'"
              >
                {{ roleLabel }}
              </AdminBadge>
            </div>
          </div>
        </div>
        <div
          v-if="request.comment"
          class="flex items-stretch gap-1"
        >
          <div class="w-6 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-default" />
          </div>
          <div class="text-xs/5 italic">
            « {{ request.comment }} »
          </div>
        </div>
        <div class="text-sm/6 text-gray-medium">
          {{ formatDate(new Date(request.created), { dateStyle: 'long', timeStyle: 'short' }) }}
        </div>
      </div>
      <div
        v-if="showActions"
        class="flex flex-col gap-2.5 items-end"
      >
        <BrandedButton
          color="danger"
          size="xs"
          :loading="loading"
          @click="cancelInvitation"
        >
          {{ t("Annuler l'invitation") }}
        </BrandedButton>
      </div>
    </div>
  </div>

  <!-- Membership request (by a user) -->
  <BannerNotif
    v-else
    type="primary"
    :icon="RiUserAddLine"
    :badge="$t(`Demande de rattachement`)"
    :user="request.user!"
    :date="new Date(request.created)"
  >
    <template #title>
      <code
        v-if="request.user?.email"
        class="text-gray-medium bg-gray-lower px-1 text-sm rounded-sm break-all"
      >{{ request.user.email }}</code>
      {{ t("demande à rejoindre l'organisation.") }}
    </template>

    <template #body>
      {{ request.comment }}
    </template>

    <template #buttons>
      <BrandedButton
        v-if="showActions"
        color="primary"
        size="xs"
        :icon="RiCheckLine"
        @click="accept"
      >
        {{ $t('Accepter la demande') }}
      </BrandedButton>
      <ModalWithButton
        v-if="showActions"
        :title="t(`Refuser la demande de rattachement`)"
        size="lg"
        @open="refuseComment = ''"
      >
        <template #button="{ attrs, listeners }">
          <BrandedButton
            color="danger"
            size="xs"
            :disabled="loading"
            v-bind="attrs"
            v-on="listeners"
          >
            {{ t("Refuser") }}
          </BrandedButton>
        </template>

        <template #default="{ close }">
          <AdminMembershipRequest
            class="mb-5"
            :loading="false"
            :oid="oid"
            :request="request"
            :show-actions="false"
          />
          <form
            :id="refuseFormId"
            @submit.prevent="refuse(close)"
          >
            <InputGroup
              v-model="refuseComment"
              :label="t('Vous pouvez fournir le motif de refus :')"
            />
          </form>
        </template>

        <template #footer="{ close }">
          <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
            <div class="fr-col-auto">
              <BrandedButton
                color="secondary"
                :disabled="loading"
                @click="close"
              >
                {{ t("Annuler") }}
              </BrandedButton>
            </div>
            <div class="fr-col-auto">
              <BrandedButton
                type="submit"
                color="primary"
                :disabled="loading || !refuseComment"
                :form="refuseFormId"
              >
                {{ t("Refuser la demande") }}
              </BrandedButton>
            </div>
          </div>
        </template>
      </ModalWithButton>
    </template>
  </BannerNotif>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, useFormatDate } from '@datagouv/components-next'
import { computed, ref } from 'vue'
import { RiCheckLine, RiMailLine, RiMailSendLine, RiUserAddLine } from '@remixicon/vue'
import InputGroup from '../InputGroup/InputGroup.vue'
import ModalWithButton from '../Modal/ModalWithButton.vue'
import AdminBadge from '../AdminBadge/AdminBadge.vue'
import type { MemberRole, PendingMembershipRequest } from '~/types/types'

const props = defineProps<{
  oid: string
  request: PendingMembershipRequest
  showActions: boolean
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
  if (!roles.value || !props.request.role) return null
  const role = roles.value.find(r => r.id === props.request.role)
  return role?.label ?? props.request.role
})

const accept = async () => {
  try {
    loading.value = true
    await $api(`/api/1/organizations/${props.oid}/membership/${props.request.id}/accept`, {
      method: 'POST',
    })
    emits('refresh')
  }
  finally {
    loading.value = false
  }
}

const cancelInvitation = async () => {
  try {
    loading.value = true
    await $api(`/api/1/organizations/${props.oid}/membership/${props.request.id}/cancel/`, {
      method: 'POST',
    })
    emits('refresh')
  }
  finally {
    loading.value = false
  }
}

const refuseFormId = useId()
const refuseComment = ref('')
const refuse = async (close: () => void) => {
  try {
    loading.value = true
    await $api(`/api/1/organizations/${props.oid}/membership/${props.request.id}/refuse`, {
      method: 'POST',
      body: JSON.stringify({ comment: refuseComment.value }),
    })
    emits('refresh')
    close()
  }
  finally {
    loading.value = false
  }
}
</script>
