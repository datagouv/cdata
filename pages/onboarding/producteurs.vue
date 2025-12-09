<template>
  <div>
    <!-- Hero Section -->
    <OnboardingHero color="primary">
      <template #title>
        {{ $t('La plateforme nationale pour publier et valoriser vos données') }}
      </template>
      <template #subtitle>
        {{ $t('Administrations, collectivités, entreprises : rejoignez plus de 5 000 organisations, publiez vos données simplement et gratuitement, tout en respectant vos obligations légales et en les valorisant auprès de milliers d\'utilisateurs.') }}
      </template>
      <template #actions>
        <BrandedButton
          color="white-flat"
          class="text-new-blue-illustration"
          href="/datasets/new"
        >
          {{ $t('Publier vos données') }}
        </BrandedButton>
      </template>
    </OnboardingHero>

    <!-- Section: Valorisez et partagez vos données simplement -->
    <OnboardingSection>
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold text-gray-title mb-4">
          {{ $t('Valorisez et partagez vos données simplement') }}
        </h2>
        <p class="text-gray-plain mb-4">
          {{ $t('Une plateforme') }}
          <strong>{{ $t('simple, gratuite et ouverte à tous') }}</strong>
          {{ $t('pour diffuser vos données dans les meilleures conditions.') }}
        </p>
        <p class="text-gray-plain mb-8">
          {{ $t('En rendant vos données accessibles, vous respectez vos obligations, vous améliorez la qualité de l\'information publique, soutenez la création de nouveaux services et renforcez l\'efficacité des politiques publiques.') }}
        </p>
      </div>

      <!-- Logo grid -->
      <OnboardingLogoGrid :label="$t('ILS PUBLIENT DES DONNÉES SUR DATA.GOUV.FR')">
        <NuxtImg
          v-for="logo in producerLogos"
          :key="logo.name"
          :src="`/nuxt_images/onboarding/logo-${logo.name}.png`"
          :alt="logo.label"
          class="h-10 md:h-12 object-contain"
        />
      </OnboardingLogoGrid>
    </OnboardingSection>

    <!-- Section: Tout ce dont vous avez besoin -->
    <OnboardingSection
      :title="$t('Tout ce dont vous avez besoin pour publier des données de qualité et favoriser leur réutilisation')"
      background="gray"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <OnboardingFeatureCard
          :title="$t('Explorateur de données')"
          :description="$t('L\'Explorateur permet de visualiser et contrôler vos données directement en ligne. Il facilite leur compréhension et contribue à mieux les valoriser auprès des réutilisateurs.')"
          image="/nuxt_images/onboarding/explorer.png"
        />
        <OnboardingFeatureCard
          :title="$t('API automatique')"
          :description="$t('Vos données tabulaires sont automatiquement exposées via une API prête à l\'emploi. Cela simplifie leur intégration dans des services tiers et augmente leur réutilisation.')"
          image="/nuxt_images/onboarding/api.png"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <OnboardingFeatureCard
          :title="$t('Discussions')"
          :description="$t('Chaque jeu de données dispose d\'un espace de discussions. Vous recevez des retours utiles pour corriger, compléter ou améliorer vos publications.')"
          image="/nuxt_images/onboarding/discussions.png"
        />
        <OnboardingFeatureCard
          :title="$t('Schéma de données')"
          :description="$t('Les schémas vous aident à structurer vos données selon des formats standardisés. Ils garantissent une meilleure qualité et une meilleure interopérabilité.')"
          image="/nuxt_images/onboarding/schema.png"
        />
        <OnboardingFeatureCard
          :title="$t('Suivi des statistiques')"
          :description="$t('Un tableau de bord dédié vous indique visites, téléchargements et réutilisations. Vous pouvez ainsi mesurer l\'impact de vos données et valoriser votre travail.')"
          image="/nuxt_images/onboarding/stats.png"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OnboardingFeatureCard
          :title="$t('Score de qualité des métadonnées')"
          :description="$t('datagouv analyse vos métadonnées et signale les points à améliorer pour vous aider à rendre vos données plus complètes, visibles et facilement réutilisables.')"
          image="/nuxt_images/onboarding/quality.png"
        />
        <OnboardingFeatureCard
          :title="$t('Moissonnage des données')"
          :description="$t('Synchronisez votre portail existant pour republier automatiquement vos données. Vous diffusez ainsi votre catalogue sans double saisie et sans effort supplémentaire.')"
          image="/nuxt_images/onboarding/harvest.png"
        />
        <OnboardingFeatureCard
          :title="$t('Référencement de données restreintes')"
          :description="$t('Vous pouvez référencer des données en accès restreint pour raison légale et spécifier les publics éligibles et les modalités d\'habilitations.')"
          image="/nuxt_images/onboarding/restricted.png"
        />
      </div>
    </OnboardingSection>

    <!-- CTA Section -->
    <OnboardingCTA color="primary">
      <template #title>
        {{ $t('Commencez dès maintenant à publier des données') }}
      </template>
      <template #actions>
        <BrandedButton
          color="white-flat"
          class="text-new-blue-illustration"
          href="/datasets/new"
        >
          {{ $t('Publier vos données') }}
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
  title: t('Producteurs de données - data.gouv.fr'),
})

const producerLogos = [
  { name: 'ina', label: 'INA' },
  { name: 'sncf', label: 'SNCF' },
  { name: 'santepubliquefrance', label: 'Santé publique France' },
  { name: 'ign', label: 'IGN' },
  { name: 'insee', label: 'INSEE' },
  { name: 'minint', label: 'Ministère de l\'Intérieur' },
  { name: 'ademe', label: 'ADEME' },
  { name: 'lambersart', label: 'Ville de Lambersart' },
]
</script>
