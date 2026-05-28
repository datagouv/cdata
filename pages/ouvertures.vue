<template>
  <div>
    <OnboardingHero color="primary">
      <template #title>
        {{ $t('Suivre les publications de données et les engagements ministériels') }}
      </template>
      <template #subtitle>
        {{ $t('Les administrations produisent un large ensemble de données — données ouvertes ou à accès restreint, API, algorithmes et codes sources publics — dont l\'ouverture ou l\'amélioration de l\'accès constitue un enjeu majeur pour la transparence et la réutilisation.') }}
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <div class="max-w-4xl">
        <OnboardingParagraph class="mb-4">
          {{ $t('Conformément à leurs obligations légales, les administrations publient et mettent à disposition une partie de ces données, mais d\'autres acteurs (organismes privés ou citoyens) peuvent également contribuer en produisant des données réutilisables.') }}
        </OnboardingParagraph>
        <OnboardingParagraph class="mb-4">
          {{ $t('L\'équipe de {site} accompagne activement les producteurs de données pour identifier, prioriser et suivre l\'évolution de la mise à disposition de ces données. Pour accompagner cette démarche, nous avons conçu un tableau qui vous permet de suivre de façon transparente le statut des données dont nous travaillons à l\'ouverture, à leur publication et à leur mise à jour.', { site: config.public.title }) }}
        </OnboardingParagraph>
        <OnboardingParagraph class="mb-4">
          {{ $t('Ce document n\'est pas exhaustif, ne reflète pas l\'ensemble des actions menées par les acteurs publics. Les sujets répertoriés sont issus de la sélection de l\'équipe de {site}, basée notamment sur :', { site: config.public.title }) }}
        </OnboardingParagraph>
        <ul class="list-disc pl-5 space-y-2 mb-4 text-2xl font-light leading-normal text-black">
          <li>
            {{ $t('les demandes exprimées sur le') }}
            <CdataLink
              :href="config.public.forumUrl"
              external
              class="text-black underline"
            >
              forum.data.gouv.fr
            </CdataLink>
            {{ $t('ou notre') }}
            <CdataLink
              :href="config.public.supportUrl"
              external
              class="text-black underline"
            >
              {{ $t('formulaire de contact') }}
            </CdataLink>
            ;
          </li>
          <li>{{ $t('la recherche active de l\'équipe, en fonction des actualités et besoins identifiés ;') }}</li>
          <li>{{ $t('les feuilles de routes des ministères.') }}</li>
        </ul>
        <OnboardingParagraph class="mb-4">
          {{ $t('Vous pouvez formuler des demandes de publication pour des données encore non identifiées par notre équipe via le') }}
          <CdataLink
            :href="config.public.forumUrl"
            external
            class="text-black underline"
          >
            forum.data.gouv.fr
          </CdataLink>
          {{ $t('. Merci pour vos contributions !') }}
        </OnboardingParagraph>
        <OnboardingParagraph>
          {{ $t('Les données affichées ci-dessous sont également disponibles en open data sous forme de jeu de données :') }}
          <CdataLink
            :to="config.public.ouverturesDatasetUrl"
            external
            class="text-black underline"
          >
            {{ $t('Tableau de suivi des ouvertures de données, codes sources et API publics') }}
          </CdataLink>.
        </OnboardingParagraph>
      </div>
    </OnboardingSection>

    <OnboardingSection background="gray">
      <GristTableViewer
        :data="enrichedRecords"
        :filters="filters"
        :sort-fn="sortByTitle"
        :loading="loading"
        table-min-width="1400px"
      >
        <template #thead>
          <th scope="col">
            {{ $t('Titre') }}
          </th>
          <th scope="col">
            {{ $t('Organisation') }}
          </th>
          <th scope="col">
            {{ $t('Ministère de tutelle') }}
          </th>
          <th scope="col">
            {{ $t('Type') }}
          </th>
          <th scope="col">
            {{ $t('Source de la demande') }}
          </th>
          <th scope="col">
            {{ $t('Thématique') }}
          </th>
          <th scope="col">
            {{ $t('Statut') }}
          </th>
          <th scope="col">
            {{ $t('Restriction d\'accès') }}
          </th>
        </template>

        <template #row="{ record }">
          <td>
            <CdataLink
              v-if="fieldsOf(record).url"
              :to="fieldsOf(record).url!"
              external
              class="font-medium"
            >
              {{ fieldsOf(record).nom_donnee || '-' }}
            </CdataLink>
            <span
              v-else
              class="font-medium"
            >
              {{ fieldsOf(record).nom_donnee || '-' }}
            </span>
          </td>
          <td>
            {{ humanJoin(fieldsOf(record).organisation_names) || '-' }}
          </td>
          <td>
            {{ humanJoin(fieldsOf(record).ministere_de_tutelle_names) || '-' }}
          </td>
          <td class="whitespace-nowrap">
            <div class="flex flex-col gap-1 items-start">
              <span
                v-for="value in fieldsOf(record).type_values"
                :key="value"
                class="fr-badge fr-badge--sm fr-badge--no-icon"
                :class="typeBadgeClass(value)"
              >
                {{ value }}
              </span>
              <span v-if="fieldsOf(record).type_values.length === 0">-</span>
            </div>
          </td>
          <td class="whitespace-nowrap">
            <AdminBadge
              v-if="fieldsOf(record).source_demande_front"
              type="default"
              size="sm"
            >
              {{ fieldsOf(record).source_demande_front }}
            </AdminBadge>
            <span v-else>-</span>
          </td>
          <td>
            <div class="flex flex-col gap-1 items-start">
              <AdminBadge
                v-for="value in fieldsOf(record).thematique_values"
                :key="value"
                type="default"
                size="sm"
              >
                {{ value }}
              </AdminBadge>
              <span v-if="fieldsOf(record).thematique_values.length === 0">-</span>
            </div>
          </td>
          <td class="whitespace-nowrap">
            <CdataLink
              v-if="fieldsOf(record).statut_front && (fieldsOf(record).statut_front === 'Disponible' || fieldsOf(record).statut_front === 'Mise à jour requise') && fieldsOf(record).url"
              :to="fieldsOf(record).url!"
              external
              class="no-underline"
            >
              <AdminBadge
                :type="statutBadgeType(fieldsOf(record).statut_front!)"
                :icon-right="RiExternalLinkLine"
                size="sm"
              >
                {{ fieldsOf(record).statut_front }}
              </AdminBadge>
            </CdataLink>
            <AdminBadge
              v-else-if="fieldsOf(record).statut_front"
              :type="statutBadgeType(fieldsOf(record).statut_front!)"
              size="sm"
            >
              {{ fieldsOf(record).statut_front }}
            </AdminBadge>
            <span v-else>-</span>
          </td>
          <td class="whitespace-nowrap">
            <AdminBadge
              v-if="fieldsOf(record).restriction_acces"
              :type="fieldsOf(record).restriction_acces === 'Aucune' ? 'success' : 'warning'"
              size="sm"
            >
              {{ fieldsOf(record).restriction_acces }}
            </AdminBadge>
            <span v-else>-</span>
          </td>
        </template>
      </GristTableViewer>
    </OnboardingSection>

    <OnboardingSection>
      <div class="max-w-4xl">
        <OnboardingTitle class="mb-4">
          {{ $t('Explication des statuts d\'avancement') }}
        </OnboardingTitle>
        <OnboardingParagraph class="mb-6">
          {{ $t('Les données affichées dans ce tableau sont associées à un statut d\'avancement, qui permet d\'indiquer le niveau de progression du travail.') }}
        </OnboardingParagraph>
        <dl class="space-y-4 text-2xl font-light leading-normal text-black">
          <div>
            <dt class="inline">
              <AdminBadge
                type="danger"
                size="sm"
              >
                {{ $t('Non disponible') }}
              </AdminBadge>
            </dt>
            <dd class="inline ml-2">
              {{ $t('les données ne sont pas publiées sur {site}.', { site: config.public.title }) }}
            </dd>
          </div>
          <div>
            <dt class="inline">
              <AdminBadge
                type="success"
                size="sm"
              >
                {{ $t('Disponible') }}
              </AdminBadge>
            </dt>
            <dd class="inline ml-2">
              {{ $t('les données sont publiées sur {site}.', { site: config.public.title }) }}
            </dd>
          </div>
          <div>
            <dt class="inline">
              <AdminBadge
                type="primary"
                size="sm"
              >
                {{ $t('En cours') }}
              </AdminBadge>
            </dt>
            <dd class="inline ml-2">
              {{ $t('les données sont en cours de publication sur {site}.', { site: config.public.title }) }}
            </dd>
          </div>
          <div>
            <dt class="inline">
              <AdminBadge
                type="warning"
                size="sm"
              >
                {{ $t('Mise à jour requise') }}
              </AdminBadge>
            </dt>
            <dd class="inline ml-2">
              {{ $t('le jeu de données est disponible sur {site}, mais une mise à jour est attendue (ajout d\'un nouveau millésime, correction d\'une erreur, enrichissement des données publiées…).', { site: config.public.title }) }}
            </dd>
          </div>
        </dl>
      </div>
    </OnboardingSection>
  </div>
