<template>
  <div class="space-y-5">
    <AdminUserProfileHeader
      :user="me"
    />

    <div
      v-if="invitations && invitations.length > 0"
      class="space-y-4"
    >
      <h2 class="text-sm font-bold uppercase">
        {{ t("{n} invitation | {n} invitation | {n} invitations", { n: invitations.length }) }}
      </h2>
      <div class="space-y-4 max-w-4xl">
        <AdminOrgInvitation
          v-for="invitation in invitations"
          :key="invitation.id"
          :invitation="invitation"
          @refresh="refreshAll"
        />
      </div>
    </div>

    <TabLinks
      :links="[
        { href: '/admin/me/profile', label: $t('Profil') },
        { href: `/admin/me/profile/activities`, label: $t('Activités') },
      ]"
    />

    <NuxtPage
      :page-key="route => route.fullPath"
      :user="me"
      @refresh="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import AdminUserProfileHeader from '~/components/User/AdminUserProfileHeader.vue'
import AdminOrgInvitation from '~/components/AdminOrgInvitation/AdminOrgInvitation.vue'
import type { OrgInvitation } from '~/types/types'

definePageMeta({
  keepScroll: true,
})

const { t } = useTranslation()
const me = useMe()

const { data: invitations, refresh: refreshInvitations } = await useAPI<Array<OrgInvitation>>(
  '/api/1/me/org_invitations/',
  { lazy: true },
)

function refresh() {
  loadMe(me)
}

async function refreshAll() {
  await Promise.all([
    refreshInvitations(),
    loadMe(me),
  ])
}
</script>
