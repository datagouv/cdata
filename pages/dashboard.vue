<template>
  <div>
    <div class="container pb-8">
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
      <div class="flex justify-between items-center mb-6">
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

      <SimpleBanner
        type="primary"
        class="mb-6"
      >
        {{ $t('Évolution des statistiques et indicateurs d\'usage de {site} mis à jour quotidiennement.', { site: config.public.title }) }}
      </SimpleBanner>

      <div
        v-if="site"
        class="grid grid-cols-3 gap-x-4 gap-y-8"
      >
        <StatBox
          :title="$t('Visites des jeux de données')"
          :data="site.metrics.datasets_visits_by_months"
          type="line"
        />
        <StatBox
          :title="$t('Téléchargement des resources')"
          :data="site.metrics.resources_downloads_by_months"
          type="line"
        />
        <div />
        <StatBox
          :title="$t('Jeux de données')"
          :data="site.metrics.datasets_by_months"
          type="bar"
          :summary="site.metrics.datasets"
        />
        <StatBox
          :title="$t('Moissoneurs')"
          :data="site.metrics.harvesters_by_months"
          type="bar"
          :summary="site.metrics.harvesters"
        />
        <StatBox
          :title="$t('Réutilisations')"
          :data="site.metrics.reuses_by_months"
          type="bar"
          :summary="site.metrics.reuses"
        />
        <StatBox
          :title="$t('Organisations')"
          :data="site.metrics.organizations_by_months"
          type="bar"
          :summary="site.metrics.organizations"
        />
        <StatBox
          :title="$t('Utilisateurs')"
          :data="site.metrics.users_by_months"
          type="bar"
          :summary="site.metrics.users"
        />
        <StatBox
          :title="$t('Discussions')"
          :data="site.metrics.discussions_by_months"
          type="bar"
          :summary="site.metrics.discussions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Site } from '@datagouv/components-next'
import { BrandedButton, SimpleBanner, StatBox } from '@datagouv/components-next'
import { RiDownloadLine } from '@remixicon/vue'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const config = useRuntimeConfig()
const { data: site } = await useAPI<Site>('/api/1/site')
</script>
