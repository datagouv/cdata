<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Membres') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-gray-title text-2xl mb-5">
      {{ t("Membres") }}
    </h1>

    <div
      v-if="currentOrganization && pendingRequests.length"
      class="mb-8"
    >
      <h2 class="text-sm font-bold uppercase mt-5 mb-5">
        {{ t("{n} demandes de rattachement | {n} demande de rattachement | {n} demandes de rattachement", { n: pendingRequests.length }) }}
      </h2>
      <div class="space-y-4 max-w-6xl">
        <AdminMembershipRequest
          v-for="request in pendingRequests"
          :key="request.id"
          :oid="currentOrganization.id"
          :request="request"
          :show-actions="true"
          @refresh="refreshAll"
        />
      </div>
    </div>

    <div
      v-if="currentOrganization && pendingInvitations.length"
      class="mb-8"
    >
      <h2 class="text-sm font-bold uppercase mt-5 mb-5">
        {{ t("{n} invitations en attente | {n} invitation en attente | {n} invitations en attente", { n: pendingInvitations.length }) }}
      </h2>
      <div class="space-y-4 max-w-6xl">
        <AdminMembershipRequest
          v-for="invitation in pendingInvitations"
          :key="invitation.id"
          :oid="currentOrganization.id"
          :request="invitation"
          :show-actions="true"
          @refresh="refreshAll"
        />
      </div>
    </div>

    <div
      v-if="organization"
      class="flex flex-wrap gap-x-4 gap-y-2 items-center"
    >
      <div class="flex-1">
        <h2 class="text-sm font-bold uppercase m-0">
          {{ t("{n} membres | {n} membre | {n} membres", { n: organization.members.length }) }}
        </h2>
      </div>
      <div
        v-if="organization.permissions.members"
        class="flex-none"
      >
        <ModalWithButton
          :title="t(`Inviter un membre`)"
          size="xl"
          @open="resetInviteForm"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              size="xs"
              :icon="RiUserAddLine"
              v-bind="attrs"
              v-on="listeners"
            >
              {{ t("Inviter un membre") }}
            </BrandedButton>
          </template>

          <template #default="{ close }">
            <form
              :id="inviteFormId"
              @submit.prevent="submitInvitation(close)"
            >
              <div class="space-y-4">
                <SearchableSelect
                  v-model="inviteForm.user"
                  :label="$t('Utilisateur')"
                  :placeholder="$t('Rechercher un utilisateur')"
                  :hint-text="$t(`Laissez vide si vous souhaitez inviter par email`)"
                  :display-value="(user) => `${user.first_name} ${user.last_name}`"
                  :suggest="suggestUser"
                  :multiple="false"
                  :disabled="!!inviteForm.email"
                  :has-error="!!getFirstError('user')"
                  :error-text="getFirstError('user')"
                  @update:model-value="touch('user')"
                >
                  <template #option="{ option: user }">
                    <div class="flex items-center space-x-2">
                      <NuxtImg
                        class="rounded-full border border-gray-default size-5"
                        :src="getUserAvatar(user, 24)"
                        loading="lazy"
                        alt=""
                        data-testid="user-avatar"
                      />
                      <span>{{ user.first_name }} {{ user.last_name }}
                        <small
                          v-if="user.email"
                          class="text-gray-medium"
                        >({{ user.email }})</small>
                      </span>
                    </div>
                  </template>
                </SearchableSelect>

                <p class="text-center text-gray-medium text-sm">
                  {{ t('ou') }}
                </p>

                <InputGroup
                  v-model="inviteForm.email"
                  :label="$t('Email')"
                  :hint-text="$t(`Inviter une personne par email (même si elle n'a pas encore de compte)`)"
                  type="email"
                  :disabled="!!inviteForm.user"
                  :has-error="!!getFirstError('email')"
                  :error-text="getFirstError('email')"
                  @change="touch('email')"
                />

                <SelectGroup
                  v-if="roles && roles.length > 0"
                  v-model="inviteForm.role"
                  :label="t('Rôle')"
                  :options="rolesOptions"
                />

                <InputGroup
                  v-model="inviteForm.comment"
                  :label="$t('Message (optionnel)')"
                  :hint-text="$t(`Ce message sera inclus dans l'email d'invitation`)"
                />
              </div>

              <DatasetAssignmentSelector
                v-if="inviteForm.role === 'partial_editor' && currentOrganization"
                v-model="inviteSelectedDatasetIds"
                :organization-id="currentOrganization.id"
              />
            </form>
          </template>

          <template #footer="{ close }">
            <div class="space-x-4">
              <BrandedButton
                color="secondary"
                size="xs"
                :disabled="loading"
                @click="close"
              >
                {{ t("Annuler") }}
              </BrandedButton>
              <BrandedButton
                color="primary"
                size="xs"
                type="submit"
                :form="inviteFormId"
                :disabled="loading || !canSubmitInvitation"
              >
                {{ t("Envoyer l'invitation") }}
              </BrandedButton>
            </div>
          </template>
        </ModalWithButton>
      </div>
    </div>

    <LoadingBlock
      v-slot="{ data: organization }"
      :status
      :data="organization"
    >
      <AdminTable
        v-if="organization && organization.members.length > 0"
      >
        <thead>
          <tr>
            <AdminTableTh scope="col">
              {{ t("Membres") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
              class="w-36"
            >
              {{ t("Statut") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
              class="w-28"
            >
              {{ t("Membre depuis") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
              class="w-40"
            >
              {{ t("Dernière connexion") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
              class="w-0"
            >
              {{ t("Actions") }}
            </AdminTableTh>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="member in organization?.members || []"
            :key="member.user.id"
          >
            <td>
              <p v-if="isMeAdmin()">
                <CdataLink
                  :to="`/admin/users/${member.user.id}/profile`"
                  class="fr-text--bold fr-m-0"
                >
                  {{ member.user.first_name }} {{ member.user.last_name }}
                </CdataLink>
              </p>
              <p
                v-else
                class="fr-text--bold fr-m-0"
              >
                {{ member.user.first_name }} {{ member.user.last_name }}
              </p>
              <AdminEmail :user="member.user" />
            </td>
            <td>
              <AdminBadge
                size="xs"
                :type="getStatusType(member.role)"
              >
                {{ member.label }}
              </AdminBadge>
            </td>
            <td>{{ formatDate(member.since) }}</td>
            <td>
              <span v-if="member.user.last_login_at">{{ formatFromNow(member.user.last_login_at) }}</span>
              <span v-else>{{ t("Aucune connexion") }}</span>
            </td>
            <td>
              <div class="flex items-center">
                <BrandedButton
                  :href="member.user.page"
                  color="tertiary"
                  :icon="RiEyeLine"
                  size="xs"
                  icon-only
                  keep-margins-even-without-borders
                  :title="$t('Voir la page publique')"
                />
                <ModalWithButton
                  v-if="organization.permissions.members"
                  :title="$t('Modifier le membre')"
                  size="xl"
                  @open="openEditModal(member)"
                >
                  <template #button="{ attrs, listeners }">
                    <BrandedButton
                      color="tertiary"
                      :icon="RiPencilLine"
                      icon-only
                      size="xs"
                      keep-margins-even-without-borders
                      :title="t('Modifier')"
                      v-bind="attrs"
                      v-on="listeners"
                    />
                  </template>

                  <template #default="{ close }">
                    <div class="fr-grid-row fr-grid-row--middle fr-mb-2w">
                      <Avatar
                        class="fr-mr-1v"
                        :user="member.user"
                        :rounded="true"
                        :size="24"
                      />
                      <p class="fr-text--bold fr-m-0 fr-mr-1v">
                        {{ member.user.first_name }} {{ member.user.last_name }}
                      </p>
                      <p
                        v-if="member.user.email"
                        class="px-1 rounded-2 monospace text-sm text-gray-medium bg-gray-lower m-0"
                      >
                        {{ member.user.email }}
                      </p>
                    </div>
                    <form
                      class="flex flex-wrap gap-4 items-end"
                      @submit.prevent="updateRole(member, close)"
                    >
                      <div class="flex-1">
                        <SelectGroup
                          v-if="roles && roles.length > 0"
                          v-model="newRole"
                          :label="t('Rôle du membre')"
                          :options="rolesOptions"
                        />
                      </div>
                      <div>
                        <BrandedButton
                          type="submit"
                          :disabled="loading"
                        >
                          {{ t("Valider") }}
                        </BrandedButton>
                      </div>
                    </form>
                    <DatasetAssignmentSelector
                      v-if="newRole === 'partial_editor' && currentOrganization"
                      v-model="editSelectedDatasetIds"
                      :organization-id="currentOrganization.id"
                    />

                    <BannerAction
                      class="mt-4"
                      type="danger"
                      :title="$t(`Retirer le membre de l'organisation`)"
                    >
                      {{ t("Attention, cette action ne peut pas être annulée.") }}
                      <template #button>
                        <BrandedButton
                          :loading
                          :icon="RiLogoutBoxRLine"
                          @click="removeMemberFromOrganization(member, close)"
                        >
                          {{ t('Retirer le membre') }}
                        </BrandedButton>
                      </template>
                    </BannerAction>
                  </template>
                </ModalWithButton>
              </div>
            </td>
          </tr>
        </tbody>
      </AdminTable>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BannerAction, BrandedButton, LoadingBlock, SearchableSelect, SelectGroup, useFormatDate, useGetUserAvatar, type Member, type Organization } from '@datagouv/components-next'
import { computed, ref } from 'vue'
import { RiEyeLine, RiLogoutBoxRLine, RiPencilLine, RiUserAddLine } from '@remixicon/vue'
import type { AdminBadgeType, Assignment, MemberRole, PendingMembershipRequest, UserSuggest } from '~/types/types'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import ModalWithButton from '~/components/Modal/ModalWithButton.vue'
import InputGroup from '~/components/InputGroup/InputGroup.vue'
import AdminMembershipRequest from '~/components/AdminMembershipRequest/AdminMembershipRequest.vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import { useNotifications } from '~/composables/useNotifications.client'
import { email, required } from '~/composables/useForm'

const config = useRuntimeConfig()
const { t } = useTranslation()
const { formatDate, formatFromNow } = useFormatDate()
const { $api } = useNuxtApp()
const getUserAvatar = useGetUserAvatar()

const { currentOrganization } = useCurrentOwned()

const url = computed(() => {
  if (!currentOrganization.value) {
    throw 'Cannot load this component outside organization URL.'
  }
  const url = new URL(`/api/1/organizations/${currentOrganization.value.id}`, config.public.apiBase)
  return url.toString()
})

const { refreshNotifications } = useNotifications()
const { data: organization, status, refresh } = await useAPI<Organization>(url, { redirectOn404: true })
const membershipRequests = ref<Array<PendingMembershipRequest> | null>(null)

async function fetchPendingMembershipRequests() {
  if (!organization.value?.permissions.members) return
  membershipRequests.value = await $api<Array<PendingMembershipRequest>>(`/api/1/organizations/${currentOrganization.value?.id}/membership/`, {
    query: { status: 'pending' },
  })
}

watch(organization, () => {
  fetchPendingMembershipRequests()
}, { immediate: true })

const pendingRequests = computed(() => {
  if (!membershipRequests.value) return []
  return membershipRequests.value.filter(r => r.kind !== 'invitation')
})

const pendingInvitations = computed(() => {
  if (!membershipRequests.value) return []
  return membershipRequests.value.filter(r => r.kind === 'invitation')
})

const refreshAll = async () => {
  await Promise.all([refresh(), refreshNotifications(), fetchPendingMembershipRequests()])
}

const newRole = ref<MemberRole | null>(null)
const { data: roles } = await useAPI<Array<{ id: MemberRole, label: string }>>('/api/1/organizations/roles/', { lazy: true })
const rolesOptions = computed(() => {
  if (!roles.value) return []

  return roles.value.map(role => ({
    label: role.label,
    value: role.id,
  }))
})
const loading = ref(false)

function getStatusType(role: MemberRole): AdminBadgeType {
  if (role === 'admin') return 'primary'
  if (role === 'partial_editor') return 'default'
  return 'secondary'
}

const editSelectedDatasetIds = ref<Set<string>>(new Set())
const editOriginalDatasetIds = ref<Set<string>>(new Set())

const openEditModal = async (member: Member) => {
  newRole.value = member.role
  editSelectedDatasetIds.value = new Set()
  editOriginalDatasetIds.value = new Set()

  if (member.role === 'partial_editor' && currentOrganization.value) {
    const assignments = await $api<Array<Assignment>>(`/api/1/organizations/${currentOrganization.value.id}/assignments/`, {
      query: { user: member.user.id },
    })
    const ids = new Set(assignments.map(a => a.subject.id))
    editSelectedDatasetIds.value = ids
    editOriginalDatasetIds.value = new Set(ids)
  }
}

const removeMemberFromOrganization = async (member: Member, close: () => void) => {
  try {
    loading.value = true
    await $api(`/api/1/organizations/${currentOrganization.value!.id}/member/${member.user.id}`, { method: 'DELETE' })
    await refresh()
    close()
  }
  finally {
    loading.value = false
  }
}

const syncAssignments = async (member: Member) => {
  const orgId = currentOrganization.value!.id
  const added = [...editSelectedDatasetIds.value].filter(id => !editOriginalDatasetIds.value.has(id))
  const removed = [...editOriginalDatasetIds.value].filter(id => !editSelectedDatasetIds.value.has(id))

  const createPromises = added.map(id =>
    $api(`/api/1/organizations/${orgId}/assignments/`, {
      method: 'POST',
      body: JSON.stringify({ user: member.user.id, subject: { class: 'Dataset', id } }),
    }),
  )

  let deletePromises: Array<Promise<unknown>> = []
  if (removed.length > 0) {
    const assignments = await $api<Array<Assignment>>(`/api/1/organizations/${orgId}/assignments/`, {
      query: { user: member.user.id },
    })
    deletePromises = removed
      .map(id => assignments.find(a => a.subject.id === id))
      .filter((a): a is Assignment => !!a)
      .map(a => $api(`/api/1/organizations/${orgId}/assignments/${a.id}/`, { method: 'DELETE' }))
  }

  await Promise.all([...createPromises, ...deletePromises])
}

const updateRole = async (member: Member, close: () => void) => {
  const roleChanged = member.role !== newRole.value
  const isPartialEditor = newRole.value === 'partial_editor'
  const assignmentsChanged = isPartialEditor && (
    editSelectedDatasetIds.value.size !== editOriginalDatasetIds.value.size
    || [...editSelectedDatasetIds.value].some(id => !editOriginalDatasetIds.value.has(id))
  )

  if (!roleChanged && !assignmentsChanged) {
    close()
    return
  }

  try {
    loading.value = true
    if (roleChanged) {
      await $api(`/api/1/organizations/${currentOrganization.value!.id}/member/${member.user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole.value }),
      })
    }
    if (isPartialEditor && assignmentsChanged) {
      await syncAssignments(member)
    }
    await refresh()
    close()
  }
  finally {
    loading.value = false
  }
}

const suggestUser = async (query: string): Promise<Array<UserSuggest>> => {
  return await $api<Array<UserSuggest>>('/api/1/users/suggest/', {
    query: {
      q: query,
      size: 5,
    },
  })
}

type InviteFormData = {
  role: MemberRole | null
  user: UserSuggest | null
  email: string
  comment: string
}

const isUserAlreadyInvitedOrMember = (user: UserSuggest | null): string | null => {
  if (!user) return null
  if (organization.value?.members.some(m => m.user.id === user.id)) {
    return t('Cet utilisateur est déjà membre de l\'organisation')
  }
  if (pendingInvitations.value.some(i => i.user?.id === user.id)) {
    return t('Cet utilisateur a déjà été invité')
  }
  return null
}

const isEmailAlreadyInvited = (emailValue: string): string | null => {
  if (!emailValue) return null
  if (pendingInvitations.value.some(i => i.email?.toLowerCase() === emailValue.toLowerCase())) {
    return t('Cette adresse email a déjà été invitée')
  }
  if (organization.value?.members.some(m => m.user.email?.toLowerCase() === emailValue.toLowerCase())) {
    return t('Un membre avec cette adresse email existe déjà')
  }
  return null
}

const inviteFormId = useId()
const { form: inviteForm, getFirstError, validate, removeErrorsAndWarnings, touch } = useForm<InviteFormData>({
  role: null,
  user: null,
  email: '',
  comment: '',
}, {
  role: [required(t('Le rôle est requis'))],
  user: [value => isUserAlreadyInvitedOrMember(value)],
  email: [email(), value => isEmailAlreadyInvited(value)],
})

const inviteSelectedDatasetIds = ref<Set<string>>(new Set())

watch(() => inviteForm.value.role, () => {
  inviteSelectedDatasetIds.value = new Set()
})

const resetInviteForm = () => {
  inviteForm.value = {
    role: null,
    user: null,
    email: '',
    comment: '',
  }
  inviteSelectedDatasetIds.value = new Set()
  removeErrorsAndWarnings()
}

const canSubmitInvitation = computed(() => {
  if (!inviteForm.value.role) return false
  if (!inviteForm.value.user && !inviteForm.value.email) return false
  if (getFirstError('user') || getFirstError('email')) return false
  return true
})

const submitInvitation = async (close: () => void) => {
  const isValid = await validate()
  if (!isValid) return
  if (!canSubmitInvitation.value) return

  try {
    loading.value = true
    await $api(`/api/1/organizations/${currentOrganization.value?.id}/member/`, {
      method: 'POST',
      body: JSON.stringify({
        user: inviteForm.value.user?.id || undefined,
        email: inviteForm.value.email || undefined,
        role: inviteForm.value.role,
        comment: inviteForm.value.comment || undefined,
        assignments: inviteForm.value.role === 'partial_editor'
          ? [...inviteSelectedDatasetIds.value].map(id => ({ class: 'Dataset', id }))
          : undefined,
      }),
    })
    await refreshAll()
    resetInviteForm()
    close()
  }
  finally {
    loading.value = false
  }
}
</script>
