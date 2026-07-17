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
            <h1 class="text-xl font-bold text-gray-900 mb-1">
              {{ advice.Type }} {{ advice['Numéro de dossier'] }}
            </h1>
            <p class="text-sm text-gray-500">
              {{ $t('Séance du') }} {{ formatDate(advice['Séance']) }}
            </p>
          </div>

          <div class="mb-6">
            <p class="text-gray-800 text-sm leading-relaxed">
              {{ advice.Objet }}
            </p>
          </div>

          <div class="border-t pt-6">
            <h2 class="font-semibold text-gray-700 text-sm mb-3">
              {{ $t('Avis complet') }}
            </h2>
            <div class="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
              {{ advice.Avis }}
            </div>
          </div>

          <div class="flex justify-center mt-8">
            <BrandedButton
              :href="SUPPORT_URL"
              new-tab
              color="secondary"
              size="sm"
            >
              {{ $t('Signaler un défaut d\u2019anonymisation') }}
            </BrandedButton>
          </div>
        </div>

        <aside class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {{ $t('Administration') }}
            </h3>
            <CdataLink
              :to="{ path: '/explore/cada', query: { administration: advice.Administration } }"
              class="fr-link"
            >
              {{ advice.Administration }}
            </CdataLink>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {{ $t('Type de consultation') }}
            </h3>
            <CdataLink
              :to="{ path: '/explore/cada', query: { part: advice.Partie } }"
              class="fr-badge fr-badge--sm"
            >
              {{ partLabel }}
            </CdataLink>
          </div>

          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {{ $t('Th\u00e8mes') }}
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

          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
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
            v-if="advice['Mots clés']"
            class="bg-gray-50 rounded-lg p-4"
          >
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
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
      v-else-if="!RESOURCE_ID"
      class="bg-gray-50 rounded-lg p-8 text-center"
    >
      <ClientOnly>
        <p class="text-gray-600">
          {{ $t('La base des avis CADA n\'est pas configurée.') }}
        </p>
      </ClientOnly>
    </div>

    <div
      v-else
      class="bg-gray-50 rounded-lg p-8 text-center"
    >
      <h1 class="text-xl font-bold text-gray-900 mb-2">
        {{ $t('Avis non trouvé') }}
      </h1>
      <p class="text-gray-600">
        {{ $t('L\'avis demandé n\'existe pas ou a été supprimé.') }}
      </p>
      <CdataLink
        to="/explore/cada"
        class="text-blue-600 hover:underline mt-4 inline-block"
      >
        {{ $t('Retour aux résultats') }}
      </CdataLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, BrandedButton } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useTranslation()
const config = useRuntimeConfig()
const route = useRoute()

const RESOURCE_ID = config.public.cadaResourceId
const SUPPORT_URL = 'https://support.data.gouv.fr'

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

const { data: advice, status } = await useAsyncData(
  `cada-advice-${adviceId.value}`,
  async () => {
    const baseUrl = config.public.tabularApiUrl
    try {
      const response = await $fetch<{ data: CadaRow[] }>(
        `${baseUrl}/api/resources/${RESOURCE_ID}/data/?Num%C3%A9ro%20de%20dossier__exact=${adviceId.value}`,
      )
      return response.data[0] ?? null
    }
    catch {
      return null
    }
  },
)

const partLabel = computed(() => {
  if (!advice.value) return ''
  return PART_LABELS[advice.value.Partie.trim()] ?? advice.value.Partie
})

const themeParts = computed(() => {
  if (!advice.value || !advice.value['Th\u00e8me et sous th\u00e8me']) return []
  return advice.value['Th\u00e8me et sous th\u00e8me'].split(/,\s*/).map(s => s.trim()).filter(Boolean)
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

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }
  catch {
    return dateStr
  }
}

function meaningClass(meaning: string): string {
  const lower = meaning.toLowerCase()
  if (lower.includes('d\u00e9favorable') || lower.includes('refus')) return 'fr-badge--error'
  if (lower.includes('favorable') || lower.includes('recommande')) return 'fr-badge--success'
  return 'fr-badge--warning'
}
</script>
