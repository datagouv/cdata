<template>
  <div>
    <EditoHeader
      color="green"
      :title="$t('Réutilisations')"
      :subtitle="$t('Rechercher parmi les {count} réutilisations sur {site}', {
        count: site.metrics.reuses,
        site: config.public.title,
      })"
      :placeholder="$t('Rechercher une réutilisation de données')"
      search-url="/reuses/search"
      :link-label="$t(`Qu'est-ce qu'une réutilisation ?`)"
      :link-url="config.public.guideReuses"
    >
      <ul class="flex flex-wrap gap-3 list-none pl-0">
        <li
          v-for="topic in topics"
          :key="topic.id"
        >
          <CdataLink
            class="bg-white/10 text-white rounded-md px-2 py-1 text-lg fr-raw-link"
            :href="`/reuses/search?topic=${topic.id}`"
          >
            {{ topic.label }}
          </CdataLink>
        </li>
      </ul>
    </EditoHeader>
    <PageShow
      v-if="page"
      :page
    />
    <div class="overflow-hidden container flex flex-col md:flex-row items-center py-16 md:py-0">
      <div class="w-full">
        <div class="max-w-md">
          <div class="font-extrabold text-3xl">
            {{ $t('Quelques cas d’usages d’utilisation de données') }}
          </div>
          <div class="mt-2">
            {{ $t(`Retrouvez ici des exemples de cas d'usage des données sélectionnés par l'équipe data.gouv.fr.`) }}
          </div>

          <BrandedButton
            color="green-flat"
            class="mt-8 w-full md:w-auto"
            :href="config.public.reusesOnboardingUsecases"
          >
            {{ $t(`Voir les cas d'usage`) }}
          </BrandedButton>
        </div>
      </div>
      <div class="w-full grid grid-cols-3 gap-x-2.5 md:-my-10">
        <div class="flex flex-col space-y-3 justify-center">
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/bikelane.svg"
                class="w-12"
              />
            </div>
            <p class="font-extrabold text-gray-title text-center mb-0">
              {{ $t(`Connaître le patrimoine arboré des communes`) }}
            </p>
          </div>
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/house.svg"
                class="w-12"
              />
            </div>
            <p class="font-extrabold text-gray-title text-center mb-0">
              {{ $t(`Connaître le prix de vente des biens immobiliers`) }}
            </p>
          </div>
        </div>
        <div class="flex flex-col space-y-3 justify-center">
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/business.svg"
                class="w-12"
              />
            </div>
            <p class="font-extrabold text-gray-title text-center mb-0">
              {{ $t(`Identifier les entreprises en difficulté`) }}
            </p>
          </div>
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/heart.svg"
                class="w-12"
              />
            </div>
            <p class="font-extrabold text-gray-title text-center mb-0">
              {{ $t(`Localiser précisément les interventions`) }}
            </p>
          </div>
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/briefcase.svg"
                class="w-12"
              />
            </div>
            <p class="font-extrabold text-gray-title text-center mb-0">
              {{ $t(`Proposer un parcours d'orientation`) }}
            </p>
          </div>
        </div>
        <div class="flex flex-col space-y-3 justify-center">
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/pin.svg"
                class="w-12"
              />
            </div>
            <p class="font-extrabold text-gray-title text-center mb-0">
              {{ $t(`Réaliser l'état des risques d'un bien immobilier`) }}
            </p>
          </div>
          <div class="bg-gray-lowest-2 flex flex-col items-center px-5 py-12 space-y-4">
            <div class=" flex items-center justify-center size-20 bg-white rounded-full">
              <nuxt-img
                src="/illustrations/truck.svg"
                class="w-12"
              />
            </div>
            <p class="font-extrabold text-gray-title text-center mb-0">
              {{ $t(`Gérer simplement une exploitation agricole`) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <EditoFooter
      color="green"
      search-url="/reuses/search"
      :search-label="$t(`Voir toutes les réutilisations`)"
    />
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type ReuseTopic, type Site } from '@datagouv/components-next'
import CdataLink from '~/components/CdataLink.vue'
import EditoFooter from '~/components/Pages/EditoFooter.vue'
import EditoHeader from '~/components/Pages/EditoHeader.vue'
import PageShow from '~/components/Pages/PageShow.vue'
import type { Page } from '~/types/pages'

const { t } = await useTranslation()
useSeoMeta({
  title: t('Réutilisations'),
})

const config = useRuntimeConfig()
const route = useRoute()

onMounted(async () => {
  const hasFacets = Object.keys(route.query).some(key =>
    ['q', 'sort', 'tag', 'topic', 'page'].includes(key),
  )

  if (hasFacets) {
    await navigateTo({ path: '/reuses/search', query: route.query })
  }
})

const { data: topics } = await useAPI<Array<ReuseTopic>>('/api/1/reuses/topics/')

const { data: site } = await useAPI<Site>('/api/1/site')
const { data: page } = await useAPI<Page>(`/api/1/pages/${site.value.reuses_page}`)
</script>
