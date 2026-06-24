<template>
  <div>
    <OnboardingHero
      color="primary"
      align="left"
    >
      <template #breadcrumb>
        <Breadcrumb>
          <BreadcrumbItem to="/">
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/suivi-de-publication">
            {{ $t('Suivi de publication') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ $t('Suivi des publications et engagements ministériels') }}
          </BreadcrumbItem>
        </Breadcrumb>
      </template>
      <template #title>
        {{ $t('Suivi de la publication des données, API et codes sources publics') }}
      </template>
      <template #subtitle>
        {{ $t('Les administrations produisent un large ensemble de données (données ouvertes ou à accès restreint, API, algorithmes et codes sources publics), dont l\'ouverture ou l\'amélioration de l\'accès constitue un enjeu majeur pour la transparence et la réutilisation.') }}
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <div class="max-w-4xl space-y-4 text-lg font-normal leading-normal text-gray-plain [&_p]:text-lg [&_p]:leading-normal [&_a]:bg-none">
        <p>
          {{ $t('Conformément à leurs obligations légales, les administrations publient et mettent à disposition une partie de leurs données. D\'autres acteurs (organismes privés, citoyens, etc.) peuvent également produire des données réutilisables.') }}
        </p>
        <p>
          <TranslationT keypath="L'équipe de {datagouv} accompagne les producteurs pour identifier, prioriser et suivre les données à publier ou mettre à jour. Ce tableau permet de rendre l'avancement de ces travaux plus transparent.">
            <template #datagouv>
              <CdataLink
                to="https://data.gouv.fr"
                external
                class="underline"
              >
                data.gouv.fr
              </CdataLink>
            </template>
          </TranslationT>
        </p>
        <p>
          {{ $t('Il s\'agit d\'un outil de travail non exhaustif. Les sujets suivis sont sélectionnés à partir des demandes reçues, des feuilles de route ministérielles ou de l\'actualité en cours.') }}
        </p>
        <p>
          <TranslationT keypath="Vous pouvez formuler des demandes de publication pour des données encore non identifiées par notre équipe via le {forum}. Merci pour vos contributions !">
            <template #forum>
              <CdataLink
                :to="config.public.forumUrl"
                external
                class="underline"
              >
                forum.data.gouv.fr
              </CdataLink>
            </template>
          </TranslationT>
        </p>
        <p>
          <TranslationT keypath="Un autre tableau de suivi est également disponible pour les {hvd} (règlementation européenne).">
            <template #hvd>
              <CdataLink
                :to="config.public.ouverturesHvdUrl"
                external
                class="underline"
              >
                {{ $t('données de forte valeur') }}
              </CdataLink>
            </template>
          </TranslationT>
        </p>
      </div>
    </OnboardingSection>

    <OnboardingSection background="gray">
      <GristTableViewer
        :data="enrichedRecords"
        :columns="columns"
        :filters="filters"
        :sort-fn="sortByTitle"
        :loading="loading"
        :error="error"
        table-min-width="1100px"
      >
        <template #row="{ record }">
          <td>
            <div class="flex flex-col gap-1 items-start">
              <!-- -ml-1.5 offsets the badge's own 0.375rem horizontal padding so the
                   badge text (not its border) lines up with the title text below. -->
              <div
                v-if="record.fields.type_values.length > 0"
                class="flex flex-wrap gap-1 -ml-1.5"
              >
                <span
                  v-for="value in record.fields.type_values"
                  :key="value"
                  class="fr-badge fr-badge--sm fr-badge--no-icon"
                  :class="typeBadgeClass(value)"
                >
                  {{ value }}
                </span>
              </div>
              <CdataLink
                v-if="record.fields.url && statutLinksToData(record.fields.statut_front)"
                :to="record.fields.url"
                external
                class="font-medium bg-none underline"
              >
                {{ record.fields.nom_donnee || '-' }}
              </CdataLink>
              <span
                v-else
                class="font-medium"
              >
                {{ record.fields.nom_donnee || '-' }}
              </span>
            </div>
          </td>
          <td>
            {{ humanJoin(record.fields.organisation_names) || '-' }}
          </td>
          <td class="whitespace-nowrap">
            <AdminBadge
              v-if="record.fields.source_demande_front"
              :type="sourceBadgeType(record.fields.source_demande_front)"
              size="sm"
            >
              {{ record.fields.source_demande_front }}
            </AdminBadge>
            <span v-else>-</span>
          </td>
          <td>
            <div class="flex flex-col gap-1 items-start">
              <AdminBadge
                v-for="value in record.fields.thematique_values"
                :key="value"
                type="default"
                size="sm"
              >
                {{ value }}
              </AdminBadge>
              <span v-if="record.fields.thematique_values.length === 0">-</span>
            </div>
          </td>
          <td class="whitespace-nowrap">
            <CdataLink
              v-if="statutLinksToData(record.fields.statut_front) && record.fields.url"
              :to="record.fields.url"
              external
              target="_blank"
              rel="noopener"
              class="no-underline fr-raw-link"
            >
              <AdminBadge
                :type="statutBadgeType(record.fields.statut_front)"
                :icon-right="RiExternalLinkLine"
                size="sm"
              >
                {{ record.fields.statut_front }}
              </AdminBadge>
            </CdataLink>
            <AdminBadge
              v-else-if="record.fields.statut_front"
              :type="statutBadgeType(record.fields.statut_front)"
              size="sm"
            >
              {{ record.fields.statut_front }}
            </AdminBadge>
            <span v-else>-</span>
          </td>
          <td class="whitespace-nowrap">
            <AdminBadge
              v-if="record.fields.restriction_acces"
              :type="record.fields.restriction_acces === 'Aucune' ? 'success' : 'warning'"
              size="sm"
            >
              {{ record.fields.restriction_acces }}
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
        <p class="mb-6 text-lg font-normal leading-normal text-gray-plain">
          {{ $t('Les données affichées dans ce tableau sont associées à un statut d\'avancement, qui permet d\'indiquer le niveau de progression du travail.') }}
        </p>
        <dl class="space-y-4 text-lg font-normal leading-normal text-gray-plain">
          <div
            v-for="statut in STATUTS"
            :key="statut.value"
          >
            <dt class="inline">
              <AdminBadge
                :type="statut.badgeType"
                size="sm"
              >
                {{ statut.label }}
              </AdminBadge>
            </dt>
            <dd class="inline ml-2">
              {{ statut.description }}
            </dd>
          </div>
        </dl>
      </div>
    </OnboardingSection>
  </div>
