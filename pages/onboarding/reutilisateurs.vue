<template>
  <div>
    <!-- Hero Section -->
    <OnboardingHero color="primary">
      <template #title>
        {{ $t('Trouvez les données dont vous avez besoin et partagez vos travaux avec la communauté') }}
      </template>
      <template #subtitle>
        {{ $t('Des milliers de données publiques, accessibles gratuitement, pour analyser, créer, développer et comprendre.') }}
      </template>
      <template #actions>
        <BrandedButton
          color="secondary"
          href="/datasets"
        >
          {{ $t('Trouver des données') }}
        </BrandedButton>
        <BrandedButton
          color="white-flat"
          class="text-new-blue-illustration"
          href="/reuses/new"
        >
          {{ $t('Publier votre réutilisation') }}
        </BrandedButton>
      </template>
    </OnboardingHero>

    <!-- Section: Accédez facilement aux données publiques -->
    <OnboardingSection>
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold text-gray-title mb-4">
          {{ $t('Accédez facilement aux données publiques') }}
        </h2>
        <p class="text-gray-plain mb-4">
          {{ $t('Que vous soyez entrepreneur, chercheur, journaliste, agent public ou citoyen,') }}
          <strong>{{ $t('accédez gratuitement à des milliers de données fiables') }}</strong>
          {{ $t("publiées par l'ensemble des administrations françaises.") }}
        </p>
        <p class="text-gray-plain mb-8">
          <strong>{{ $t('Partagez vos travaux') }}</strong>
          {{ $t('pour gagner en visibilité, recevoir des retours de la communauté, échanger avec les producteurs de données et inspirer les autres utilisateurs.') }}
        </p>
      </div>

      <!-- Logo grid -->
      <OnboardingLogoGrid :label="$t('ILS RÉUTILISENT LES DONNÉES DE DATA.GOUV.FR')">
        <NuxtImg
          v-for="logo in reuserLogos"
          :key="logo.name"
          :src="`/nuxt_images/onboarding/logo-${logo.name}.png`"
          :alt="logo.label"
          class="h-10 md:h-12 object-contain"
        />
      </OnboardingLogoGrid>
    </OnboardingSection>

    <!-- Section: Tout ce qu'il vous faut -->
    <OnboardingSection
      :title="$t('Tout ce qu\'il vous faut pour explorer et réutiliser les données publiques')"
      background="gray"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <OnboardingFeatureCard
          :title="$t('Explorateur de données')"
          :description="$t('Permet de visualiser la structure d\'un jeu de données, d\'explorer ses colonnes et de vérifier rapidement s\'il correspond à votre besoin.')"
          image="/nuxt_images/onboarding/explorer.png"
        />
        <OnboardingFeatureCard
          :title="$t('API automatique')"
          :description="$t('Chaque jeu de données tabulaire dispose d\'une API prête à l\'emploi pour intégrer facilement les données dans vos scripts, analyses ou applications.')"
          image="/nuxt_images/onboarding/api.png"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OnboardingFeatureCard
          :title="$t('Discussions')"
          :description="$t('Posez vos questions, obtenez des précisions ou échangez avec les producteurs et autres réutilisateurs pour mieux comprendre les données.')"
          image="/nuxt_images/onboarding/discussions.png"
        />
        <OnboardingFeatureCard
          :title="$t('Suivi des statistiques')"
          :description="$t('Suivez les visites et téléchargements de votre réutilisation pour mesurer son impact et valoriser votre travail auprès de la communauté.')"
          image="/nuxt_images/onboarding/stats.png"
        />
        <OnboardingFeatureCard
          :title="$t('Défis et ressources pédagogiques')"
          :description="$t('Accédez à des guides et exercices pour apprendre à manipuler les données et découvrir de nouveaux usages.')"
          image="/nuxt_images/onboarding/guides.png"
        />
      </div>
    </OnboardingSection>

    <!-- CTA Section -->
    <OnboardingCTA color="primary">
      <template #title>
        {{ $t('Partagez dès maintenant vos réutilisations') }}
      </template>
      <template #actions>
        <BrandedButton
          color="white-flat"
          class="text-new-blue-illustration"
          href="/reuses/new"
        >
          {{ $t('Publier votre réutilisation') }}
        </BrandedButton>
      </template>
    </OnboardingCTA>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingFeatureCard from '~/components/Onboarding/OnboardingFeatureCard.vue'
import OnboardingLogoGrid from '~/components/Onboarding/OnboardingLogoGrid.vue'
import OnboardingCTA from '~/components/Onboarding/OnboardingCTA.vue'

const { t } = useTranslation()

useSeoMeta({
  title: t('Réutilisateurs de données - data.gouv.fr'),
})

const reuserLogos = [
  { name: 'infoclimat', label: 'Infoclimat' },
  { name: 'maif', label: 'MAIF' },
  { name: 'blablacar', label: 'BlaBlaCar' },
  { name: 'lemonde', label: 'Le Monde' },
  { name: 'pappers', label: 'Pappers' },
  { name: 'googlemaps', label: 'Google Maps' },
  { name: 'meilleursagents', label: 'Meilleurs Agents' },
  { name: 'wikimedia', label: 'Wikimedia' },
]
</script>
