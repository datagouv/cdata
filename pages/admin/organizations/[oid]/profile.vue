<template>
  <div class="fr-container--fluid">
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Profil') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="text-2xl font-extrabold text-gray-title mb-5">
      {{ t("Profil") }}
    </h1>
    <PaddedContainer
      v-if="organization"
      class="mb-5"
    >
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--middle justify-between">
        <div class="fr-col-12 fr-col-md fr-grid-row fr-grid-row--middle">
          <OrganizationLogo
            :organization
            size-class="size-20"
          />
          <div class="fr-col fr-ml-3v fr-my-0 text-2xl font-bold">
            {{ organization.name }}
            <span
              v-if="isOrganizationCertified(organization)"
              class="fr-icon-success-line fr-icon--lg text-datagouv"
              :title="t(`L'identité de ce service public est certifiée par {certifier}`, { certifier: $config.public.title })"
              aria-hidden="true"
            />
            <span
              v-if="organization.deleted"
              class="h-10 inline-block ml-1"
            >
              <AdminBadge
                class="align-[0.25rem]"
                type="danger"
                size="sm"
              >
                {{ $t('supprimée') }}
              </AdminBadge>
            </span>
          </div>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            :href="organization.page"
            new-tab
            color="secondary"
            :icon="RiEyeLine"
            size="xs"
          >
            {{ t(`Voir la page de l'organisation`) }}
          </BrandedButton>
        </div>
      </div>
    </PaddedContainer>

    <TabLinks
      class="mb-5"
      :links="[
        { href: organizationUrl, label: t('Profil') },
        { href: `${organizationUrl}/contacts/`, label: t('Points de contact') },
        { href: `${organizationUrl}/activities/`, label: t('Activités') },
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
import { BrandedButton, isOrganizationCertified, OrganizationLogo, PaddedContainer, type Organization } from '@datagouv/components-next'
import { RiEyeLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const props = defineProps<{
  organization: Organization
}>()
defineEmits<{
  refresh: []
}>()

const { t } = useTranslation()

const organizationUrl = computed(() => `/admin/organizations/${props.organization?.id}/profile`)
</script>
