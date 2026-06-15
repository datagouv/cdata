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
          <BreadcrumbItem to="/ouvertures">
            {{ $t('Ouvertures') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ $t('Suivi des publications et engagements ministériels') }}
          </BreadcrumbItem>
        </Breadcrumb>
      </template>
      <template #title>
        {{ $t('Suivre les publications de données et les engagements ministériels') }}
      </template>
      <template #subtitle>
        {{ $t('Les administrations produisent un large ensemble de données (données ouvertes ou à accès restreint, API, algorithmes et codes sources publics), dont l\'ouverture ou l\'amélioration de l\'accès constitue un enjeu majeur pour la transparence et la réutilisation.') }}
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <div class="max-w-4xl space-y-4 text-lg font-normal leading-normal text-gray-plain [&_p]:text-lg [&_p]:leading-normal [&_a]:bg-none">
        <p>
          {{ $t('Conformément à leurs obligations légales, les administrations publient et mettent à disposition une partie de ces données, mais d\'autres acteurs (organismes privés ou citoyens) peuvent également contribuer en produisant des données réutilisables.') }}
        </p>
        <p>
          {{ $t('L\'équipe de {site} accompagne activement les producteurs de données pour identifier, prioriser et suivre l\'évolution de la mise à disposition de ces données. Pour accompagner cette démarche, nous avons conçu un tableau qui vous permet de suivre de façon transparente le statut des données dont nous travaillons à l\'ouverture, à leur publication et à leur mise à jour.', { site: config.public.title }) }}
        </p>
        <p>
          {{ $t('Ce document est un outil de travail. Il n\'est pas exhaustif et ne reflète pas l\'ensemble des actions menées par les acteurs publics. Les sujets répertoriés sont issus de la sélection de l\'équipe de {site}, basée notamment sur :', { site: config.public.title }) }}
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>
            <TranslationT keypath="les demandes exprimées sur le {forum} ou notre {contact} ;">
              <template #forum>
                <CdataLink
                  :to="config.public.forumUrl"
                  external
                  class="underline"
                >
                  forum.data.gouv.fr
                </CdataLink>
              </template>
              <template #contact>
                <CdataLink
                  :to="config.public.supportUrl"
                  external
                  class="underline"
                >
                  {{ $t('formulaire de contact') }}
                </CdataLink>
              </template>
            </TranslationT>
          </li>
          <li>{{ $t('la recherche active de l\'équipe, en fonction des actualités et besoins identifiés ;') }}</li>
          <li>{{ $t('les feuilles de routes des ministères.') }}</li>
        </ul>
        <p>
          {{ $t('L\'objectif de ce suivi est :') }}
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li>{{ $t('d\'améliorer la transparence et la visibilité des travaux en cours auprès du public ;') }}</li>
          <li>{{ $t('de faciliter le suivi et la coordination des ouvertures de données avec les producteurs de données.') }}</li>
        </ul>
        <p>
          {{ $t('Ce tableau a été créé pour la première fois en septembre 2024. Notez que certaines demandes qu\'il contient peuvent remonter à plusieurs années.') }}
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
        <p>
          <TranslationT keypath="Les données affichées ci-dessous sont également disponibles en open data sous forme de jeu de données : {dataset}.">
            <template #dataset>
              <CdataLink
                :to="config.public.ouverturesDatasetUrl"
                external
                class="underline"
              >
                {{ $t('Tableau de suivi des ouvertures de données, codes sources et API publics') }}
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
                v-if="record.fields.url"
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
              type="default"
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
              class="no-underline"
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
  uri: '/ouvertures/suivi',
})

interface OrganisationRecord {
  id: number
  fields: {
    nom_organisation: string
  }
}

const recordsUrl = `${config.public.ouverturesGristBaseUrl}/tables/${config.public.ouverturesGristTable}/records`
const organisationsUrl = `${config.public.ouverturesGristBaseUrl}/tables/Organisations/records`

const enrichedRecords = ref<Array<OuvertureRecord>>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const [recordsRes, orgsRes] = await Promise.all([
      fetch(recordsUrl),
      fetch(organisationsUrl),
    ])
    const failed = [recordsRes, orgsRes].find(response => !response.ok)
    if (failed) {
      throw new Error(`${t('Erreur HTTP')}: ${failed.status} ${failed.statusText}`)
    }

    const recordsData = await recordsRes.json() as { records?: Array<OuvertureRecord> }
    const orgsData = await orgsRes.json() as { records?: Array<OrganisationRecord> }
    if (!recordsData.records || !orgsData.records) {
      throw new Error(t('Format de réponse invalide: propriété "records" manquante'))
    }

    const orgsById = new Map<number, string>()
    for (const org of orgsData.records) {
      orgsById.set(org.id, org.fields.nom_organisation)
    }

    const resolveOrgs = (value: unknown): Array<string> =>
      unwrapList(value)
        .map(id => orgsById.get(Number(id)))
        .filter((name): name is string => Boolean(name))

    enrichedRecords.value = recordsData.records.map(record => ({
      ...record,
      fields: {
        ...record.fields,
        organisation_names: resolveOrgs(record.fields.organisation),
        ministere_de_tutelle_names: resolveOrgs(record.fields.ministere_de_tutelle),
        type_values: unwrapList(record.fields.type).map(String),
        thematique_values: unwrapList(record.fields.thematique).map(String),
      },
    })).filter(isMeaningfulRecord)
  }
  catch (e) {
    console.error('Failed to load ouvertures data', e)
    error.value = e instanceof Error ? e.message : t('Erreur inconnue')
  }
  finally {
    loading.value = false
  }
})

interface StatutDefinition {
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
