<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Sidemenu
      </h1>
      <p class="mt-2 text-gray-600">
        Menu latéral pour la navigation.
      </p>
    </div>

    <DesignDocSection
      title="Sidemenu"
      description="Menu latéral collapsible avec support DSFR."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="sidemenuProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="max-w-xs">
            <Sidemenu
              button-text="Menu"
              :fixed="false"
            >
              <template #title>
                Navigation
              </template>
              <ul class="fr-sidemenu__list">
                <li>
                  <NuxtLink
                    to="/design"
                    class="fr-sidemenu__link"
                  >
                    Accueil
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/design/ui/buttons"
                    class="fr-sidemenu__link"
                  >
                    Boutons
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="/design/cards/datasets"
                    class="fr-sidemenu__link"
                  >
                    Cards
                  </NuxtLink>
                </li>
              </ul>
            </Sidemenu>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="sidemenuCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="AdminSidebarLink"
      description="Lien pour la sidebar d'administration avec icône."
      :in-lib="false"
    >
      <template #props>
        <PropsTable :props="adminSidebarLinkProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="max-w-xs space-y-1">
            <AdminSidebarLink
              :icon="RiDashboardLine"
              label="Dashboard"
              to="/design"
            />
            <AdminSidebarLink
              :icon="RiDatabase2Line"
              label="Jeux de données"
              to="/design/cards/datasets"
            />
            <AdminSidebarLink
              :icon="RiSettings3Line"
              label="Paramètres"
              to="/design/settings"
            />
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="adminSidebarLinkCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { RiDashboardLine, RiDatabase2Line, RiSettings3Line } from '@remixicon/vue'
import AdminSidebarLink from '~/components/AdminSidebar/AdminSidebarLink/AdminSidebarLink.vue'
import Sidemenu from '~/components/Sidemenu/Sidemenu.global.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const sidemenuProps: PropDefinition[] = [
  { name: 'buttonText', type: 'string', required: true, description: 'Texte du bouton mobile' },
  { name: 'fixed', type: 'boolean', default: 'false', description: 'Position sticky' },
  { name: 'showBorder', type: 'boolean', default: 'true', description: 'Afficher la bordure' },
  { name: 'onRight', type: 'boolean', default: 'false', description: 'Position à droite' },
]

const adminSidebarLinkProps: PropDefinition[] = [
  { name: 'icon', type: 'Component', required: true, description: 'Icône à afficher' },
  { name: 'label', type: 'string', required: true, description: 'Texte du lien' },
  { name: 'to', type: 'string', required: true, description: 'URL de destination' },
]

const sidemenuCode = `
<template>
  <Sidemenu button-text="Menu">
    <template #title>Navigation</template>
    <ul class="fr-sidemenu__list">
      <li>
        <NuxtLink to="/" class="fr-sidemenu__link">Accueil</NuxtLink>
      </li>
    </ul>
  </Sidemenu>
</template>

<script setup>
import Sidemenu from '~/components/Sidemenu/Sidemenu.global.vue'
<\/script>
`

const adminSidebarLinkCode = `
<template>
  <AdminSidebarLink
    :icon="RiDashboardLine"
    label="Dashboard"
    to="/admin"
  />
</template>

<script setup>
import AdminSidebarLink from '~/components/AdminSidebar/AdminSidebarLink/AdminSidebarLink.vue'
import { RiDashboardLine } from '@remixicon/vue'
<\/script>
`
</script>
