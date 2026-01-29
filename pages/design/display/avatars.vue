<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Avatars
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les avatars d'utilisateurs et les logos d'organisations.
      </p>
    </div>

    <DesignDocSection
      title="Avatar"
      description="Avatar d'utilisateur avec image ou initiales."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="avatarProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="flex items-center gap-4">
            <Avatar
              :user="mockUser"
              class="size-8"
            />
            <Avatar
              :user="mockUser"
              class="size-10"
            />
            <Avatar
              :user="mockUser"
              class="size-12"
            />
            <Avatar
              :user="mockUserNoAvatar"
              class="size-12"
            />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="avatarCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="OrganizationLogo"
      description="Logo d'une organisation avec fallback."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="organizationStatus"
            :data="organization"
          >
            <template #default="{ data }">
              <div class="flex items-center gap-4">
                <OrganizationLogo
                  :organization="data"
                  size-class="size-8"
                />
                <OrganizationLogo
                  :organization="data"
                  size-class="size-12"
                />
                <OrganizationLogo
                  :organization="data"
                  size-class="size-16"
                />
              </div>
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="organizationLogoCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="OrganizationNameWithCertificate"
      description="Nom de l'organisation avec badge de certification si applicable."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="organizationNameProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="organizationStatus"
            :data="organization"
          >
            <template #default="{ data }">
              <div class="space-y-2">
                <OrganizationNameWithCertificate
                  :organization="data"
                  size="xs"
                />
                <OrganizationNameWithCertificate
                  :organization="data"
                  size="sm"
                />
                <OrganizationNameWithCertificate
                  :organization="data"
                  size="base"
                />
              </div>
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="organizationNameCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape, @typescript-eslint/no-explicit-any */
import { Avatar, LoadingBlock, OrganizationLogo, OrganizationNameWithCertificate } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { organization, organizationStatus } = useDesignData()

const mockUser = {
  id: '1',
  first_name: 'Jean',
  last_name: 'Dupont',
  avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
} as any

const mockUserNoAvatar = {
  id: '2',
  first_name: 'Marie',
  last_name: 'Martin',
  avatar: null,
} as any

const avatarProps: PropDefinition[] = [
  { name: 'user', type: 'User | UserReference', required: true, description: 'Utilisateur dont afficher l\'avatar' },
]

const organizationNameProps: PropDefinition[] = [
  { name: 'organization', type: 'Organization | OrganizationReference', required: true, description: 'Organisation à afficher' },
  { name: 'size', type: 'string', default: '\'sm\'', description: 'Taille du texte', options: ['xs', 'sm', 'base'] },
  { name: 'showType', type: 'boolean', default: 'true', description: 'Affiche l\'icône de type' },
  { name: 'showAcronym', type: 'boolean', default: 'true', description: 'Affiche l\'acronyme' },
]

const avatarCode = `
<template>
  <Avatar :user="user" class="size-12" />
</template>

<script setup>
import { Avatar } from '@datagouv/components-next'
<\/script>
`

const organizationLogoCode = `
<template>
  <OrganizationLogo :organization="organization" size-class="size-12" />
</template>

<script setup>
import { OrganizationLogo } from '@datagouv/components-next'
<\/script>
`

const organizationNameCode = `
<template>
  <OrganizationNameWithCertificate :organization="organization" />
</template>

<script setup>
import { OrganizationNameWithCertificate } from '@datagouv/components-next'
<\/script>
`
</script>
