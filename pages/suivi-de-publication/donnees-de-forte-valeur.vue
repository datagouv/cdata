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
            {{ humanJoin(record.fields.ensemble_values) || '-' }}
          </td>
          <td>
            <div
              v-if="record.fields.thematique_values.length"
              class="flex flex-wrap gap-1"
            >
              <AdminBadge
                v-for="theme in record.fields.thematique_values"
                :key="theme"
                type="teal"
                size="sm"
              >
                {{ theme }}
              </AdminBadge>
            </div>
            <span v-else>-</span>
          </td>
          <td>
            {{ record.fields.ministere || '-' }}
          </td>
          <td>
            {{ record.fields.producteur || '-' }}
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
  </div>
</template>

<script setup lang="ts">
import { TranslationT } from '@datagouv/components-next'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import HvdStatutBadge from '~/components/SuiviDePublication/HvdStatutBadge.vue'
import GristTableViewer from '~/components/GristTableViewer/GristTableViewer.vue'
import type { GristFilter, GristRecord } from '~/components/GristTableViewer/GristTableViewer.vue'
import type { AdminBadgeType } from '~/types/types'
import { humanJoin } from '~/utils/helpers'

// hvd_name (ensemble) and hvd_category (thématique) are Grist ChoiceList cells,
// so each record can carry several values.
type HvdFields = {
  title: string | null
  ensemble_values: Array<string>
  thematique_values: Array<string>
  ministere: string | null
  producteur: string | null
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

// Grist encodes a ChoiceList cell as ["L", "value1", "value2"]; the leading "L"
// is the list-type marker. Return the real values, dropping empties.
function choiceList(value: unknown): Array<string> {
  if (!Array.isArray(value)) {
    const s = str(value)
    return s ? [s] : []
  }
  return value.slice(1).map(str).filter((v): v is string => v !== null)
}

// The API channel labels partial availability differently ("Disponibilité
// partielle"); unify it with the download channel so a single badge/legend entry
// covers both.
function normaliseStatut(value: string | null): string | null {
  return value === 'Disponibilité partielle' ? 'Partiellement disponible' : value
}

// The displayed status is the manual override when set, otherwise the automatic
// one.
function resolveStatut(manual: unknown, automatique: unknown): string | null {
  return normaliseStatut(str(manual) ?? str(automatique))
}

// All raw Grist columns are read here; this is the only place to update if the
// Grist schema changes.
function enrichRecord(record: GristRecord): HvdRecord {
  const f = record.fields
  return {
    ...record,
    fields: {
      title: str(f.title),
      ensemble_values: choiceList(f.hvd_name),
      // Raw hvd_category values (no accents) are kept as-is so legacy links like
      // ?theme=Geospatiales, forwarded verbatim by the infra redirect from
      // ouverture.data.gouv.fr, still match this filter.
      thematique_values: choiceList(f.hvd_category),
      ministere: str(f.ministry),
      producteur: str(f.organization),
      statut_telechargement: resolveStatut(f.manual_status_telechargement, f.status_telechargement_automatique),
      url_telechargement: str(f.url),
      statut_api: resolveStatut(f.manual_status_api, f.status_api_automatique),
      url_api: str(f.api_web_datagouv),
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
  badgeType: AdminBadgeType
  // Statuses whose badge links to the published dataset (when the record has an url).
  linksToData: boolean
}

// Single source of truth for the statuses: drives the badge colours, the
// "links to data" behaviour and the filter ordering. Order = progression order.
const STATUTS: Array<StatutDefinition> = [
  { value: 'Non disponible', badgeType: 'danger', linksToData: false },
  { value: 'Planifié', badgeType: 'warning', linksToData: false },
  { value: 'Partiellement disponible', badgeType: 'pink', linksToData: true },
  { value: 'Disponible', badgeType: 'primary', linksToData: true },
  { value: 'Disponible sur data.gouv.fr', badgeType: 'success', linksToData: true },
  { value: 'Non requis', badgeType: 'default', linksToData: false },
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
// categories order. Values are the raw Grist labels (stored without diacritics).
const THEME_ORDER = [
  'Geospatiales',
  'Observation de la terre et environnement',
  'Meteorologiques',
  'Statistiques',
  'Entreprises et propriete dentreprises',
  'Mobilite',
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

// The filter slugs double as URL query keys. They deliberately reuse the legacy
// ouverture.data.gouv.fr param names (category / theme / department / producer)
// so links already shared with ministries keep filtering once the infra redirect
// forwards their query string verbatim to this page.
const filters: Array<GristFilter<HvdRecord>> = [
  {
    slug: 'category',
    label: t('Ensemble de données'),
    placeholder: t('Tous les ensembles de données'),
    getValues: r => r.fields.ensemble_values,
  },
  {
    slug: 'theme',
    label: t('Thématique'),
    placeholder: t('Toutes les thématiques'),
    getValues: r => r.fields.thematique_values,
    valueOrder: THEME_ORDER,
  },
  {
    slug: 'department',
    label: t('Ministère de tutelle'),
    placeholder: t('Tous les ministères'),
    getValues: r => r.fields.ministere ? [r.fields.ministere] : [],
  },
  {
    slug: 'producer',
    label: t('Producteur'),
    placeholder: t('Tous les producteurs'),
    getValues: r => r.fields.producteur ? [r.fields.producteur] : [],
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
    || f.ensemble_values.length
    || f.thematique_values.length
    || f.ministere
    || f.producteur
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
