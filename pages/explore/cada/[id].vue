<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/explore/cada">
        {{ $t('Avis et conseils de la CADA') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Avis {id}', { id: adviceId }) }}
      </BreadcrumbItem>
    </Breadcrumb>

    <AnimatedLoader v-if="status === 'pending'" />

    <template v-else-if="advice">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="mb-6">
            <h1 class="text-2xl font-extrabold text-gray-title mb-2">
              {{ advice.Type }} {{ advice['Numéro de dossier'] }}
            </h1>
            <p class="text-sm text-gray-medium">
              {{ $t('Séance du') }} {{ formatDate(advice['Séance']) }}
            </p>
          </div>

          <div class="mb-6">
            <p class="text-gray-plain text-sm">
              {{ advice.Objet }}
            </p>
          </div>

          <div class="border-t pt-6">
            <h2 class="text-sm font-bold uppercase mb-3">
              {{ $t('Avis complet') }}
            </h2>
            <div class="text-gray-plain whitespace-pre-wrap text-sm">
              {{ advice.Avis }}
            </div>
          </div>

          <div class="flex justify-center mt-8">
            <BrandedButton
              :href="config.public.supportUrl"
              new-tab
              color="secondary"
              size="sm"
            >
              {{ $t('Signaler un défaut d’anonymisation') }}
            </BrandedButton>
          </div>
        </div>

        <aside class="space-y-4">
          <div
            v-if="advice.Administration"
            class="bg-gray-100 rounded-lg p-4"
          >
            <h3 class="text-sm text-gray-500 uppercase mb-2">
              {{ $t('Administration') }}
            </h3>
            <CdataLink
              :to="{ path: '/explore/cada', query: { administration: advice.Administration } }"
              class="fr-link"
            >
              {{ advice.Administration }}
            </CdataLink>
          </div>

          <div
            v-if="partLabel"
            class="bg-gray-100 rounded-lg p-4"
          >
            <h3 class="text-sm text-gray-500 uppercase mb-2">
              {{ $t('Type de consultation') }}
            </h3>
            <CdataLink
              :to="{ path: '/explore/cada', query: { part: advice.Partie } }"
              class="fr-badge fr-badge--sm"
            >
              {{ partLabel }}
            </CdataLink>
          </div>

          <div
            v-if="themeParts.length"
            class="bg-gray-100 rounded-lg p-4"
          >
            <h3 class="text-sm text-gray-500 uppercase mb-2">
              {{ $t('Thèmes') }}
            </h3>
            <div class="flex flex-wrap gap-1.5">
              <CdataLink
                v-for="th in themeParts"
                :key="th"
                :to="{ path: '/explore/cada', query: { topic: th } }"
                class="fr-badge fr-badge--sm"
              >
                {{ th }}
              </CdataLink>
            </div>
          </div>

          <div
            v-if="meanings.length"
            class="bg-gray-100 rounded-lg p-4"
          >
            <h3 class="text-sm text-gray-500 uppercase mb-2">
              {{ $t('Conclusions') }}
            </h3>
            <div class="flex flex-wrap gap-1.5">
              <CdataLink
                v-for="m in meanings"
                :key="m"
                :to="{ path: '/explore/cada', query: { meaning: m } }"
                class="fr-badge fr-badge--sm"
                :class="meaningClass(m)"
              >
                {{ m }}
              </CdataLink>
            </div>
          </div>

          <div
            v-if="tags.length"
            class="bg-gray-100 rounded-lg p-4"
          >
            <h3 class="text-sm text-gray-500 uppercase mb-2">
              {{ $t('Mots-clés') }}
            </h3>
            <div class="flex flex-wrap gap-1.5">
              <CdataLink
                v-for="tag in tags"
                :key="tag"
                :to="{ path: '/explore/cada', query: { tag: tag } }"
                class="fr-badge fr-badge--sm"
              >
                {{ tag }}
              </CdataLink>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <div
      v-else-if="error"
      class="bg-gray-100 rounded-lg p-8 text-center"
    >
      <h1 class="text-2xl font-extrabold text-gray-title mb-2">
        {{ $t('Une erreur est survenue') }}
      </h1>
      <p class="text-gray-medium">
        {{ $t('La base des avis CADA n’a pas pu être interrogée. Réessayez dans quelques instants.') }}
      </p>
    </div>

    <div
      v-else
      class="bg-gray-100 rounded-lg p-8 text-center"
    >
      <h1 class="text-2xl font-extrabold text-gray-title mb-2">
        {{ $t('Avis non trouvé') }}
      </h1>
      <p class="text-gray-medium">
        {{ $t('L\'avis demandé n\'existe pas ou a été supprimé.') }}
      </p>
      <CdataLink
        to="/explore/cada"
        class="link mt-4"
      >
        {{ $t('Retour aux résultats') }}
      </CdataLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, BrandedButton, fetchTabularData, useComponentsConfig, useFormatDate } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const config = useRuntimeConfig()
const componentsConfig = useComponentsConfig()
const route = useRoute()

const RESOURCE_ID = config.public.cadaResourceId

if (!RESOURCE_ID) {
  // Use `showError`, not `throw createError`: throwing rejects the async setup,
  // see the detailed explanation in pages/pages/[...slug].vue.
  showError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

type CadaRow = {
  'Numéro de dossier': number
  'Administration': string
  'Type': string
  'Année': number
  'Séance': string
  'Objet': string
  'Thème et sous thème': string
  'Mots clés': string
  'Sens et motivation': string
  'Partie': string
  'Avis': string
}

const PART_LABELS: Record<string, string> = {
  I: 'Avec audition de l\'administration',
  II: 'Affaire de principe',
  III: 'Affaire courante',
  IV: 'Délégué',
}

const adviceId = computed(() => parseInt(route.params.id as string, 10))

const { data: advice, status, error } = await useAsyncData(
  `cada-advice-${adviceId.value}`,
  async () => {
    const response = await fetchTabularData(componentsConfig, {
      resourceId: RESOURCE_ID,
      filters: {
        _cls: 'Filter',
        column: 'Numéro de dossier',
        condition: 'exact',
        value: String(adviceId.value),
      },
    })
    return (response.data[0] as CadaRow | undefined) ?? null
  },
  { immediate: Boolean(RESOURCE_ID) },
)

const partLabel = computed(() => {
  if (!advice.value?.Partie) return ''
  return PART_LABELS[advice.value.Partie.trim()] ?? advice.value.Partie
})

const themeParts = computed(() => {
  if (!advice.value || !advice.value['Thème et sous thème']) return []
  return advice.value['Thème et sous thème'].split(/,\s*/).map(s => s.trim()).filter(Boolean)
})

const meanings = computed(() => {
  if (!advice.value || !advice.value['Sens et motivation']) return []
  return advice.value['Sens et motivation'].split(',').map(s => s.trim()).filter(Boolean)
})

const tags = computed(() => {
  if (!advice.value || !advice.value['Mots clés']) return []
  return advice.value['Mots clés'].split(',').map(s => s.trim()).filter(Boolean)
})

useSeoMeta({
  title: () => t('Avis CADA {id}', { id: adviceId.value }),
  description: () => advice.value ? advice.value.Objet : t('Avis non trouvé'),
})

defineOgImage('MainPage.takumi', {
  title: t('Avis CADA'),
  uri: `/explore/cada/${adviceId.value}`,
})

function meaningClass(meaning: string): string {
  const lower = meaning.toLowerCase()
  if (lower.includes('défavorable') || lower.includes('refus')) return 'fr-badge--error'
  if (lower.includes('favorable') || lower.includes('recommande')) return 'fr-badge--success'
  return 'fr-badge--warning'
}
</script>
