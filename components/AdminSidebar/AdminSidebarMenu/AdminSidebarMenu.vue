<template>
  <Disclosure>
    <li
      class="fr-sidemenu__item"
      :class="{ 'fr-sidemenu__item--active': isOpen(id) }"
    >
      <DisclosureButton
        class="fr-sidemenu__btn"
        :aria-current="isOpen(id)"
        :aria-expanded="isOpen(id)"
        @click="toggle(id)"
      >
        <template v-if="user">
          <Avatar
            v-if="user"
            :user="user"
            :size="24"
            :rounded="true"
          />
          <p class="mx-2">
            <span v-if="me.id === user.id">{{ $t('My Profil') }}</span>
            <span v-else>{{ user.first_name }} {{ user.last_name }}</span>
          </p>
        </template>
        <template v-else-if="organization">
          <div class="logo logo--sm">
            <Placeholder
              type="organization"
              :src="organization.logo_thumbnail"
              :size="20"
            />
          </div>
          <p class="mx-2 fr-col text-ellipsis whitespace-nowrap overflow-hidden">
            {{ organization.name }}
          </p>
        </template>
        <template v-else>
          <RiPlanetLine class="size-6" />
          <p class="mx-2 fr-col text-ellipsis whitespace-nowrap overflow-hidden">
            {{ $t('Site') }}
          </p>
        </template>
      </DisclosureButton>
      <DisclosurePanel
        v-show="isOpen(id)"
        static
      >
        <ul class="fr-sidemenu__list !mx-2 !my-3">
          <template v-if="user">
            <AdminSidebarLink
              :icon="RiDatabase2Line"
              :label="$t('Datasets')"
              :to="me.id === user.id ? `/admin/me/datasets` : `/admin/users/${user.id}/datasets`"
            />
            <AdminSidebarLink
              :icon="RiRobot2Line"
              :label="$t('Dataservices')"
              :to="me.id === user.id ? `/admin/me/dataservices` : `/admin/users/${user.id}/dataservices`"
            />
            <AdminSidebarLink
              :icon="RiLineChartLine"
              :label="$t('Reuses')"
              :to="me.id === user.id ? `/admin/me/reuses` : `/admin/users/${user.id}/reuses`"
            />
            <AdminSidebarLink
              :icon="RiGitPullRequestLine"
              :label="$t('Community Resources')"
              :to="me.id === user.id ? `/admin/me/community-resources` : `/admin/users/${user.id}/community-resources`"
            />
            <AdminSidebarLink
              :icon="RiUserLine"
              :label="$t('Profile')"
              :to="me.id === user.id ? `/admin/me/profile` : `/admin/users/${user.id}/profile`"
            />
          </template>
          <template v-else-if="organization">
            <AdminSidebarLink
              :icon="RiDatabase2Line"
              :label="$t('Datasets')"
              :to="`/admin/organizations/${organization.id}/datasets`"
              @click="$emit('click')"
            />
            <AdminSidebarLink
              :icon="RiRobot2Line"
              :label="$t('Dataservices')"
              :to="`/admin/organizations/${organization.id}/dataservices`"
              @click="$emit('click')"
            />
            <AdminSidebarLink
              :icon="RiLineChartLine"
              :label="$t('Reuses')"
              :to="`/admin/organizations/${organization.id}/reuses`"
              @click="$emit('click')"
            />
            <AdminSidebarLink
              :icon="RiChat3Line"
              :label="$t('Discussions')"
              :to="`/admin/organizations/${organization.id}/discussions`"
              @click="$emit('click')"
            />
            <AdminSidebarLink
              :icon="RiParentLine"
              :label="$t('Members')"
              :to="`/admin/organizations/${organization.id}/members`"
              @click="$emit('click')"
            />
            <AdminSidebarLink
              :icon="RiServerLine"
              :label="$t('Harvesters')"
              :to="`/admin/organizations/${organization.id}/harvesters`"
              @click="$emit('click')"
            />
            <AdminSidebarLink
              :icon="RiGitPullRequestLine"
              :label="$t('Community Resources')"
              :to="`/admin/organizations/${organization.id}/community-resources`"
              @click="$emit('click')"
            />
            <AdminSidebarLink
              :icon="RiUserLine"
              :label="$t('Profile')"
              :to="`/admin/organizations/${organization.id}/profile`"
              @click="$emit('click')"
            />
          </template>
          <template v-else>
            <AdminSidebarLink
              :icon="RiDatabase2Line"
              :label="$t('Datasets')"
              to="/admin/site/datasets"
            />
            <AdminSidebarLink
              :icon="RiRobot2Line"
              :label="$t('Dataservices')"
              to="/admin/site/dataservices"
            />
            <AdminSidebarLink
              :icon="RiLineChartLine"
              :label="$t('Reuses')"
              to="/admin/site/reuses"
            />
            <AdminSidebarLink
              :icon="RiBuilding2Line"
              :label="$t('Organizations')"
              to="/admin/site/organizations"
            />
            <AdminSidebarLink
              :icon="RiGroup3Line"
              :label="$t('Users')"
              to="/admin/site/users"
            />
            <AdminSidebarLink
              :icon="RiServerLine"
              :label="$t('Harvesters')"
              to="/admin/site/harvesters"
            />
            <AdminSidebarLink
              :icon="RiGitPullRequestLine"
              :label="$t('Community Resources')"
              to="/admin/site/community-resources"
            />
            <AdminSidebarLink
              :icon="RiBookShelfLine"
              :label="$t('Topics')"
              to="/admin/site/topics"
            />
            <AdminSidebarLink
              :icon="RiArticleLine"
              :label="$t('Posts')"
              to="/admin/site/posts"
            />
          </template>
        </ul>
      </DisclosurePanel>
    </li>
  </Disclosure>
