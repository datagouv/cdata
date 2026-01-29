<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Organization Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Composants pour afficher les organisations.
      </p>
    </div>

    <DesignDocSection
      title="OrganizationCard"
      description="Carte pour afficher une organisation avec son logo et ses informations."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="organizationCardProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="organizationStatus"
            :data="organization"
          >
            <template #default="{ data }">
              <div class="max-w-sm">
                <OrganizationCard :organization="data" />
              </div>
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="organizationCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="EmbedsOrganizationCard"
      description="Version embeddable de la carte organisation, charge les données à partir du slug."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-3">
            <EmbedsOrganizationCard :slug="settings.organizationSlug" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="embedsOrganizationCardCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="OrganizationNameWithCertificate"
      description="Affiche le nom d'une organisation avec son badge de certification si applicable."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <LoadingBlock
            :status="organizationStatus"
            :data="organization"
          >
            <template #default="{ data }">
              <OrganizationNameWithCertificate :organization="data" />
            </template>
          </LoadingBlock>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="organizationNameCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="OrganizationLogo"
      description="Affiche le logo d'une organisation avec fallback."
      :in-lib="true"
    >
      <template #code>
        <CodeExample :code="organizationLogoCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { LoadingBlock, OrganizationCard, OrganizationNameWithCertificate } from '@datagouv/components-next'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const { settings } = useDesignSettings()
const { organization, organizationStatus } = useDesignData()

const organizationCardProps: PropDefinition[] = [
  { name: 'organization', type: 'Organization', required: true, description: 'Objet organisation à afficher' },
]

const organizationCardCode = `
<template>
  <OrganizationCard :organization="organization" />
</template>

<script setup>
import { OrganizationCard } from '@datagouv/components-next'

const { data: organization } = await useAPI('/api/1/organizations/xxx/')
<\/script>
`

const embedsOrganizationCardCode = `
<template>
  <EmbedsOrganizationCard slug="mon-organisation" />
</template>

<script setup>
import EmbedsOrganizationCard from '~/components/Embeds/OrganizationCard.global.vue'
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

const organizationLogoCode = `
<template>
  <OrganizationLogo :organization="organization" class="size-12" />
</template>

<script setup>
import { OrganizationLogo } from '@datagouv/components-next'
<\/script>
`
</script>
