<template>
  <div class="flex flex-col md:flex-row">
    <Sidemenu
      class="mx-2 md:w-4/12 lg:w-3/12 shrink-0"
      :button-text="$t('Menu')"
      :fixed="true"
    >
      <template #title>
        <span
          class="fr-icon--sm fr-icon-question-line"
          aria-hidden="true"
        />
        {{ $t('Menu') }}
      </template>
      <ul class="fr-sidemenu__list mx-2 my-3">
        <AdminSidebarLink
          :icon="RiListView"
          :label="$t('Composants')"
          to="/design"
        />
        <AdminSidebarLink
          :icon="LogoOnly"
          :label="$t('Logos')"
          to="/design/logos"
        />
        <AdminSidebarLink
          :icon="RiRadioButtonLine"
          :label="$t('Boutons')"
          to="/design/buttons"
        />
        <AdminSidebarLink
          :icon="RiIdCardLine"
          :label="$t('Cartes')"
          to="/design/cards"
        />
        <AdminSidebarLink
          :icon="RiFileSearchLine"
          :label="$t('Recherche de jeux de données')"
          to="/design/dataset-search"
        />
        <AdminSidebarLink
          :icon="RiSearch2Line"
          :label="$t('Recherche d\'APIs')"
          to="/design/dataservice-search"
        />
        <AdminSidebarLink
          :icon="RiSearchEyeLine"
          :label="$t('Recherche de réutilisations')"
          to="/design/reuse-search"
        />
        <AdminSidebarLink
          :icon="RiUserSearchLine"
          :label="$t('Recherche d\'organisations')"
          to="/design/organization-search"
        />
        <AdminSidebarLink
          :icon="RiEyeLine"
          :label="$t('Previews')"
          to="/design/previews"
        />
        <AdminSidebarLink
          :icon="RiExternalLinkLine"
          :label="$t('Oembeds')"
          to="/design/oembeds"
        />
        <AdminSidebarLink
          :icon="RiTranslate"
          :label="$t('Traductions')"
          to="/design/translations"
        />
      </ul>
    </Sidemenu>
    <div class="w-full md:flex-1 space-y-8 px-4 md:px-8 bg-gray-50 pb-32 min-w-0">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiEyeLine, RiExternalLinkLine, RiFileSearchLine, RiIdCardLine, RiListView, RiRadioButtonLine, RiSearch2Line, RiSearchEyeLine, RiTranslate, RiUserSearchLine } from '@remixicon/vue'
import AdminSidebarLink from '~/components/AdminSidebar/AdminSidebarLink/AdminSidebarLink.vue'
import LogoOnly from '~/components/LogoOnly.vue'
import Sidemenu from '~/components/Sidemenu/Sidemenu.global.vue'

definePageMeta({
  layout: 'fluid',
})
</script>
