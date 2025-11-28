<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Membres') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-gray-title text-2xl mb-5">
      {{ t("Membres") }}
    </h1>

    <div
      v-if="currentOrganization && membershipRequests && membershipRequests.length"
      class="mb-8"
    >
      <h2 class="text-sm font-bold uppercase mt-5 mb-5">
        {{ t("{n} demandes | {n} demande | {n} demandes", { n: membershipRequests.length }) }}
      </h2>
      <div class="space-y-8 max-w-6xl">
        <AdminMembershipRequest
          v-for="request in membershipRequests"
          :key="request.id"
          :oid="currentOrganization.id"
          :request="request"
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
        v-if="isOrgAdmin"
        class="flex-none"
      >
        <ModalWithButton
          :title="t(`Ajouter un membre à l'organisation`)"
          size="lg"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              size="xs"
              :icon="RiAddLine"
              v-bind="attrs"
              v-on="listeners"
            >
              {{ t("Ajouter un membre") }}
            </BrandedButton>
          </template>

          <template #default="{ close }">
            <form
              :id="addFormId"
              @submit.prevent="submitNewMember(close)"
            >
              <div>
                <SearchableSelect
                  v-model="addForm.user"
                  :label="$t('Utilisateur')"
                  :placeholder="$t('Rechercher un utilisateur')"
                  class="mb-6"
                  :display-value="(user) => `${user.first_name} ${user.last_name}`"
                  :suggest="suggestUser"
                  :multiple="false"
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
              </div>
              <SelectGroup
                v-if="roles.length > 0"
                v-model="addForm.role"
                :label="t('Rôle du membre')"
                :options="rolesOptions"
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
                :form="addFormId"
                :disabled="loading || !canSubmitNewMember"
              >
                {{ t("Ajouter à l'organisation") }}
              </BrandedButton>
            </div>
          </template>
        </ModalWithButton>
      </div>
    </div>

    <LoadingBlock :status>
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
            <AdminTableTh scope="col">
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
                >
                  {{ $t('Voir la page publique') }}
                </BrandedButton>
                <ModalWithButton
                  v-if="isOrgAdmin"
                  :title="$t('Modifier le membre')"
                  size="lg"
                  @open="newRole = member.role"
                >
                  <template #button="{ attrs, listeners }">
                    <BrandedButton
                      color="tertiary"
                      :icon="RiPencilLine"
                      icon-only
                      size="xs"
                      keep-margins-even-without-borders
                      v-bind="attrs"
                      v-on="listeners"
                    >
                      {{ t("Modifier") }}
                    </BrandedButton>
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
                          v-if="roles.length > 0"
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
import { Avatar, BannerAction, LoadingBlock, useFormatDate, useGetUserAvatar, type Member, type Organization } from '@datagouv/components-next'
import { computed, ref } from 'vue'
import { RiAddLine, RiEyeLine, RiLogoutBoxRLine, RiPencilLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'
import type { AdminBadgeType, MemberRole, PendingMembershipRequest, UserSuggest } from '~/types/types'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import ModalWithButton from '~/components/Modal/ModalWithButton.vue'
import SelectGroup from '~/components/Form/SelectGroup/SelectGroup.vue'
import SearchableSelect from '~/components/SearchableSelect.vue'
import AdminMembershipRequest from '~/components/AdminMembershipRequest/AdminMembershipRequest.vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import { isUserOrgAdmin, useMe } from '~/utils/auth'

const config = useRuntimeConfig()
const { t } = useTranslation()
const { formatDate, formatFromNow } = useFormatDate()
const { $api } = useNuxtApp()
const getUserAvatar = useGetUserAvatar()
const me = useMe()

const { currentOrganization } = useCurrentOwned()

const url = computed(() => {
  if (!currentOrganization.value) {
    throw 'Cannot load this component outside organization URL.'
  }
  const url = new URL(`/api/1/organizations/${currentOrganization.value.id}`, config.public.apiBase)
  return url.toString()
})

const { data: organization, status, refresh } = await useAPI<Organization>(url, { redirectOn404: true })
const { data: membershipRequests, refresh: refreshMembershipRequests } = await useAPI<Array<PendingMembershipRequest>>(`/api/1/organizations/${currentOrganization.value?.id}/membership/`, {
  lazy: true,
  query: { status: 'pending' },
})

const refreshAll = async () => {
  await Promise.all([
    refresh(),
    refreshMembershipRequests(),
  ])
}

const isOrgAdmin = computed(() => isUserOrgAdmin(me.value, organization.value))

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
  return role === 'admin' ? 'primary' : 'secondary'
}

const removeMemberFromOrganization = async (member: Member, close: () => void) => {
  try {
    loading.value = true
    await $api(`/api/1/organizations/${currentOrganization.value.id}/member/${member.user.id}`, { method: 'DELETE' })
    await refresh()
    close()
  }
  catch {
    // toast.error(t('An error occurred while removing this member.'))
  }
  finally {
    loading.value = false
  }
}

const updateRole = async (member: Member, close) => {
  if (member.role === newRole.value) {
    close()
    return
  }

  try {
    loading.value = true
    await $api(`/api/1/organizations/${currentOrganization.value.id}/member/${member.user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole.value }),
    })
    await refresh()
    close()
  }
  catch {
    // toast.error(t('An error occurred while update member role.'))
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

const addFormId = useId()
const addForm = ref({
  role: null as MemberRole | null,
  user: null as UserSuggest | null,
})
const canSubmitNewMember = computed(() => {
  if (!addForm.value.role) return false
  if (!addForm.value.user) return false

  return true
})
const submitNewMember = async (close: () => void) => {
  if (!canSubmitNewMember.value) return

  try {
    loading.value = true
    await $api(`/api/1/organizations/${currentOrganization.value?.id}/member/${addForm.value.user?.id}`, {
      method: 'POST',
      body: JSON.stringify({ role: addForm.value.role }),
    })
    await refresh()
    addForm.value.role = null
    addForm.value.user = null
    close()
  }
  catch {
    // toast.error(t('An error occurred while update member role.'))
  }
  finally {
    loading.value = false
  }
}
</script>