</template>

<script setup lang="ts">
import { RiExternalLinkLine } from '@remixicon/vue'
import { TranslationT } from '@datagouv/components-next'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingTitle from '~/components/Onboarding/OnboardingTitle.vue'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import GristTableViewer from '~/components/GristTableViewer/GristTableViewer.vue'
import type { GristFilter, GristRecord } from '~/components/GristTableViewer/GristTableViewer.vue'
import type { AdminBadgeType } from '~/types/types'
import { humanJoin } from '~/utils/helpers'
import { unwrapList } from '~/utils/grist'

type OuvertureFields = Record<string, unknown> & {
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

type OuvertureRecord = GristRecord & {
  fields: OuvertureFields
}

// Filters are synced to the URL query by GristTableViewer; keepScroll prevents
// each query update from scrolling back to the top of the page.
definePageMeta({ keepScroll: true })

const config = useRuntimeConfig()
const { t } = useTranslation()

useSeoMeta({
  title: t('Suivi des publications et engagements ministériels - {site}', { site: config.public.title }),
  description: t('Suivez de façon transparente l\'ouverture des données publiques, codes sources et API publics accompagnés par l\'équipe data.gouv.fr.'),
})
defineOgImage('MainPage.takumi', {
  title: 'Suivi des publications',
  uri: '/suivi-de-publication/engagements-et-demandes',
})

type OrganisationRecord = {
  id: number
  fields: {
    nom_organisation: string
  }
}

// Only the records explicitly flagged for the public site are shown; the Grist
// table also holds internal rows that must not appear here.
const recordsFilter = encodeURIComponent(JSON.stringify({ ajout_ouverture_data_gouv_fr: [true] }))
const recordsUrl = `${config.public.ouverturesGristBaseUrl}/tables/${config.public.ouverturesGristTable}/records?filter=${recordsFilter}`
const organisationsUrl = `${config.public.ouverturesGristBaseUrl}/tables/Organisations/records`

const { data: recordsData, status: recordsStatus, error: recordsError } = useFetch<{ records?: Array<OuvertureRecord> }>(recordsUrl)
const { data: orgsData, status: orgsStatus, error: orgsError } = useFetch<{ records?: Array<OrganisationRecord> }>(organisationsUrl)

const loading = computed(() => recordsStatus.value === 'pending' || orgsStatus.value === 'pending')
const error = computed<string | null>(() =>
  recordsError.value || orgsError.value ? t('Erreur lors du chargement des données') : null,
)

const enrichedRecords = computed<Array<OuvertureRecord>>(() => {
  const records = recordsData.value?.records
  const orgs = orgsData.value?.records
  if (!records || !orgs) return []

  const orgsById = new Map<number, string>()
  for (const org of orgs) {
    orgsById.set(org.id, org.fields.nom_organisation)
  }

  const resolveOrgs = (value: unknown): Array<string> =>
    unwrapList(value)
      .map(id => orgsById.get(Number(id)))
      .filter((name): name is string => Boolean(name))

  return records.map(record => ({
    ...record,
    fields: {
      ...record.fields,
      organisation_names: resolveOrgs(record.fields.organisation),
      ministere_de_tutelle_names: resolveOrgs(record.fields.ministere_de_tutelle),
      type_values: unwrapList(record.fields.type).map(String),
      thematique_values: unwrapList(record.fields.thematique).map(String),
    },
  })).filter(isMeaningfulRecord)
})

type StatutDefinition = {
  // Raw Grist value — used both to match records and as the filter option value.
  value: string
  // Translated label shown in the legend below the table.
  label: string
  badgeType: AdminBadgeType
  // Statuses whose badge links to the published dataset (when the record has an url).
  linksToData: boolean
  description: string
}

// Single source of truth for the statuses: drives the filter order, the badge
// colours, the "links to data" behaviour and the legend. Order = progression order.
const STATUTS: Array<StatutDefinition> = [
  {
    value: 'Non disponible',
    label: t('Non disponible'),
    badgeType: 'danger',
    linksToData: false,
    description: t('les données ne sont pas publiées sur {site}.', { site: config.public.title }),
  },
  {
    value: 'En cours',
    label: t('En cours'),
    badgeType: 'primary',
    linksToData: false,
    description: t('les données sont en cours de publication sur {site}.', { site: config.public.title }),
  },
  {
    value: 'Disponible',
    label: t('Disponible'),
    badgeType: 'success',
    linksToData: true,
    description: t('les données sont publiées sur {site}.', { site: config.public.title }),
  },
  {
    value: 'Mise à jour requise',
    label: t('Mise à jour requise'),
    badgeType: 'warning',
    linksToData: true,
    description: t('le jeu de données est disponible sur {site}, mais une mise à jour est attendue (ajout d\'un nouveau millésime, correction d\'une erreur, enrichissement des données publiées…).', { site: config.public.title }),
  },
]

const statutByValue = new Map(STATUTS.map(statut => [statut.value, statut]))

// Colours for the "Source de la demande" column. Status colours (red, green, orange)
// are kept out so they stay tied to the status column; "Demande utilisateur" uses the
// DSFR decorative teal and "Autre demande" stays neutral grey.
const SOURCE_BADGE_TYPES: Record<string, AdminBadgeType> = {
  'DINUM': 'primary',
  'Engagements ministériels 2021': 'pink',
  'Demande utilisateur': 'teal',
  'Autre demande': 'default',
}

function sourceBadgeType(source: string | null): AdminBadgeType {
  if (!source) return 'default'
  return SOURCE_BADGE_TYPES[source] ?? 'default'
}

const columns = [
  t('Titre'),
  t('Organisation'),
  t('Source de la demande'),
  t('Thématique'),
  t('Statut'),
  t('Restriction d\'accès'),
]

const filters: Array<GristFilter<OuvertureRecord>> = [
  {
    slug: 'organisation',
    label: t('Organisation'),
    placeholder: t('Toutes les organisations'),
    getValues: r => r.fields.organisation_names,
  },
  {
    slug: 'ministere',
    label: t('Ministère de tutelle'),
    placeholder: t('Tous les ministères'),
    getValues: r => r.fields.ministere_de_tutelle_names,
  },
  {
    slug: 'type',
    label: t('Type'),
    placeholder: t('Tous les types'),
    getValues: r => r.fields.type_values,
  },
  {
    slug: 'source',
    label: t('Source de la demande'),
    placeholder: t('Toutes les sources'),
    getValues: r => r.fields.source_demande_front ? [r.fields.source_demande_front] : [],
  },
  {
    slug: 'thematique',
    label: t('Thématique'),
    placeholder: t('Toutes les thématiques'),
    getValues: r => r.fields.thematique_values,
  },
  {
    slug: 'statut',
    label: t('Statut'),
    placeholder: t('Tous les statuts'),
    getValues: r => r.fields.statut_front ? [r.fields.statut_front] : [],
    valueOrder: STATUTS.map(statut => statut.value),
  },
]

function statutBadgeType(statut: string | null): AdminBadgeType {
  if (!statut) return 'default'
  return statutByValue.get(statut)?.badgeType ?? 'default'
}

function statutLinksToData(statut: string | null): boolean {
  return Boolean(statut && statutByValue.get(statut)?.linksToData)
}

function typeBadgeClass(type: string): string {
  switch (type) {
    case 'API': return 'fr-badge--green-menthe'
    case 'Téléchargement': return 'fr-badge--blue-ecume'
    case 'Code source': return 'fr-badge--purple-glycine'
    default: return ''
  }
}

// Grist keeps fully empty rows in the table; restriction_acces is ignored here
// because it holds a default value ("Aucune") even on those empty rows.
function isMeaningfulRecord(record: OuvertureRecord): boolean {
  const fields = record.fields
  return Boolean(
    fields.nom_donnee
    || fields.statut_front
    || fields.source_demande_front
    || fields.organisation_names.length
    || fields.ministere_de_tutelle_names.length
    || fields.type_values.length
    || fields.thematique_values.length,
  )
}

// Push records with empty title to the end (matches the legacy "A venir" behaviour).
function sortByTitle(a: OuvertureRecord, b: OuvertureRecord): number {
  const aTitle = a.fields.nom_donnee
  const bTitle = b.fields.nom_donnee
  if (!aTitle && !bTitle) return 0
  if (!aTitle) return 1
  if (!bTitle) return -1
  return aTitle.localeCompare(bTitle, 'fr')
}
</script>
