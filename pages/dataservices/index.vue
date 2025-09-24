<template>
  <div>
    <EditoHeader
      color="purple"
      :title="$t('APIs')"
      :subtitle="$t('Rechercher parmi les {count} APIs sur {site}', {
        count: site.metrics.dataservices,
        site: config.public.title,
      })"
      :placeholder="$t('ex: SIRENE')"
      search-url="/dataservices/search"
      :link-label="$t(`Qu'est-ce qu'une API ?`)"
      :link-url="config.public.guideDataservices"
    />
    <PageShow
      v-if="page"
      :page
      main-color="purple-flat"
    />
    <div class="container flex flex-col sm:flex-row items-center">
      <div class="w-full">
        <div class="max-w-md">
          <div class="font-extrabold text-3xl">
            {{ $t('Administrations, ') }}
          </div>
          <div class="text-3xl">
            {{ $t('simplifiez les démarches administratives grâce aux APIs') }}
          </div>
          <div class="mt-2">
            {{ $t('Retrouvez ici des exemples d’outils et d’accompagnement qui sont à votre disposition afin de simplifier, avec de la donnée, les démarches des citoyens.') }}
          </div>

          <BrandedButton
            color="purple-flat"
            class="mt-8"
            :href="config.public.dataservicesOnboarding"
          >
            {{ $t('En savoir plus') }}
          </BrandedButton>
        </div>
      </div>
      <div class="w-full py-16 grid grid-cols-2 gap-4">
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/book-2.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('La doctrine des APIs') }}
          </div>
          <div class="text-sm text-center">
            {{ $t('Elle précise le cadre d’action et identifie les bonnes pratiques à poursuivre en matière d’usage et d’exposition d’API par les administrations') }}
          </div>
        </div>
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/newspapper.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('Datapass') }}
          </div>
          <div class="text-sm text-center">
            {{ $t(`En tant qu'administration souhaitant diffuser des données restreintes, vous pouvez avoir besoin de délivrer des habilitations aux usagers.`) }}
          </div>
        </div>
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/lightbulb.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('Les bouquets API Entreprise et Particulier') }}
          </div>
          <div class="text-sm text-center">
            {{ $t(`Les bouquets API Entreprise et API Particulier sont conçus pour faire circuler les données administratives entre administrations.`) }}
          </div>
        </div>
        <!-- <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/lightbulb.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('simplifions.data.gouv') }}
          </div>
          <div class="text-sm text-center">
            {{ $t(`Simplifiez les démarches et services des citoyens, entreprises et associations en récupérant pour eux leurs informations administratives.`) }}
          </div>
        </div> -->
        <div class="bg-gray-lowest-2 flex flex-col items-center p-8 space-y-4">
          <nuxt-img
            src="/illustrations/show.svg"
            class="h-20"
          />

          <div class="font-extrabold text-center">
            {{ $t('Un accompagnement humain') }}
          </div>
          <div class="text-sm text-center">
            {{ $t(`N’hésitez pas à contacter le pôle circulation de la donnée de la DINUM, qui est disponible pour vous aider pour toutes vos questions relatives aux APIs. `) }}
          </div>
        </div>
      </div>
    </div>
    <EditoFooter
      color="purple"
      search-url="/dataservices/search"
      :search-label="$t(`Voir toutes les APIs`)"
    />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type Site } from '@datagouv/components-next'
import EditoFooter from '~/components/Pages/EditoFooter.vue'
import EditoHeader from '~/components/Pages/EditoHeader.vue'
import PageShow from '~/components/Pages/PageShow.vue'
import type { Page } from '~/types/pages'

const { t } = await useTranslation()
useSeoMeta({
  title: t('APIs'),
})

const config = useRuntimeConfig()
const route = useRoute()

onMounted(async () => {
  const hasFacets = Object.keys(route.query).some(key =>
    ['q', 'sort', 'is_restricted', 'organization', 'page'].includes(key),
  )

  if (hasFacets) {
    await navigateTo({ path: '/dataservices/search', query: route.query })
  }
})

const { data: site } = await useAPI<Site>('/api/1/site')
const { data: page } = await useAPI<Page>(`/api/1/pages/${site.value.dataservices_page}`)
</script>
