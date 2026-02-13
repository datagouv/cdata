<template>
  <div>
    <OnboardingHero
      color="primary"
      image="/nuxt_images/elections.svg"
      :image-alt="$t('Illustration élections')"
    >
      <template #title>
        {{ $t('Les données relatives aux élections') }}
      </template>
      <template #subtitle>
        {{ $t('Cette rubrique rassemble les principaux jeux de données par type de scrutin : municipales, législatives, présidentielles, etc.') }}
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <div class="max-w-4xl mb-8">
        <p class="text-sm font-light leading-normal mb-4">
          {{ $t('Retrouvez l\'ensemble des données électorales publiées par l\'État et les organisations compétentes, pour vous permettre de :') }}
        </p>
        <ul class="list-disc pl-5 space-y-2 mb-8 text-sm font-light leading-normal">
          <li>
            <strong class="font-bold">{{ $t('Analyser les tendances par type d\'élection') }}</strong>{{ $t(', pour vos projets, articles ou recherches') }}
          </li>
          <li>
            <strong class="font-bold">{{ $t('Croiser les données électorales') }}</strong>{{ $t(' avec d\'autres jeux de données territoriales') }}
          </li>
          <li>
            <strong class="font-bold">{{ $t('Suggérer l\'ouverture de données') }}</strong>{{ $t(' associées à des thématiques') }}
          </li>
        </ul>

        <p class="text-sm font-light leading-normal">
          {{ $t('Sélectionnez un scrutin pour accéder aux jeux de données disponibles.') }}
        </p>
      </div>

      <div class="space-y-4">
        <ElectionCard
          v-for="election in elections"
          :key="election.slug"
          :title="election.title"
          :description="election.description"
          :to="election.to"
          :image="election.image"
        />
      </div>
    </OnboardingSection>
  </div>
</template>

<script setup lang="ts">
import ElectionCard from '~/components/Elections/ElectionCard.vue'

const config = useRuntimeConfig()
const { t } = useTranslation()

useSeoMeta({
  title: t('Données élections - {site}', { site: config.public.title }),
  robots: 'noindex, nofollow',
})

const elections = [
  {
    slug: 'municipales',
    title: t('Données des élections municipales'),
    description: t('Cette page rassemble toutes les données relatives aux élections municipales : résultats par bureau de vote, informations sur les élus et toutes les données utiles permettant de comprendre les enjeux propres aux communes.'),
    to: '/posts/jeux-de-donnees-liees-aux-elections-municipales',
    image: '/nuxt_images/municipales.png',
  },
  {
    slug: 'legislatives',
    title: t('Données des élections législatives'),
    description: t('Cette page rassemble l\'ensemble des données relatives aux élections législatives : résultats par circonscription, nuances politiques et toutes les données permettant de saisir les enjeux propres à la représentation des territoires à l\'Assemblée nationale.'),
    to: '/posts/donnees-liees-aux-elections-legislatives',
    image: '/nuxt_images/legislative.png',
  },
  {
    slug: 'presidentielles',
    title: t('Données des élections présidentielles'),
    description: t('Cette page permet d\'accéder aux différentes données des élections présidentielles : résultats par tour, séries historiques, etc., ainsi que les données pertinentes pour analyser les dynamiques politiques à l\'échelle nationale.'),
    to: '/posts/donnees-liees-aux-elections-presidentielles',
    image: '/nuxt_images/presidentielles.png',
  },
  {
    slug: 'autres',
    title: t('Autres données des élections'),
    description: t('Cette page rassemble les résultats des autres scrutins (élections sénatoriales, élections européennes...).'),
    to: '/posts/autres-donnees-relatives-aux-elections',
    image: '/nuxt_images/autres.png',
  },
]
</script>
