<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ $t('Profil') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ $t("Profil") }}
    </h1>
    <PaddedContainer class="!p-5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-none">
          <Avatar
            :user="user"
            :rounded="true"
            :size="80"
          />
        </div>
        <div class="w-full flex-none md:flex-1">
          <h2 class="!mb-0 text-2xl font-bold">
            {{ user.first_name }} {{ user.last_name }}
          </h2>
          <AdminEmail :user />
        </div>
        <div class="flex-none">
          <BrandedButton
            size="xs"
            color="secondary"
            as="a"
            :href="user.page"
            :icon="RiEyeLine"
          >
            {{ $t('Voir le profil public') }}
          </BrandedButton>
        </div>
      </div>
    </PaddedContainer>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, type User } from '@datagouv/components-next'
import { RiEyeLine } from '@remixicon/vue'
import AdminBreadcrumb from '../Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '../Breadcrumbs/BreadcrumbItem.vue'
import PaddedContainer from '../PaddedContainer/PaddedContainer.vue'
import AdminEmail from '../AdminEmail.vue'

defineProps<{
  user: User
}>()
</script>
