<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Embeds Cards
      </h1>
      <p class="mt-2 text-gray-600">
        Cartes embeddables qui chargent leurs données automatiquement à partir d'un slug.
        Ces composants sont conçus pour être utilisés dans des contextes d'intégration.
      </p>
    </div>

    <DesignDocSection
      title="EmbedsDatasetCard"
      description="Carte dataset embeddable avec chargement automatique des données."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <EmbedsDatasetCard :slug="settings.datasetSlug" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="embedsDatasetCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="EmbedsDataserviceCard"
      description="Carte dataservice embeddable."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-2">
            <EmbedsDataserviceCard :slug="settings.dataserviceSlug" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="embedsDataserviceCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="EmbedsOrganizationCard"
      description="Carte organisation embeddable."
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
        <CodeExample :code="embedsOrganizationCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="EmbedsReuseCard"
      description="Carte réutilisation embeddable."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="grid gap-4 md:grid-cols-3">
            <EmbedsReuseCard :slug="settings.reuseSlug" />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="embedsReuseCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const { settings } = useDesignSettings()

const embedsDatasetCode = `
<template>
  <EmbedsDatasetCard slug="mon-dataset" />
</template>

<script setup>
// Ce composant est auto-importé (global)
<\/script>
`

const embedsDataserviceCode = `
<template>
  <EmbedsDataserviceCard slug="mon-api" />
</template>
`

const embedsOrganizationCode = `
<template>
  <EmbedsOrganizationCard slug="mon-organisation" />
</template>
`

const embedsReuseCode = `
<template>
  <EmbedsReuseCard slug="ma-reutilisation" />
</template>
`
</script>
