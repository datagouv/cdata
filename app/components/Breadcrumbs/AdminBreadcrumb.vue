<template>
  <Breadcrumb>
    <BreadcrumbItem to="/admin">
      {{ $t('Administration') }}
    </BreadcrumbItem>
    <BreadcrumbItem
      v-if="currentOrganization"
      :to="`/admin/organizations/${currentOrganization.id}/profile`"
    >
      {{ currentOrganization.name }}
    </BreadcrumbItem>
    <BreadcrumbItem
      v-if="currentUser"
      :to="currentUser.id === me.id ? `/admin/me/profile` : `/admin/users/${currentUser.id}/profile`"
    >
      {{ currentUser.first_name }} {{ currentUser.last_name }}
    </BreadcrumbItem>
    <slot />
  </Breadcrumb>
</template>

<script setup lang="ts">
import Breadcrumb from '../Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from './BreadcrumbItem.vue'

const { currentOrganization, currentUser } = useCurrentOwned()
const me = useMe()
</script>
