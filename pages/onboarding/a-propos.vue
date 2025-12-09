<template>
  <div>
    <!-- Hero Section -->
    <OnboardingHero color="primary">
      <template #title>
        {{ $t('À propos de data.gouv.fr') }}
      </template>
      <template #subtitle>
        {{ $t('data.gouv.fr assure la mise à disposition des données en organisant leur diffusion et leur exploitation.') }}
      </template>
    </OnboardingHero>

    <!-- Section: Qu'est ce que data.gouv.fr ? -->
    <OnboardingSection>
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold text-gray-title mb-4">
          {{ $t('Qu\'est ce que data.gouv.fr ?') }}
        </h2>
        <p class="text-gray-plain mb-4">
          {{ $t('data.gouv.fr est la') }}
          <strong>{{ $t('plateforme ouverte et communautaire des données publiques françaises.') }}</strong>
        </p>
        <p class="text-gray-plain mb-4">
          {{ $t('Elle centralise et structure les données produites par les administrations afin de les rendre accessibles, réutilisables et compréhensibles par tous.') }}
        </p>
        <p class="text-gray-plain mb-4">
          {{ $t('En facilitant la diffusion des données, nous nous efforçons de contribuer à renforcer la transparence, améliorer l\'action publique et encourager la création de nouveaux services.') }}
        </p>
        <p class="text-gray-plain mb-4">
          {{ $t('Sur data.gouv.fr, vous trouverez :') }}
        </p>
        <ul class="list-disc list-inside text-gray-plain mb-8 space-y-2">
          <li>{{ $t('des jeux de données publiés par l\'ensemble des administrations, mais aussi par la société civile ;') }}</li>
          <li>{{ $t('des réutilisations qui montrent comment ces données peuvent servir à analyser un sujet, créer un outil ou comprendre un phénomène ;') }}</li>
          <li>{{ $t('une communauté qui échangent et partagent leurs travaux.') }}</li>
        </ul>

        <!-- Audience cards -->
        <div class="border-t border-gray-default pt-8">
          <p class="text-xs text-gray-low uppercase tracking-wide mb-6">
            {{ $t('À QUI S\'ADRESSE DATA.GOUV.FR ?') }}
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <OnboardingAudienceCard
              :title="$t('Producteurs de données')"
              :description="$t('À celles et ceux qui produisent des données et souhaitent les rendre accessibles.')"
              :icon="RiBuildingLine"
            />
            <OnboardingAudienceCard
              :title="$t('Réutilisateurs de données')"
              :description="$t('À celles et ceux qui exploitent des données et qui veulent partager leurs réalisations.')"
              :icon="RiLineChartLine"
            />
            <OnboardingAudienceCard
              :title="$t('Citoyens curieux')"
              :description="$t('À toute personne qui souhaite découvrir des données ou trouver une information.')"
              :icon="RiSearchLine"
            />
          </div>
        </div>
      </div>
    </OnboardingSection>

    <!-- Section: Notre mission -->
    <OnboardingSection background="gray">
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold text-gray-title mb-4">
          {{ $t('Notre mission') }}
        </h2>
        <p class="text-gray-plain mb-4">
          {{ $t('Notre mission est de simplifier l\'accès aux données publiques et d\'en favoriser les usages.') }}
        </p>
        <p class="text-gray-plain mb-4">
          {{ $t('Elle se décline en plusieurs objectifs et en') }}
          <CdataLink
            href="/impact"
            class="text-new-primary underline"
          >
            {{ $t('indicateurs d\'impact') }}
          </CdataLink>
          {{ $t('qui permettent d\'en suivre la progression :') }}
        </p>
        <ol class="list-decimal list-inside text-gray-plain space-y-2">
          <li>{{ $t('Faciliter la découvrabilité des données publiques') }}</li>
          <li>{{ $t('Améliorer la qualité des données publiques') }}</li>
          <li>{{ $t('Encourager la réutilisation des données publiques') }}</li>
          <li>{{ $t('Faciliter l\'accès à l\'information') }}</li>
        </ol>
      </div>
    </OnboardingSection>

    <!-- Section: Qui est derrière data.gouv.fr ? -->
    <OnboardingSection>
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold text-gray-title mb-4">
          {{ $t('Qui est derrière data.gouv.fr ?') }}
        </h2>
        <p class="text-gray-plain mb-4">
          {{ $t('Nous sommes une') }}
          <CdataLink
            href="/team"
            class="text-new-primary underline"
          >
            {{ $t('équipe') }}
          </CdataLink>
          {{ $t('pluridisciplinaire passionnée de données publiques.') }}
        </p>
        <p class="text-gray-plain mb-4">
          {{ $t('Nous travaillons au sein de la') }}
          <CdataLink
            href="https://www.numerique.gouv.fr/"
            external
            class="text-new-primary underline"
          >
            {{ $t('Direction Interministérielle du Numérique') }}
          </CdataLink>{{ $t(', chargée d\'élaborer la stratégie numérique de l\'État et de piloter sa mise en œuvre.') }}
        </p>
        <p class="text-gray-plain">
          {{ $t('Au-delà de la plateforme, nous développons une') }}
          <CdataLink
            href="/infrastructure"
            class="text-new-primary underline"
          >
            {{ $t('infrastructure de la donnée publique') }}
          </CdataLink>
          {{ $t('pensée pour durer et servir l\'intérêt général en construisant des produits qui facilitent l\'accès aux données, organisent leur circulation et facilitent leurs usages.') }}
        </p>
      </div>
    </OnboardingSection>
  </div>
</template>

<script setup lang="ts">
import { RiBuildingLine, RiLineChartLine, RiSearchLine } from '@remixicon/vue'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingAudienceCard from '~/components/Onboarding/OnboardingAudienceCard.vue'
import CdataLink from '~/components/CdataLink.vue'

const { t } = useTranslation()

useSeoMeta({
  title: t('À propos - data.gouv.fr'),
})
</script>