</template>

<script setup lang="ts">
import { RiExternalLinkLine } from '@remixicon/vue'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingParagraph from '~/components/Onboarding/OnboardingParagraph.vue'
import OnboardingTitle from '~/components/Onboarding/OnboardingTitle.vue'
import CdataLink from '~/components/CdataLink.vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import GristTableViewer from '~/components/GristTableViewer/GristTableViewer.vue'
import type { GristFilter, GristRecord } from '~/components/GristTableViewer/GristTableViewer.vue'
import type { AdminBadgeType } from '~/types/types'
import { humanJoin } from '~/utils/helpers'

interface OuvertureFields extends Record<string, unknown> {
  nom_donnee: string | null
  organisation: unknown
  ministere_de_tutelle: unknown
  type: unknown
  source_demande_front: string | null
  thematique: unknown
  statut_front: string | null
  restriction_acces: string | null
  url: string | null
  organisation_names: Array<string>
  ministere_de_tutelle_names: Array<string>
  type_values: Array<string>
  thematique_values: Array<string>
}

interface OuvertureRecord extends GristRecord {
  fields: OuvertureFields
}

const config = useRuntimeConfig()
const { t } = useTranslation()

useSeoMeta({
  title: t('Suivi des publications et engagements ministériels - {site}', { site: config.public.title }),
  description: t('Suivez de façon transparente l\'ouverture des données publiques, codes sources et API publics accompagnés par l\'équipe data.gouv.fr.'),
})
defineOgImage('MainPage.takumi', {
  title: 'Suivi des publications',
  uri: '/ouvertures',
})

