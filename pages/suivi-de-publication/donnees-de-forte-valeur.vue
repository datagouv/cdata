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
            {{ $t('Données de forte valeur') }}
          </BreadcrumbItem>
        </Breadcrumb>
      </template>
      <template #title>
        {{ $t('Suivi de l\'ouverture des données de forte valeur') }}
      </template>
      <template #subtitle>
        {{ $t('Suivez l\'avancement de la publication des ensembles de données de forte valeur identifiés par la Commission européenne.') }}
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <div class="max-w-4xl space-y-4 text-lg font-normal leading-normal text-gray-plain [&_p]:text-lg [&_p]:leading-normal [&_a]:bg-none">
        <p>
          <TranslationT keypath="Pour favoriser la diffusion des données ouvertes dans les États membres de l'Union européenne et exploiter davantage leur potentiel, les institutions européennes ont identifié des {ensembles} de données de forte valeur.">
            <template #ensembles>
              <CdataLink
                to="https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives/12111-Donnees-ouvertes-disponibilite-des-ensembles-de-donnees-publiques_fr"
                external
                class="underline"
              >
                {{ $t('ensembles') }}
              </CdataLink>
            </template>
          </TranslationT>
        </p>
        <p>
          {{ $t('Ces ensembles de données, dont la réutilisation peut avoir des retombées importantes pour la société, l\'économie et l\'environnement doivent être mis à disposition par l\'ensemble des pays membres dans des conditions satisfaisantes (réutilisables gratuitement via des interfaces de programmation d\'applications, disponibles dans un format lisible par machine, téléchargeables en masse, dans la mesure du possible).') }}
        </p>
        <p>
          {{ $t('Vous trouverez ici la liste des jeux de données concernés et l\'avancement de leur publication.') }}
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
        table-min-width="1200px"
      >
        <template #row="{ record }">
          <td class="max-w-[200px]">
            <span class="font-medium">{{ record.fields.title || '-' }}</span>
          </td>
          <td>
            {{ record.fields.ensemble || '-' }}
          </td>
          <td>
            <AdminBadge
              v-if="record.fields.thematique"
              type="teal"
              size="sm"
            >
              {{ record.fields.thematique }}
            </AdminBadge>
            <span v-else>-</span>
          </td>
          <td>
            {{ humanJoin(record.fields.ministere_values) || '-' }}
          </td>
          <td>
            {{ humanJoin(record.fields.producteur_values) || '-' }}
          </td>
          <td class="whitespace-nowrap">
            <HvdStatutBadge
              :statut="record.fields.statut_telechargement"
              :url="record.fields.url_telechargement"
              :type="statutBadgeType(record.fields.statut_telechargement)"
              :links-to-data="statutLinksToData(record.fields.statut_telechargement)"
            />
          </td>
          <td class="whitespace-nowrap">
            <HvdStatutBadge
              :statut="record.fields.statut_api"
              :url="record.fields.url_api"
              :type="statutBadgeType(record.fields.statut_api)"
              :links-to-data="statutLinksToData(record.fields.statut_api)"
            />
          </td>
        </template>
      </GristTableViewer>
    </OnboardingSection>

    <OnboardingSection>
      <div class="max-w-4xl">
        <OnboardingTitle class="mb-4">
          {{ $t('Explication des statuts d\'avancement') }}
        </OnboardingTitle>
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
import { TranslationT } from '@datagouv/components-next'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingTitle from '~/components/Onboarding/OnboardingTitle.vue'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import HvdStatutBadge from '~/components/SuiviDePublication/HvdStatutBadge.vue'
import GristTableViewer from '~/components/GristTableViewer/GristTableViewer.vue'
import type { GristFilter, GristRecord } from '~/components/GristTableViewer/GristTableViewer.vue'
import type { AdminBadgeType } from '~/types/types'
import { humanJoin } from '~/utils/helpers'

// Ministère de tutelle and Producteur are stored per channel (Téléchargement / API)
// in Grist; we merge each pair into a single deduplicated column for display.
type HvdFields = {
  title: string | null
  ensemble: string | null
  thematique: string | null
  ministere_values: Array<string>
  producteur_values: Array<string>
  statut_telechargement: string | null
  url_telechargement: string | null
  statut_api: string | null
  url_api: string | null
}

type HvdRecord = GristRecord & {
  fields: HvdFields
}

// Filters are synced to the URL query by GristTableViewer; keepScroll prevents
// each query update from scrolling back to the top of the page.
definePageMeta({ keepScroll: true })

const config = useRuntimeConfig()
const { t } = useTranslation()

useSeoMeta({
  title: t('Suivi de l\'ouverture des données de forte valeur - {site}', { site: config.public.title }),
  description: t('Suivez l\'avancement de la publication des ensembles de données de forte valeur identifiés par la Commission européenne.'),
})
defineOgImage('MainPage.takumi', {
  title: 'Données de forte valeur',
  uri: '/suivi-de-publication/donnees-de-forte-valeur',
})

const recordsUrl = `${config.public.hvdGristBaseUrl}/tables/${config.public.hvdGristTable}/records`

const { data: recordsData, status: recordsStatus, error: recordsError } = useFetch<{ records?: Array<GristRecord> }>(recordsUrl)

const loading = computed(() => recordsStatus.value === 'pending')
const error = computed<string | null>(() =>
  recordsError.value ? t('Erreur lors du chargement des données') : null,
)

// Grist stores empty cells as "" — normalise to null so display and filters agree.
function str(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null
}

// Collect several channel values into a single deduplicated, order-preserving list.
function uniqueNonEmpty(...values: Array<unknown>): Array<string> {
  const result: Array<string> = []
  for (const value of values) {
    const s = str(value)
    if (s && !result.includes(s)) result.push(s)
  }
  return result
}

