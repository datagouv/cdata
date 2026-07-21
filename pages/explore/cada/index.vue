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

    <ClientOnly>
      <TabularExplorer
        v-if="RESOURCE_ID"
        :key="route.fullPath"
        :resource-id="RESOURCE_ID"
        full-bleed
        disable-popover
        :global-search="currentSearch"
        :initial-filters="initialFilters"
        :row-href="{ columns: ['Numéro de dossier'], href: (row: any) => `/explore/cada/${row['Numéro de dossier']}` }"
      >
        <template #toolbar-top>
          <div class="py-3">
            <div class="flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('Rechercher par objet, administration, thème, mots-clés…')"
                class="flex-1 px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                @keydown.enter="applySearch"
              >
              <button
                class="px-4 py-2 bg-new-primary text-white text-sm rounded hover:bg-new-primary-hover"
                @click="applySearch"
              >
                <RiSearchLine class="size-4 md:hidden" />
                <span class="hidden md:inline">{{ $t('Rechercher') }}</span>
                <span class="sr-only md:hidden">{{ $t('Rechercher') }}</span>
              </button>
            </div>
          </div>
        </template>
      </TabularExplorer>
      <div
        v-else
        class="bg-gray-100 rounded-lg py-12 text-center text-gray-medium"
      >
        {{ $t('La base des avis CADA n\'est pas configurée.') }}
      </div>
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

        <p class="text-gray-700 mb-6">
          {{ $t('Cette exploration permet de consulter les avis et conseils rendus par la CADA depuis les années 1980. Les données proviennent du jeu de données') }}
          <CdataLink
            :to="CADA_DATASET_URL"
            external
            target="_blank"
            class="link"
          >
            {{ $t('Avis et conseils de la CADA') }}
          </CdataLink>
          {{ $t('publié sur') }}
          <CdataLink
            href="https://www.data.gouv.fr"
            external
            target="_blank"
            class="link"
          >
            data.gouv.fr
          </CdataLink>.
        </p>

        <h2 class="text-lg font-bold mb-4">
          {{ $t('Cadre légal') }}
        </h2>
        <p class="text-gray-700 mb-4">
          {{ $t('La politique d\u2019open data, dont le cadre légal a été profondément renouvelé par les lois') }}
          <CdataLink
            href="https://www.legifrance.gouv.fr/eli/loi/2015/12/28/PRMX1515110L/jo/texte"
            external
            target="_blank"
            class="link"
          >
            {{ $t('Gratuité et modalités de réutilisation des informations publiques') }}
          </CdataLink>
          {{ $t('et') }}
          <CdataLink
            href="https://www.legifrance.gouv.fr/affichTexte.do;jsessionid=70F06FAFE42AB53A449EF2AE222183BF.tplgfr23s_1?cidTexte=JORFTEXT000033202746&categorieLien=id"
            external
            target="_blank"
            class="link"
          >
            {{ $t('République numérique') }}
          </CdataLink>
          {{ $t('désormais codifiées dans le') }}
          <CdataLink
            href="https://www.legifrance.gouv.fr/affichCode.do?cidTexte=LEGITEXT000031366350&dateTexte=vig"
            external
            target="_blank"
            class="link"
          >
            {{ $t('Code des relations entre le public et l\u2019administration') }}
          </CdataLink>
          {{ $t(', puise en partie ses fondements dans le droit d\u2019accès aux documents administratifs, institué par') }}
          <CdataLink
            href="https://www.legifrance.gouv.fr/jo_pdf.do?id=JORFTEXT000000339241"
            external
            target="_blank"
            class="link"
          >
            {{ $t('la loi CADA en 1978') }}
          </CdataLink>{{ $t('. La loi CADA permet aux particuliers de demander des documents à l\u2019ensemble des administrations centrales et locales. Ces dernières ont l\u2019obligation d\u2019y répondre, favorablement ou défavorablement.') }}
        </p>

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
              {{ $t('Quand et comment saisir la CADA\u202f?') }}
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
            <CdataLink
              href="https://www.cada.fr/administration/fiches-thematiques"
              target="_blank"
              class="link"
            >
              {{ $t('Fiches thématiques relatives aux documents fréquemment demandés') }}
            </CdataLink>
            (environnement, marchés publics, gestion des collectivités territoriales…)
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TabularExplorer, provideTabularProfile } from '@datagouv/components-next'
import { RiSearchLine } from '@remixicon/vue'
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

const URL_PARAM_MAP: Record<string, string> = {
  administration: 'Administration',
  topic: 'Thème et sous thème',
  tag: 'Mots clés',
  meaning: 'Sens et motivation',
  year: 'Année',
  part: 'Partie',
}

const initialFilters = computed(() => {
  const f: Record<string, { contains?: string, exact?: string }> = {}
  for (const [param, column] of Object.entries(URL_PARAM_MAP)) {
    const val = route.query[param]
    if (val) {
      const value = Array.isArray(val) ? String(val[0]) : val
      if (column === 'Année') {
        f[column] = { exact: value }
      }
      else {
        f[column] = { contains: value }
      }
    }
  }
  return f
})

if (RESOURCE_ID) {
  provideTabularProfile(() => RESOURCE_ID)
}
</script>