interface OrganisationRecord {
  id: number
  fields: {
    nom_organisation: string
  }
}

// Grist returns lists as ["L", val1, val2, ...] — strip the leading marker.
function unwrapList(value: unknown): Array<unknown> {
  if (!Array.isArray(value)) return []
  if (value[0] === 'L') return value.slice(1)
  return value
}

const recordsUrl = `${config.public.ouverturesGristBaseUrl}/tables/${config.public.ouverturesGristTable}/records`
const organisationsUrl = `${config.public.ouverturesGristBaseUrl}/tables/Organisations/records`

const enrichedRecords = ref<Array<OuvertureRecord>>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [recordsRes, orgsRes] = await Promise.all([
      fetch(recordsUrl).then(r => r.json()),
      fetch(organisationsUrl).then(r => r.json()),
    ])

    const orgsById = new Map<number, string>()
    for (const org of orgsRes.records as Array<OrganisationRecord>) {
      orgsById.set(org.id, org.fields.nom_organisation)
    }

    const resolveOrgs = (value: unknown): Array<string> =>
      unwrapList(value)
        .map(id => orgsById.get(Number(id)))
        .filter((name): name is string => Boolean(name))

    enrichedRecords.value = (recordsRes.records as Array<OuvertureRecord>).map(record => ({
      ...record,
      fields: {
        ...record.fields,
        organisation_names: resolveOrgs(record.fields.organisation),
        ministere_de_tutelle_names: resolveOrgs(record.fields.ministere_de_tutelle),
        type_values: unwrapList(record.fields.type).map(String),
        thematique_values: unwrapList(record.fields.thematique).map(String),
      },
    }))
  }
  catch (e) {
    console.error('Failed to load ouvertures data', e)
  }
  finally {
    loading.value = false
  }
})

const fieldsOf = (r: GristRecord) => r.fields as OuvertureFields

const filters: Array<GristFilter> = [
  {
    slug: 'organisation',
    label: t('Organisation'),
    placeholder: t('Toutes les organisations'),
    getValues: r => fieldsOf(r).organisation_names,
  },
  {
    slug: 'ministere',
    label: t('Ministère de tutelle'),
    placeholder: t('Tous les ministères'),
    getValues: r => fieldsOf(r).ministere_de_tutelle_names,
  },
  {
    slug: 'type',
    label: t('Type'),
    placeholder: t('Tous les types'),
    getValues: r => fieldsOf(r).type_values,
  },
  {
    slug: 'source',
    label: t('Source de la demande'),
    placeholder: t('Toutes les sources'),
    getValues: r => fieldsOf(r).source_demande_front ? [fieldsOf(r).source_demande_front!] : [],
  },
  {
    slug: 'thematique',
    label: t('Thématique'),
    placeholder: t('Toutes les thématiques'),
    getValues: r => fieldsOf(r).thematique_values,
  },
  {
    slug: 'statut',
    label: t('Statut'),
    placeholder: t('Tous les statuts'),
    getValues: r => fieldsOf(r).statut_front ? [fieldsOf(r).statut_front!] : [],
    valueOrder: ['Non disponible', 'En cours', 'Disponible', 'Mise à jour requise'],
  },
]

function statutBadgeType(statut: string): AdminBadgeType {
  switch (statut) {
    case 'Disponible': return 'success'
    case 'En cours': return 'primary'
    case 'Mise à jour requise': return 'warning'
    case 'Non disponible': return 'danger'
    default: return 'default'
  }
}

function typeBadgeClass(type: string): string {
  switch (type) {
    case 'API': return 'fr-badge--green-menthe'
    case 'Téléchargement': return 'fr-badge--blue-ecume'
    case 'Code source': return 'fr-badge--purple-glycine'
    default: return ''
  }
}

// Push records with empty title to the end (matches the legacy "A venir" behaviour).
function sortByTitle(a: GristRecord, b: GristRecord): number {
  const aTitle = fieldsOf(a).nom_donnee
  const bTitle = fieldsOf(b).nom_donnee
  if (!aTitle && !bTitle) return 0
  if (!aTitle) return 1
  if (!bTitle) return -1
  return aTitle.localeCompare(bTitle, 'fr')
}
</script>
