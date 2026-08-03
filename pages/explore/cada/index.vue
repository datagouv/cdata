<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/explore">
        {{ $t('Explorer') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Avis et conseils de la CADA') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <div class="mb-6">
      <h1 class="text-gray-title font-extrabold text-2xl mb-2">
        {{ $t('Avis et conseils de la CADA') }}
      </h1>
      <p class="text-gray-medium">
        {{ $t('Recherchez parmi les avis et conseils rendus par la Commission d\'accès aux documents administratifs.') }}
      </p>
    </div>

    <!-- Outside the explorer: the search drives the query, so it has to stay
         reachable when that query failed. -->
    <form
      class="py-3"
      @submit.prevent="applySearch"
    >
      <SearchInput
        v-model="searchQuery"
        :placeholder="$t('Rechercher par objet, administration, thème, mots-clés…')"
        :auto-focus="false"
      />
    </form>

    <ClientOnly>
      <TabularExplorer
        v-if="RESOURCE_ID"
        :key="route.fullPath"
        :resource-id="RESOURCE_ID"
        :global-search="currentSearch"
        :initial-filters="initialFilters"
      >
        <div class="flex items-center gap-2 py-3">
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <TabularMobileFilterButton class="md:hidden" />
            <div class="hidden md:block">
              <TabularActiveFilters with-clear />
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-4">
            <TabularColumnsMenu />
            <TabularRowsInfo />
          </div>
        </div>
        <TabularTable
          full-bleed
          :row-href="{ columns: ['Numéro de dossier'], href: row => `/explore/cada/${row['Numéro de dossier']}` }"
          :no-format-columns="['Numéro de dossier']"
        />
        <TabularMobileFilters />
      </TabularExplorer>
      <template #fallback>
        <div class="bg-gray-100 rounded-lg py-12 text-center text-gray-medium">
          {{ $t('Chargement…') }}
        </div>
      </template>
    </ClientOnly>

    <div class="mt-12 border-t pt-8">
      <h2 class="text-lg font-bold mb-4">
        {{ $t('À propos de la base des avis CADA') }}
      </h2>
      <div class="prose max-w-none">
        <p class="text-gray-700 mb-4">
          {{ $t('La Commission d\'accès aux documents administratifs (CADA) est une autorité administrative indépendante chargée de veiller à la liberté d\'accès aux documents administratifs et aux archives publiques ainsi qu\'à la réutilisation des informations publiques. Elle peut être saisie par les personnes qui se sont vues opposer une décision défavorable en matière d\'accès à des documents administratifs. Le recours devant la CADA constitue un préalable obligatoire à tout recours contentieux.') }}
        </p>

        <TranslationT
          keypath="Cette exploration permet de consulter les avis et conseils rendus par la CADA depuis les années 1980. Les données proviennent du jeu de données {dataset} publié sur {platform}."
          tag="p"
          class="text-gray-700 mb-6"
        >
          <template #dataset>
            <CdataLink
              :to="CADA_DATASET_URL"
              external
              target="_blank"
              class="link"
            >
              {{ $t('Avis et conseils de la CADA') }}
            </CdataLink>
          </template>
          <template #platform>
            <CdataLink
              href="https://www.data.gouv.fr"
              external
              target="_blank"
              class="link"
            >
              data.gouv.fr
            </CdataLink>
          </template>
        </TranslationT>

        <h2 class="text-lg font-bold mb-4">
          {{ $t('Cadre légal') }}
        </h2>
        <TranslationT
          keypath="La politique d’open data, dont le cadre légal a été profondément renouvelé par les lois {gratuite} et {republique} désormais codifiées dans le {code}, puise en partie ses fondements dans le droit d’accès aux documents administratifs, institué par {loiCada}. La loi CADA permet aux particuliers de demander des documents à l’ensemble des administrations centrales et locales. Ces dernières ont l’obligation d’y répondre, favorablement ou défavorablement."
          tag="p"
          class="text-gray-700 mb-4"
        >
          <template #gratuite>
            <CdataLink
              href="https://www.legifrance.gouv.fr/eli/loi/2015/12/28/PRMX1515110L/jo/texte"
              external
              target="_blank"
              class="link"
            >
              {{ $t('Gratuité et modalités de réutilisation des informations publiques') }}
            </CdataLink>
          </template>
          <template #republique>
            <CdataLink
              href="https://www.legifrance.gouv.fr/affichTexte.do;jsessionid=70F06FAFE42AB53A449EF2AE222183BF.tplgfr23s_1?cidTexte=JORFTEXT000033202746&categorieLien=id"
              external
              target="_blank"
              class="link"
            >
              {{ $t('République numérique') }}
            </CdataLink>
          </template>
          <template #code>
            <CdataLink
              href="https://www.legifrance.gouv.fr/affichCode.do?cidTexte=LEGITEXT000031366350&dateTexte=vig"
              external
              target="_blank"
              class="link"
            >
              {{ $t('Code des relations entre le public et l’administration') }}
            </CdataLink>
          </template>
          <template #loiCada>
            <CdataLink
              href="https://www.legifrance.gouv.fr/jo_pdf.do?id=JORFTEXT000000339241"
              external
              target="_blank"
              class="link"
            >
              {{ $t('la loi CADA en 1978') }}
            </CdataLink>
          </template>
        </TranslationT>

        <h2 class="text-lg font-bold mb-4">
          {{ $t('Liens utiles') }}
        </h2>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li>
            <CdataLink
              href="https://www.cada.fr/saisine"
              target="_blank"
              class="link"
            >
              {{ $t('Quand et comment saisir la CADA ?') }}
            </CdataLink>
          </li>
          <li>
            <CdataLink
              href="https://www.cada.fr/administration/modalites-de-communication"
              target="_blank"
              class="link"
            >
              {{ $t('Modalités de communication des documents') }}
            </CdataLink>
          </li>
          <li>
            <TranslationT keypath="{fiches} (environnement, marchés publics, gestion des collectivités territoriales…)">
              <template #fiches>
                <CdataLink
                  href="https://www.cada.fr/administration/fiches-thematiques"
                  target="_blank"
                  class="link"
                >
                  {{ $t('Fiches thématiques relatives aux documents fréquemment demandés') }}
                </CdataLink>
              </template>
            </TranslationT>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchInput, TabularActiveFilters, TabularColumnsMenu, TabularExplorer, TabularMobileFilterButton, TabularMobileFilters, TabularRowsInfo, TabularTable, TranslationT, provideTabularProfile } from '@datagouv/components-next'
import type { ColumnFilters } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const config = useRuntimeConfig()
const RESOURCE_ID = config.public.cadaResourceId
const CADA_DATASET_URL = config.public.cadaDatasetUrl

const { t } = useTranslation()

useSeoMeta({
  title: () => t('Avis et conseils de la CADA'),
  description: () =>
    t('Recherchez parmi les avis et conseils rendus par la Commission d\'accès aux documents administratifs.'),
})

const route = useRoute()

const searchQuery = ref('')
const currentSearch = ref('')

function applySearch() {
  currentSearch.value = searchQuery.value.trim()
}

type UrlFilterParam = {
  column: string
  // `contains` for free text, `exact` for closed vocabularies: a `contains` on
  // the roman numerals of `Partie` would match I inside II, III and IV.
  operator: 'contains' | 'exact'
}

const URL_PARAM_MAP: Record<string, UrlFilterParam> = {
  administration: { column: 'Administration', operator: 'contains' },
  topic: { column: 'Thème et sous thème', operator: 'contains' },
  tag: { column: 'Mots clés', operator: 'contains' },
  meaning: { column: 'Sens et motivation', operator: 'contains' },
  year: { column: 'Année', operator: 'exact' },
  part: { column: 'Partie', operator: 'exact' },
}

const initialFilters = computed(() => {
  const f: Record<string, ColumnFilters> = {}
  for (const [param, { column, operator }] of Object.entries(URL_PARAM_MAP)) {
    const val = route.query[param]
    if (!val) continue
    const value = Array.isArray(val) ? String(val[0]) : val
    f[column] = operator === 'exact' ? { exact: value } : { contains: value }
  }
  return f
})

if (RESOURCE_ID) {
  provideTabularProfile(() => RESOURCE_ID)
}
else {
  // Use `showError`, not `throw createError`: throwing rejects the async setup,
  // see the detailed explanation in pages/pages/[...slug].vue.
  showError({ statusCode: 404, statusMessage: 'Page Not Found' })
}
</script>
