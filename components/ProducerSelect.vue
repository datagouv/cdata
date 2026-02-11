<template>
  <SearchableSelect
    v-model="model"
    :options="ownedOptions"
    :suggest
    :label
    :placeholder="t('Rechercher…')"
    :get-option-id="(option) => option.organization ? option.organization.id : option.owner.id"
    :display-value="(option) => option.organization ? option.organization.name : `${option.owner.first_name} ${option.owner.last_name}`"
    :filter="(option, query) => (option.organization ? option.organization.name : `${option.owner.first_name} ${option.owner.last_name}`).toLocaleLowerCase().includes(query.toLocaleLowerCase())"
    :multiple="false"

    :error-text
    :warning-text
  >
    <template #option="{ option }">
      <div class="flex items-center space-x-2">
        <Placeholder
          v-if="option.organization"
          type="organization"
          :lazy="false"
          :src="option.organization.logo_thumbnail"
          :size="20"
        />
        <NuxtImg
          v-else
          class="rounded-full border border-gray-default size-5"
          :src="getUserAvatar(option.owner, 24)"
          alt=""
        />
        <span v-if="option.organization">{{ option.organization.name }}</span>
        <span v-else>{{ option.owner.first_name }} {{ option.owner.last_name }}</span>
      </div>
    </template>
  </SearchableSelect>
</template>

<script setup lang="ts">
import { useGetUserAvatar, BrandedButton, PaddedContainer, OrganizationLogo, SearchableSelect, type Owned, type OrganizationReference, type UserReference } from '@datagouv/components-next'
import { useMe } from '~/utils/auth'

const getUserAvatar = useGetUserAvatar()

const props = withDefaults(defineProps<{
  label: string
  errorText?: string | null
  warningText?: string | null
  all?: boolean
  required?: boolean
  organizationsOnly?: boolean
  organizationPermissionNeed?: 'delete' | 'edit' | 'harvest' | 'members' | 'private' | null
}>(), {
  all: false,
  required: false,
  organizationsOnly: false,
  organizationPermissionNeed: null,
})
const model = defineModel<Owned | null>({ required: true })

const { t } = useTranslation()
const user = useMe()
const { $api } = useNuxtApp()

const organizations = props.organizationPermissionNeed ? user.value.organizations.filter(org => org.permissions[props.organizationPermissionNeed!]) : user.value.organizations

const ownedOptions = computed<Array<Owned>>(() => {
  const orgs = organizations.map(organization => ({ organization, owner: null }))
  if (props.organizationsOnly) {
    return orgs
  }
  return [...orgs, { owner: user.value, organization: null }]
})

const hasOrganizations = computed(() => {
  return user.value?.organizations && user.value.organizations.length > 0
})

const suggest = computed(() => {
  if (!props.all) return undefined

  return async (query: string) => {
    if (!query) return Promise.resolve(ownedOptions.value)
    const users = await $api<Array<User>>('/api/1/users/suggest/', {
      query: {
        q: query,
        size: 5,
      },
    })
    const organizations = await $api<Array<Organization>>('/api/1/organizations/suggest/', {
      query: {
        q: query,
        size: 5,
      },
    })
    return [...organizations.map(organization => ({ organization, owner: null })), ...users.map(user => ({ organization: null, owner: user }))]
  }
})
</script>
