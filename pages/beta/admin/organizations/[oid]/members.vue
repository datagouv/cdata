<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Members') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-bold text-2xl mb-5">
      {{ t("Members") }}
    </h1>

    <div
      v-if="currentOrganization && membershipRequests && membershipRequests.length"
      class="mb-8"
    >
      <h2 class="text-sm font-bold uppercase mt-5 mb-5">
        {{ t("{n} requests", { n: membershipRequests.length }) }}
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
          {{ t("{n} members", { n: organization.members.length }) }}
        </h2>
      </div>
      <div
        v-if="isAdmin"
        class="flex-none"
      >
        <ModalWithButton
          :title="t('Add member to the organization')"
          size="lg"
        >
          <template #button="{ attrs, listeners }">
            <BrandedButton
              size="xs"
              :icon="RiAddLine"
              v-bind="attrs"
              v-on="listeners"
            >
              {{ t("Add member") }}
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
                  :label="$t('User')"
                  :placeholder="$t('Search a user')"
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
                      />
                      <span>{{ user.first_name }} {{ user.last_name }}</span>
                    </div>
                  </template>
                </SearchableSelect>
              </div>
              <SelectGroup
                v-if="roles.length > 0"
                v-model="addForm.role"
                :label="t('Role of the member')"
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
                {{ t("Cancel") }}
              </BrandedButton>
              <BrandedButton
                color="primary"
                size="xs"
                type="submit"
                :form="addFormId"
                :disabled="loading || !canSubmitNewMember"
              >
                {{ t("Add to the organization") }}
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
              {{ t("Members") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
              class="w-36"
            >
              {{ t("Status") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
              class="w-28"
            >
              {{ t("Member since") }}
            </AdminTableTh>
            <AdminTableTh
              scope="col"
              class="w-40"
            >
              {{ t("Last connection") }}
            </AdminTableTh>
            <AdminTableTh
              class="w-24"
              scope="col"
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
              <p v-if="isGlobalAdmin">
                <NuxtLinkLocale
                  :to="`/beta/admin/users/${member.user.id}/profile`"
                  class="fr-text--bold fr-m-0"
                >
                  {{ member.user.first_name }} {{ member.user.last_name }}
                </NuxtLinkLocale>
              </p>
              <p
                v-else
                class="fr-text--bold fr-m-0"
              >
                {{ member.user.first_name }} {{ member.user.last_name }}
              </p>
              <p class="fr-m-0 fr-text--xs text-mention-grey f-italic inline-flex items-center">
                <RiMailLine class="size-3" />
                <TextClamp
                  class="fr-px-1v"
                  :text="member.user.email"
                  :auto-resize="true"
                  :max-lines="1"
                />
              </p>
            </td>
            <td>
              <AdminBadge
                size="xs"
                :type="getStatusType(member.role)"
              >
                {{ getStatus(member.role) }}
              </AdminBadge>
            </td>
            <td>{{ formatDate(member.since) }}</td>
            <td>
              <span v-if="member.user.last_login_at">{{ formatFromNow(member.user.last_login_at) }}</span>
              <span v-else>{{ t("No connection") }}</span>
            </td>
            <td>
              <div class="flex items-center">
                <BrandedButton
                  :href="member.user.page"
                  color="secondary-softer"
                  :icon="RiEyeLine"
                  size="xs"
                  icon-only
                  keep-margins-even-without-borders
                >
                  {{ $t('See public page') }}
                </BrandedButton>
                <ModalWithButton
                  v-if="isOrgAdmin"
                  :title="$t('Edit member')"
                  size="lg"
                  @open="newRole = member.role"
                >
                  <template #button="{ attrs, listeners }">
                    <BrandedButton
                      color="secondary-softer"
                      :icon="RiPencilLine"
                      icon-only
                      size="xs"
                      keep-margins-even-without-borders
                      v-bind="attrs"
                      v-on="listeners"
                    >
                      {{ t("Edit") }}
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
                      <AdminEmail
                        v-if="member.user.email"
                        :email="member.user.email"
                      />
                    </div>
                    <form
                      class="flex flex-wrap gap-4 items-end"
                      @submit.prevent="updateRole(member, close)"
                    >
                      <div class="flex-1">
                        <SelectGroup
                          v-if="roles.length > 0"
                          v-model="newRole"
                          :label="t('Role of the member')"
                          :options="rolesOptions"
                        />
                      </div>
                      <div>
                        <BrandedButton
                          type="submit"
                          :disabled="loading"
                        >
                          {{ t("Validate") }}
                        </BrandedButton>
                      </div>
                    </form>
                    <BannerAction
                      class="mt-4"
                      type="danger"
                      :title="$t('Remove member from the organization')"
                    >
                      {{ t("Be careful, this action can't be reverse.") }}
                      <template #button>
                        <BrandedButton
                          :loading
                          :icon="RiLogoutBoxRLine"
                          @click="removeMemberFromOrganization(member, close)"
                        >
                          {{ t('Remove member') }}
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
import { Avatar, getUserAvatar, type Member, type Organization } from '@datagouv/components-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RiAddLine, RiEye2Line, RiEyeLine, RiLogoutBoxRLine, RiMailLine, RiPencilLine } from '@remixicon/vue'
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

const config = useRuntimeConfig()
const { t } = useI18n()
const { $api } = useNuxtApp()

const me = useMe()

const { currentOrganization } = useCurrentOwned()

const url = computed(() => {
  if (!currentOrganization.value) {
    throw 'Cannot load this component outside organization URL.'
  }
  const url = new URL(`/api/1/organizations/${currentOrganization.value.id}`, config.public.apiBase)
  return url.toString()
})

const { data: organization, status, refresh } = await useAPI<Organization>(url, { lazy: true })
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

const isGlobalAdmin = computed(() => isAdmin(me.value))
const isOrgAdmin = computed(() => isGlobalAdmin.value || (organization && organization.value.members.some(member => member.user.id === me.value.id && member.role === 'admin')))

const newRole = ref<MemberRole | null>(null)
const { data: roles } = await useAPI<Array<{ id: MemberRole, label: string }>>('/api/1/organizations/roles/', { lazy: true })
const rolesOptions = computed(() => {
  if (!roles) return []

  return roles.value.map(role => ({
    label: role.label,
    value: role.id,
  }))
})
const loading = ref(false)

function getStatus(role: MemberRole): string {
  return roles.value.find(memberRole => memberRole.id === role)?.label ?? role
}

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
const submitNewMember = async (close) => {
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
