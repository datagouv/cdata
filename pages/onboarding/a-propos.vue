<template>
  <div>
    <OnboardingHero color="dark">
      <template #title>
        {{ $t('À propos de {site}', { site: config.public.title }) }}
      </template>
      <template #subtitle>
        {{ $t('{site} assure la mise à disposition des données en organisant leur diffusion et leur exploitation.', { site: config.public.title }) }}
      </template>
    </OnboardingHero>

    <OnboardingSection>
      <div class="max-w-[950px]">
        <OnboardingTitle class="mb-4">
          {{ $t('Qu\'est ce que {site} ?', { site: config.public.title }) }}
        </OnboardingTitle>
        <OnboardingParagraph class="mb-4">
          {{ $t('{site} est la', { site: config.public.title }) }}
          <strong>{{ $t('plateforme ouverte et communautaire des données publiques françaises.') }}</strong>
        </OnboardingParagraph>
        <OnboardingParagraph class="mb-4">
          {{ $t('Elle centralise et structure les données produites par les administrations afin de les rendre accessibles, réutilisables et compréhensibles par tous.') }}
        </OnboardingParagraph>
        <OnboardingParagraph class="mb-4">
          {{ $t('En facilitant la diffusion des données, nous nous efforçons de contribuer à renforcer la transparence, améliorer l\'action publique et encourager la création de nouveaux services.') }}
        </OnboardingParagraph>
        <OnboardingParagraph class="mb-4">
          {{ $t('Sur {site}, vous trouverez :', { site: config.public.title }) }}
        </OnboardingParagraph>
        <ul class="list-disc list-inside text-2xl font-light leading-normal text-black mb-8 space-y-2">
          <li>{{ $t('des jeux de données publiés par l\'ensemble des administrations, mais aussi par la société civile ;') }}</li>
          <li>{{ $t('des réutilisations qui montrent comment ces données peuvent servir à analyser un sujet, créer un outil ou comprendre un phénomène ;') }}</li>
          <li>{{ $t('une communauté qui échange et partage ses travaux.') }}</li>
        </ul>
      </div>

      <div class="pt-8">
        <SmallCapsLabel class="mb-6">
          {{ $t('À qui s\'adresse {site} ?', { site: config.public.title }) }}
        </SmallCapsLabel>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <OnboardingAudienceCard
            :title="$t('Producteurs de données')"
            :description="$t('À celles et ceux qui produisent des données et souhaitent les rendre accessibles.')"
            :icon="RiGovernmentLine"
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
    </OnboardingSection>

    <OnboardingSection background="gray">
      <OnboardingTitle class="mb-4">
        {{ $t('Notre mission') }}
      </OnboardingTitle>
      <OnboardingParagraph class="mb-4">
        {{ $t("Notre mission est de simplifier l'accès aux données publiques et d'en favoriser les usages.") }}
      </OnboardingParagraph>
      <OnboardingParagraph class="mb-4">
        {{ $t('Elle se décline en plusieurs objectifs et en') }}
        <CdataLink
          href="/datasets/indicateurs-dimpact-de-data-gouv-fr/"
          class="text-black underline"
        >
          {{ $t("indicateurs d'impact") }}
        </CdataLink>
        {{ $t("qui permettent d'en suivre la progression :") }}
      </OnboardingParagraph>
      <ol class="list-decimal list-inside text-2xl font-light leading-normal text-black space-y-2 [&_li::marker]:font-light">
        <li>{{ $t('Faciliter la découvrabilité des données publiques') }}</li>
        <li>{{ $t('Améliorer la qualité des données publiques') }}</li>
        <li>{{ $t('Encourager la réutilisation des données publiques') }}</li>
        <li>{{ $t("Faciliter l'accès à l'information") }}</li>
      </ol>
    </OnboardingSection>

    <OnboardingSection>
      <OnboardingTitle class="mb-4">
        {{ $t('Qui est derrière {site} ?', { site: config.public.title }) }}
      </OnboardingTitle>
      <OnboardingParagraph class="mb-4">
        {{ $t('Nous sommes une') }}
        <CdataLink
          href="/products/datagouv?tab=equipe"
          class="text-black underline"
        >
          {{ $t('équipe') }}
        </CdataLink>
        {{ $t('pluridisciplinaire passionnée de données publiques.') }}
      </OnboardingParagraph>
      <OnboardingParagraph class="mb-4">
        {{ $t('Nous travaillons au sein de la') }}
        <CdataLink
          href="https://www.numerique.gouv.fr/"
          external
          class="text-black underline"
        >
          {{ $t('Direction Interministérielle du Numérique') }}
        </CdataLink>{{ $t(", chargée d'élaborer la stratégie numérique de l'État et de piloter sa mise en œuvre.") }}
      </OnboardingParagraph>
      <OnboardingParagraph>
        {{ $t('Au-delà de la plateforme, nous développons une') }}
        <CdataLink
          href="/products"
          class="text-black underline"
        >
          {{ $t('infrastructure de la donnée publique') }}
        </CdataLink>
        {{ $t("pensée pour durer et servir l'intérêt général en construisant des produits qui facilitent l'accès aux données, organisent leur circulation et facilitent leurs usages.") }}
      </OnboardingParagraph>
    </OnboardingSection>
  </div>
</template>

<script setup lang="ts">
import { RiGovernmentLine, RiLineChartLine, RiSearchLine } from '@remixicon/vue'
import OnboardingHero from '~/components/Onboarding/OnboardingHero.vue'
import OnboardingSection from '~/components/Onboarding/OnboardingSection.vue'
import OnboardingAudienceCard from '~/components/Onboarding/OnboardingAudienceCard.vue'
import OnboardingParagraph from '~/components/Onboarding/OnboardingParagraph.vue'
import OnboardingTitle from '~/components/Onboarding/OnboardingTitle.vue'
import SmallCapsLabel from '~/components/Onboarding/SmallCapsLabel.vue'
import CdataLink from '~/components/CdataLink.vue'

const config = useRuntimeConfig()
const { t } = useTranslation()

useSeoMeta({
  title: t('À propos - {site}', { site: config.public.title }),
})
</script>
