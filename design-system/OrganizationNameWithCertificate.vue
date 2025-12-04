<template>
  <div class="grid grid-cols-2 gap-4">
    <OrganizationNameWithCertificate
      :show-type="false"
      :organization="certifiedOrganization"
    />
    <OrganizationNameWithCertificate
      :organization="certifiedOrganization"
    />
    <OrganizationNameWithCertificate
      :show-type="false"
      :organization="nonCertifiedOrganization"
    />
    <OrganizationNameWithCertificate
      :organization="nonCertifiedOrganization"
    />
  </div>
</template>

<script setup lang="ts">
import { COMPANY, type Organization } from '@datagouv/components-next'
import { OrganizationNameWithCertificate } from '@datagouv/components-next'

const certifiedOrganization: Organization = {
  id: '646b7187b50b2a93b1ae3d45',
  name: 'data.gouv.fr',
  acronym: null,
  url: 'https://www.data.gouv.fr/',
  slug: 'data-gouv-fr',
  description: 'data.gouv.fr est la plateforme ouverte et communautaire qui vise à centraliser et structurer les données ouvertes en France (notamment les données publiques). Elle permet le dépôt et le référencement de données issues de ministères comme de collectivités locales. Le catalogue contient également des références vers d\'autres catalogues d\'administration ayant leur propre portail.\n\nL\'équipe data.gouv.fr propose de publier certains jeux de données en son nom lorsque ceux-ci proviennent de différentes sources distinctes et qu\'ils ont un intérêt en interministériel. ',
  business_number_id: '13002526500013',
  created_at: '2023-05-22T13:43:35.978000+00:00',
  last_modified: '2025-01-31T15:06:04.446000+00:00',
  deleted: null,
  metrics: {
    datasets: 26,
    datasets_by_months: {},
    members: 12,
    reuses: 5,
    reuses_by_months: {},
    dataservices: 3,
    dataservices_by_months: {},
    followers: 5,
    views: 659241,
  },
  uri: 'https://dev.data.gouv.fr/api/1/organizations/data-gouv-fr/',
  page: 'https://dev.data.gouv.fr/fr/organizations/data-gouv-fr/',
  logo: 'https://dev-static.data.gouv.fr/avatars/ed/d22cd9c58f4f398b1a3b7186cb2b7f-original.png',
  logo_thumbnail: 'https://dev-static.data.gouv.fr/avatars/ed/d22cd9c58f4f398b1a3b7186cb2b7f-100.png',
  members: [],
  badges: [
    {
      kind: 'public-service',
    },
    {
      kind: 'certified',
    },
  ],
  extras: {
    'siretisation:found_siret': '13002526500013',
    'siretisation:denomination_unite_legale': 'DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)',
    'siretisation:est_service_public': 'True',
    'siretisation:est_collectivite_territoriale': 'False',
    'siretisation:collectivite_territoriale:code_insee': 'nan',
    'siretisation:collectivite_territoriale:niveau': 'nan',
  },
}
const nonCertifiedOrganization: Organization = {
  id: '646b7187b50b2a93b1ae3d45',
  name: 'Not data.gouv.fr',
  acronym: null,
  url: 'https://www.data.gouv.fr/',
  slug: 'data-gouv-fr',
  description: 'data.gouv.fr est la plateforme ouverte et communautaire qui vise à centraliser et structurer les données ouvertes en France (notamment les données publiques). Elle permet le dépôt et le référencement de données issues de ministères comme de collectivités locales. Le catalogue contient également des références vers d\'autres catalogues d\'administration ayant leur propre portail.\n\nL\'équipe data.gouv.fr propose de publier certains jeux de données en son nom lorsque ceux-ci proviennent de différentes sources distinctes et qu\'ils ont un intérêt en interministériel. ',
  business_number_id: '13002526500013',
  created_at: '2023-05-22T13:43:35.978000+00:00',
  last_modified: '2025-01-31T15:06:04.446000+00:00',
  deleted: null,
  metrics: {
    datasets: 26,
    datasets_by_months: {},
    members: 12,
    reuses: 5,
    reuses_by_months: {},
    dataservices: 3,
    dataservices_by_months: {},
    followers: 5,
    views: 659241,
  },
  uri: 'https://dev.data.gouv.fr/api/1/organizations/data-gouv-fr/',
  page: 'https://dev.data.gouv.fr/fr/organizations/data-gouv-fr/',
  logo: 'https://dev-static.data.gouv.fr/avatars/ed/d22cd9c58f4f398b1a3b7186cb2b7f-original.png',
  logo_thumbnail: 'https://dev-static.data.gouv.fr/avatars/ed/d22cd9c58f4f398b1a3b7186cb2b7f-100.png',
  members: [],
  badges: [
    {
      kind: COMPANY,
    },
  ],
  extras: {
    'siretisation:found_siret': '13002526500013',
    'siretisation:denomination_unite_legale': 'DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)',
    'siretisation:est_service_public': 'True',
    'siretisation:est_collectivite_territoriale': 'False',
    'siretisation:collectivite_territoriale:code_insee': 'nan',
    'siretisation:collectivite_territoriale:niveau': 'nan',
  },
}
</script>
