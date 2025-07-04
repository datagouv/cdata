<template>
  <DevOnly>
    <div class="flex">
      <Sidemenu
        class="w-4/12 mx-2"
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
            :label="$t('Components')"
            to="/design/"
          />
          <AdminSidebarLink
            :icon="RiRadioButtonLine"
            :label="$t('Buttons')"
            to="/design/buttons/"
          />
          <AdminSidebarLink
            :icon="RiIdCardLine"
            :label="$t('Cards')"
            to="/design/cards/"
          />
          <AdminSidebarLink
            :icon="RiFileSearchLine"
            :label="$t('Dataset Search')"
            to="/design/dataset-search/"
          />
          <AdminSidebarLink
            :icon="RiSearch2Line"
            :label="$t('Dataservice Search')"
            to="/design/dataservice-search/"
          />
          <AdminSidebarLink
            :icon="RiSearchEyeLine"
            :label="$t('Reuse Search')"
            to="/design/reuse-search/"
          />
          <AdminSidebarLink
            :icon="RiUserSearchLine"
            :label="$t('Organization Search')"
            to="/design/organization-search/"
          />
          <AdminSidebarLink
            :icon="RiExternalLinkLine"
            :label="$t('Oembeds')"
            to="/design/oembeds/"
          />
        </ul>
      </Sidemenu>
      <div class="w-8/12 space-y-8 px-8 bg-gray-50 pb-32">
        <NuxtPage />
      </div>
    </div>
  </DevOnly>
</template>

<script setup lang="ts">
import { RiExternalLinkLine, RiFileSearchLine, RiIdCardLine, RiListView, RiRadioButtonLine, RiSearch2Line, RiSearchEyeLine, RiSearchLine, RiUserSearchLine } from '@remixicon/vue'
import AdminSidebarLink from '~/components/AdminSidebar/AdminSidebarLink/AdminSidebarLink.vue'
import Sidemenu from '~/components/Sidemenu/Sidemenu.global.vue'

definePageMeta({
  layout: 'fluid',
})
</script>
