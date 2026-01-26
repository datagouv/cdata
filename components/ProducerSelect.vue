<template>
  <div v-if="hasOrganizations || (!hasOrganizations && !organizationsOnly)">
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
      data-testid="producer-select"
    >
      <template #option="{ option }">
        <div class="flex items-center space-x-2">
          <OrganizationLogo
            v-if="option.organization"
            :organization="option.organization"
            size-class="size-5"
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
  </div>
  <div v-if="!hasOrganizations">
    <br>
    <PaddedContainer
      class="flex flex-col items-center"
      color="alt-grey"
    >
      <p class="fr-text--bold fr-mb-2w text-center">
        {{ t("Vous n'appartenez à aucune organisation") }}
      </p>
      <p class="fr-text--sm fr-mb-3w text-center">
        {{ t("Nous vous conseillons de publier sous le nom d'une organisation s'il s'agit d'une activité professionnelle.") }}
      </p>
      <BrandedButton
        color="primary"
        @click="navigateTo('/admin/organizations/new/')"
      >
        {{ t("Créer ou rejoindre une organisation") }}
      </BrandedButton>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { useGetUserAvatar, BrandedButton, PaddedContainer, OrganizationLogo, type Owned, type OrganizationReference, type UserReference } from '@datagouv/components-next'

const getUserAvatar = useGetUserAvatar()

const props = withDefaults(defineProps<{
  label: string
  errorText?: string | null
  warningText?: string | null
  all?: boolean
  required?: boolean
  organizationsOnly?: boolean
}>(), {
  all: false,
  required: false,
  organizationsOnly: false,
})
const model = defineModel<Owned | null>({ required: true })

const { t } = useTranslation()
const user = useMe()
const { $api } = useNuxtApp()

const ownedOptions = computed<Array<Owned>>(() => {
  const organizations = user.value.organizations.map(organization => ({ organization, owner: null }))

  if (props.organizationsOnly) {
    return organizations
  }
  return [...organizations, { owner: { ...user.value, class: 'User' }, organization: null }]
})

const hasOrganizations = computed(() => {
  return user.value?.organizations && user.value.organizations.length > 0
})

const suggest = computed(() => {
  if (!props.all) return undefined

  return async (query: string) => {
    if (!query) return Promise.resolve(ownedOptions.value)

    const organizations = await $api<Array<OrganizationReference>>('/api/1/organizations/suggest/', {
      query: {
        q: query,
        size: 5,
      },
    })

    if (props.organizationsOnly) {
      return organizations.map(organization => ({ organization, owner: null }))
    }

    const users = await $api<Array<UserReference>>('/api/1/users/suggest/', {
      query: {
        q: query,
        size: 5,
      },
    })
    return [...organizations.map(organization => ({ organization, owner: null })), ...users.map(user => ({ organization: null, owner: user }))]
  }
})
</script>
