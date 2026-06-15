<template>
  <div>
    <OnboardingHero
      color="primary"
      image="/nuxt_images/ouvertures.svg"
      image-position="right"
    >
      <template #title>
        {{ $t('Suivre les ouvertures et mises à disposition de données publiques') }}
      </template>
      <template #subtitle>
        {{ $t('Les données publiques peuvent être mises à disposition sous différentes formes : en open data, en accès restreint ou selon des modalités particulières de consultation et de réutilisation.') }}
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <div class="max-w-4xl mb-12">
        <OnboardingParagraph>
          {{ $t('Cette rubrique permet de suivre les ouvertures de données annoncées, les demandes en cours, ainsi que les modalités d\'accès associées.') }}
        </OnboardingParagraph>
      </div>

      <OnboardingTitle class="mb-8">
        {{ $t('Voir les différentes catégories de données') }}
      </OnboardingTitle>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <LinkCard
          v-for="category in categories"
          :key="category.title"
          :to="category.to"
          :external="category.external"
          class="flex flex-col p-6"
        >
          <h3 class="text-lg font-bold leading-normal text-gray-title mb-2">
            {{ category.title }}
          </h3>
          <p class="text-base font-normal leading-normal text-gray-plain flex-1 mb-4">
            {{ category.description }}
          </p>
          <component
            :is="category.external ? RiExternalLinkLine : RiArrowRightLine"
            aria-hidden="true"
            class="size-4 text-new-primary self-end mt-auto"
          />
        </LinkCard>
      </div>
    </OnboardingSection>
  </div>
</template>

<script setup lang="ts">
import { RiArrowRightLine, RiExternalLinkLine } from '@remixicon/vue'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingParagraph from '~/components/Onboarding/OnboardingParagraph.vue'
import OnboardingTitle from '~/components/Onboarding/OnboardingTitle.vue'
import LinkCard from '~/components/LinkCard.vue'

const config = useRuntimeConfig()
const { t } = useTranslation()

useSeoMeta({
  title: t('Suivi des ouvertures de données publiques - {site}', { site: config.public.title }),
  description: t('Suivez les ouvertures de données publiques annoncées, les demandes en cours, ainsi que les modalités d\'accès associées.'),
})
defineOgImage('MainPage.takumi', {
  title: 'Ouvertures de données',
  uri: '/ouvertures',
})

const categories = [
  {
    title: t('Demandes d\'ouvertures et engagements ministériels'),
    description: t('Suivre les prochaines publications de données ouvertes ou restreintes ainsi que les engagements ministériels en matière de données.'),
    to: '/ouvertures/suivi',
    external: false,
  },
  {
    title: t('Données de forte valeur'),
    description: t('Suivi de l\'ouverture de données de forte valeur identifiées par la Commission européenne.'),
    to: config.public.ouverturesHvdUrl,
    external: true,
  },
]
</script>