// All raw Grist columns are read here; this is the only place to update if the
// Grist schema changes.
function enrichRecord(record: GristRecord): HvdRecord {
  const f = record.fields
  return {
    ...record,
    fields: {
      title: str(f.Titre),
      ensemble: str(f.Ensemble_de_donnees),
      thematique: str(f.Thematique),
      ministere_values: uniqueNonEmpty(f.Ministere_de_tutelle_Telechargement, f.Ministere_de_tutelle_API),
      producteur_values: uniqueNonEmpty(f.Producteur_Telechargement, f.Producteur_API),
      statut_telechargement: str(f.Statut_Telechargement),
      url_telechargement: str(f.URL_Telechargement),
      statut_api: str(f.Statut_API),
      url_api: str(f.URL_API),
    },
  }
}

const enrichedRecords = computed<Array<HvdRecord>>(() => {
  const records = recordsData.value?.records
  if (!records) return []
  return records.map(enrichRecord).filter(isMeaningfulRecord)
})

type StatutDefinition = {
  // Raw Grist value — used both to match records and as the filter option value.
  value: string
  label: string
  badgeType: AdminBadgeType
  // Statuses whose badge links to the published dataset (when the record has an url).
  linksToData: boolean
  description: string
}

// Single source of truth for the statuses: drives the badge colours, the
// "links to data" behaviour and the legend. Order = progression order.
const STATUTS: Array<StatutDefinition> = [
  {
    value: 'Non disponible',
    label: t('Non disponible'),
    badgeType: 'danger',
    linksToData: false,
    description: t('les données ne sont pas publiées sur {site}.', { site: config.public.title }),
  },
  {
    value: 'Planifié',
    label: t('Planifié'),
    badgeType: 'warning',
    linksToData: false,
    description: t('la publication des données est planifiée.'),
  },
  {
    value: 'Partiellement disponible',
    label: t('Partiellement disponible'),
    badgeType: 'pink',
    linksToData: true,
    description: t('une partie des données est publiée sur {site}.', { site: config.public.title }),
  },
  {
    value: 'Disponible',
    label: t('Disponible'),
    badgeType: 'primary',
    linksToData: true,
    description: t('les données sont publiées sur {site}.', { site: config.public.title }),
  },
  {
    value: 'Disponible sur data.gouv.fr',
    label: t('Disponible sur data.gouv.fr'),
    badgeType: 'success',
    linksToData: true,
    description: t('les données sont publiées et à jour sur {site}.', { site: config.public.title }),
  },
]

const statutByValue = new Map(STATUTS.map(statut => [statut.value, statut]))

function statutBadgeType(statut: string | null): AdminBadgeType {
  if (!statut) return 'default'
  return statutByValue.get(statut)?.badgeType ?? 'default'
}

function statutLinksToData(statut: string | null): boolean {
  return Boolean(statut && statutByValue.get(statut)?.linksToData)
}

// Custom ordering for the "Thématique" filter, matching the six European HVD
// categories order. Values are the raw Grist labels.
const THEME_ORDER = [
  'Géospatiales',
  'Observation de la terre et environnement',
  'Météorologiques',
  'Statistiques',
  'Entreprises et propriété d\'entreprises',
  'Mobilité',
]

const columns = [
  t('Titre'),
  t('Ensemble de données'),
  t('Thématique'),
  t('Ministère de tutelle'),
  t('Producteur'),
  t('Téléchargement'),
  t('API'),
]

const filters: Array<GristFilter<HvdRecord>> = [
  {
    slug: 'ensemble',
    label: t('Ensemble de données'),
    placeholder: t('Tous les ensembles de données'),
    getValues: r => r.fields.ensemble ? [r.fields.ensemble] : [],
  },
  {
    slug: 'thematique',
    label: t('Thématique'),
    placeholder: t('Toutes les thématiques'),
    getValues: r => r.fields.thematique ? [r.fields.thematique] : [],
    valueOrder: THEME_ORDER,
  },
  {
    slug: 'ministere',
    label: t('Ministère de tutelle'),
    placeholder: t('Tous les ministères'),
    getValues: r => r.fields.ministere_values,
  },
  {
    slug: 'producteur',
    label: t('Producteur'),
    placeholder: t('Tous les producteurs'),
    getValues: r => r.fields.producteur_values,
  },
  {
    slug: 'statut-telechargement',
    label: t('Statut Téléchargement'),
    placeholder: t('Tous les statuts'),
    getValues: r => r.fields.statut_telechargement ? [r.fields.statut_telechargement] : [],
    valueOrder: STATUTS.map(statut => statut.value),
  },
  {
    slug: 'statut-api',
    label: t('Statut API'),
    placeholder: t('Tous les statuts'),
    getValues: r => r.fields.statut_api ? [r.fields.statut_api] : [],
    valueOrder: STATUTS.map(statut => statut.value),
  },
]

// Grist keeps fully empty rows in the table; drop the rows that have no
// displayable value at all.
function isMeaningfulRecord(record: HvdRecord): boolean {
  const f = record.fields
  return Boolean(
    f.title
    || f.ensemble
    || f.thematique
    || f.ministere_values.length
    || f.producteur_values.length
    || f.statut_telechargement
    || f.statut_api,
  )
}

// Push records with an empty title to the end.
function sortByTitle(a: HvdRecord, b: HvdRecord): number {
  const aTitle = a.fields.title
  const bTitle = b.fields.title
  if (!aTitle && !bTitle) return 0
  if (!aTitle) return 1
  if (!bTitle) return -1
  return aTitle.localeCompare(bTitle, 'fr')
}
</script>
