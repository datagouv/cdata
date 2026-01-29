<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Tabs
      </h1>
      <p class="mt-2 text-gray-600">
        Composants de navigation par onglets.
      </p>
    </div>

    <DesignDocSection
      title="TabGroup / Tab"
      description="Système d'onglets complet avec Tab, TabList, TabPanels."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview>
          <TabGroup>
            <TabList>
              <Tab>Informations</Tab>
              <Tab>Ressources</Tab>
              <Tab>Discussions</Tab>
            </TabList>
            <TabPanels class="mt-4">
              <TabPanel>
                <p class="text-gray-600">
                  Contenu du premier onglet avec les informations générales.
                </p>
              </TabPanel>
              <TabPanel>
                <p class="text-gray-600">
                  Liste des ressources disponibles.
                </p>
              </TabPanel>
              <TabPanel>
                <p class="text-gray-600">
                  Discussions et commentaires.
                </p>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="tabGroupCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="TabLinks"
      description="Navigation par onglets avec liens (pour routing)."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="tabLinksProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <TabLinks :links="sampleLinks" />
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="tabLinksCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@datagouv/components-next'
import TabLinks from '~/components/TabLinks.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const sampleLinks = [
  { label: 'Vue d\'ensemble', href: '/design' },
  { label: 'Composants', href: '/design/ui/buttons' },
  { label: 'Cards', href: '/design/cards/datasets' },
]

const tabLinksProps: PropDefinition[] = [
  { name: 'links', type: 'Array<{ label: string, href: string }>', required: true, description: 'Liste des liens avec labels et URLs' },
]

const tabGroupCode = `
<template>
  <TabGroup>
    <TabList>
      <Tab>Premier onglet</Tab>
      <Tab>Deuxième onglet</Tab>
    </TabList>
    <TabPanels>
      <TabPanel>Contenu 1</TabPanel>
      <TabPanel>Contenu 2</TabPanel>
    </TabPanels>
  </TabGroup>
</template>

<script setup>
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@datagouv/components-next'
<\/script>
`

const tabLinksCode = `
<template>
  <TabLinks :tabs="[
    { label: 'Accueil', to: '/' },
    { label: 'Datasets', to: '/datasets' },
  ]" />
</template>

<script setup>
import TabLinks from '~/components/TabLinks.vue'
<\/script>
`
</script>
