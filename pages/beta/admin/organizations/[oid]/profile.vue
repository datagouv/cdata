<template>
  <div class="fr-container--fluid">
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Profile') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="fr-h3 fr-mb-5v">
      {{ t("Profile") }}
    </h1>
    <PaddedContainer
      v-if="organization"
      class="fr-mb-5v"
    >
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between">
        <div class="fr-col-12 fr-col-md fr-grid-row fr-grid-row--middle">
          <Placeholder
            :src="organization.logo"
            type="organization"
            :size="80"
            class="rounded border"
          />
          <div class="fr-col fr-ml-3v fr-my-0 fr-h3">
            {{ organization.name }}
            <span
              v-if="isOrganizationCertified(organization)"
              class="fr-icon-success-line fr-icon--lg text-datagouv"
              :title="t('The identity of this public service is certified by {certifier}', { certifier: $config.public.title })"
              aria-hidden="true"
            />
          </div>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            :href="organization.page"
            color="secondary"
            :icon="RiEyeLine"
            size="xs"
          >
            {{ t('See the organization page') }}
          </BrandedButton>
        </div>
      </div>
    </PaddedContainer>

    <TabLinks
      class="mb-5"
      :links="[
        { href: localPath(organizationUrl), label: t('Profile') },
        { href: localPath(`${organizationUrl}/contacts/`), label: t('Contact points') },
      ]"
    />

    <NuxtPage
      :page-key="route => route.fullPath"
      :organization
      @refresh="$emit('refresh')"
    />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, isOrganizationCertified, type Organization } from '@datagouv/components-next'
import { RiEyeLine } from '@remixicon/vue'
import { useI18n } from 'vue-i18n'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import PaddedContainer from '~/components/PaddedContainer/PaddedContainer.vue'

const props = defineProps<{
  organization: Organization
}>()
defineEmits<{
  refresh: []
}>()

const localPath = useLocalePath()
const { t } = useI18n()

const organizationUrl = computed(() => `/beta/admin/organizations/${props.organization?.id}/profile`)
</script>
