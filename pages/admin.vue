<template>
  <div class="fr-grid-row bg-gray-100 flex-1">
    <div class="fr-col-12 fr-col-md-4 fr-col-lg-3 fr-col-xl-2">
      <nav
        class="fr-sidemenu !mx-0 !p-0 md:h-full"
        :aria-label="t(`Menu d'administration`)"
      >
        <ClientOnly>
          <Disclosure
            :default-open="true"
            as="div"
            class="fr-sidemenu__inner !py-2 !px-0 md:!p-0 !bg-white !shadow-[1px_0_0_0_var(--border-default-grey)] md:h-full"
          >
            <DisclosureButton
              class="fr-sidemenu__btn after:!mr-0"
              hidden
            >
              {{ t('Ouvrir le menu') }}
            </DisclosureButton>
            <DisclosurePanel>
              <AccordionGroup
                v-if="me"
                class="fr-sidemenu__list"
                as="ul"
              >
                <AdminSidebarMenu
                  v-for="user in users"
                  :key="user.id"
                  :user
                />
                <AdminSidebarMenu
                  v-for="organization in organizations"
                  :key="organization.id"
                  :organization="organization as OrganizationReference"
                />
                <AdminSidebarMenu
                  v-if="isSiteAdmin"
                />
              </AccordionGroup>
            </DisclosurePanel>
          </Disclosure>
        </ClientOnly>
      </nav>
    </div>
    <div class="fr-col-12 fr-col-md-8 fr-col-lg-9 fr-col-xl-10 md:h-full !px-4 sm:!px-10 pb-8 md:pb-16 lg:pb-64">
      <NuxtPage
        :page-key="route => route.fullPath"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import AdminSidebarMenu from '~/components/AdminSidebar/AdminSidebarMenu/AdminSidebarMenu.vue'
import type { OrganizationReference } from '@datagouv/components-next'

definePageMeta({
  layout: 'fluid',
  middleware: ['auth'],
  matomoIgnore: true,
})

const { t } = useTranslation()
const route = useRoute()
const { resolve } = useRouter()
const me = useMe()

useSeoMeta({ title: 'Admin' })

const { organizations, users } = useCurrentOwned()
const isSiteAdmin = computed(() => me.value.roles?.includes('admin') || false)

if (route.name === resolve('/admin')?.name) {
  if (me.value.organizations.length > 0) {
    await navigateTo(`/admin/organizations/${me.value.organizations[0].id}/datasets`, { replace: true })
  }
  else {
    await navigateTo('/admin/me/datasets', { replace: true })
  }
}
</script>

<style>
html, body {
  height: 100%;
}
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
