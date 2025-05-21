<template>
  <div>
    <div class="container space-y-6 pb-8">
      <Breadcrumb>
        <BreadcrumbItem
          to="/"
          :external="true"
        >
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ $t('Tableau de bord du site') }}
        </BreadcrumbItem>
      </Breadcrumb>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl text-gray-title  mb-0 font-extrabold">
          {{ $t('Statistiques des 12 derniers mois') }}
        </h1>
        <BrandedButton
          size="xs"
          :icon="RiDownloadLine"
          color="secondary"
        >
          {{ $t('Télécharger les statistiques de trafic au format CSV') }}
        </BrandedButton>
      </div>

      <SimpleBanner type="primary">
        {{ $t('Évolution des statistiques et indicateurs d\'usage de {site} mis à jour quotidiennement.', { site: config.public.title }) }}
      </SimpleBanner>

      <div
        v-if="site"
        class="grid grid-cols-3 gap-4"
      >
        <StatBox
          :title="$t('Visites des jeux de données')"
          :data="site.details_metrics.visit_dataset"
          type="line"
        />
        <StatBox
          :title="$t('Téléchargement des resources')"
          :data="site.details_metrics.download_resource"
          type="line"
        />
      </div>
      <div
        v-if="site"
        class="grid grid-cols-3 gap-4"
      >
        <StatBox
          :title="$t('Jeux de données')"
          :data="site.details_metrics.dataset_metrics"
          type="bar"
          :summary="site.metrics.datasets"
        />
        <StatBox
          :title="$t('Moissoneurs')"
          :data="site.details_metrics.harvest_metrics"
          type="bar"
          :summary="site.metrics.harvesters"
        />
        <StatBox
          :title="$t('Réutilisations')"
          :data="site.details_metrics.reuse_metrics"
          type="bar"
          :summary="site.metrics.reuses"
        />
      </div>
      <div
        v-if="site"
        class="grid grid-cols-3 gap-4"
      >
        <StatBox
          :title="$t('Organisations')"
          :data="site.details_metrics.organization_metrics"
          type="bar"
          :summary="site.metrics.organizations"
        />
        <StatBox
          :title="$t('Utilisateurs')"
          :data="site.details_metrics.user_metrics"
          type="bar"
          :summary="site.metrics.users"
        />
        <StatBox
          :title="$t('Discussions')"
          :data="site.details_metrics.discussion_metrics"
          type="bar"
          :summary="site.metrics.discussions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner, StatBox } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const config = useRuntimeConfig()
const { data: site } = await useAPI('/api/1/site')
</script>
