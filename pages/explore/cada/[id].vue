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

    <LoadingBlock
      :status="status"
      :data="advice"
    >
      <template #default="{ data: advice }">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div class="mb-6">
              <h1 class="text-2xl font-extrabold text-gray-title mb-2">
                {{ advice.Type }} {{ advice['Numéro de dossier'] }}
              </h1>
              <p class="text-sm text-gray-medium">
                {{ $t('Séance du') }} <FormattedDate :date="advice['Séance']" />
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

            <div class="mt-8">
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
                class="link"
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
                  :class="cadaMeaningBadgeClass(m)"
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

      <template #error>
        <div class="bg-gray-100 rounded-lg p-8 text-center">
          <h1 class="text-2xl font-extrabold text-gray-title mb-2">
            {{ $t('Une erreur est survenue') }}
          </h1>
          <p class="text-gray-medium">
            {{ $t('La base des avis CADA n’a pas pu être interrogée. Réessayez dans quelques instants.') }}
          </p>
        </div>
      </template>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, fetchTabularData, FormattedDate, LoadingBlock, useComponentsConfig } from '@datagouv/components-next'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

// The id is a `Numéro de dossier` and nothing else. Without this, a slug suffix
// or a leading zero would serve the same advice under a non-canonical URL, and a
// non-numeric segment would reach the API as `NaN` — answering 200 with the
// error block instead of a 404.
definePageMeta({
  validate: route => /^[1-9]\d*$/.test(route.params.id as string),
})

const { t } = useTranslation()
const config = useRuntimeConfig()
const componentsConfig = useComponentsConfig()
const route = useRoute()

const RESOURCE_ID = config.public.cadaResourceId

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

const adviceId = computed(() => Number(route.params.id))

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

// An advice that does not exist — or a CADA base that is not configured — is a
// real 404. Use `showError`, not `throw createError`: throwing rejects the async
// setup, see the detailed explanation in pages/pages/[...slug].vue.
if (!error.value && !advice.value) {
  showError({ statusCode: 404, statusMessage: 'Page Not Found' })
}

const partLabel = computed(() => cadaPartLabel(advice.value?.Partie))
const themeParts = computed(() => splitCadaValues(advice.value?.['Thème et sous thème']))
const meanings = computed(() => splitCadaValues(advice.value?.['Sens et motivation']))
const tags = computed(() => splitCadaValues(advice.value?.['Mots clés']))

useSeoMeta({
  title: () => t('Avis CADA {id}', { id: adviceId.value }),
  description: () => advice.value ? advice.value.Objet : t('Avis non trouvé'),
})

defineOgImage('MainPage.takumi', {
  title: t('Avis CADA'),
  uri: `/explore/cada/${adviceId.value}`,
})
</script>