</template>

<script setup lang="ts">
import { Avatar } from '@datagouv/components-next'
import type { Organization, User } from '@datagouv/components-next'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RiArticleLine, RiBookShelfLine, RiBuilding2Line, RiChat3Line, RiDatabase2Line, RiGitPullRequestLine, RiGroup3Line, RiLineChartLine, RiParentLine, RiPlanetLine, RiRobot2Line, RiServerLine, RiUserLine } from '@remixicon/vue'
import { key, type AccordionRegister } from '~/components/Accordion/injectionKey'
import AdminSidebarLink from '~/components/AdminSidebar/AdminSidebarLink/AdminSidebarLink.vue'

const props = defineProps<{
  /**
   * The logged in user, to show a menu with an avatar and "My Profil"
   */
  user?: User
  /**
   * An organization, to show a menu with its logo and name
   */
  organization?: Organization
}>()

defineEmits<{
  click: []
}>()

const me = useMe()

const id = useId()
const { isOpen, open, toggle, unregister } = inject(key) as AccordionRegister
const { currentUser, currentOrganization } = useCurrentOwned()
const route = useRoute()

watchEffect(() => {
  if (currentUser.value && props.user && currentUser.value.id === props.user.id) {
    open(id)
  }

  if (currentOrganization.value && props.organization && currentOrganization.value.id === props.organization.id) {
    open(id)
  }

  if (!props.organization && !props.user && route.name && route.name.toString().startsWith('admin-site')) {
    open(id)
  }
})

onUnmounted(() => unregister(id))
</script>

<style scoped>
.fr-sidemenu__btn {
  background-color: var(--background-alt-grey);
  border-bottom: 1px solid var(--border-default-grey);
  color: var(--text-default-grey);
}

.fr-sidemenu__btn:hover {
  background-color: var(--background-alt-grey-hover);
}

.fr-sidemenu__btn:active {
  background-color: var(--background-alt-grey-active);
}

.fr-sidemenu__btn[aria-current]:not([aria-current=false]) {
  background-color: var(--background-default-grey);
  color: var(--text-default-grey);
}

.fr-sidemenu__btn[aria-current]:not([aria-current=false])::before {
  width: 0;
}

.fr-sidemenu__btn[aria-current]:not([aria-current=false]):hover {
  background-color: var(--hover-tint);
}

.fr-sidemenu__btn[aria-current]:not([aria-current=false]):active {
  background-color: var(--active-tint);
}

.fr-sidemenu .fr-collapse {
  padding-left: 0;
  padding-right: 0;
  margin-left: 0;
  margin-right: 0;
}

.fr-sidemenu .fr-collapse.fr-collapse--expanded {
  border-bottom: 1px solid var(--border-default-grey);
}
</style>
