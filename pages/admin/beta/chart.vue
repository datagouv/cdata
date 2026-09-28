<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/">
        {{ $t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Visualisations') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Formulaire de publication') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <ChartConfigurator v-model="chart" />
  </div>
</template>

<script setup lang="ts">
import type { ChartForm } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ChartConfigurator from '~/components/Charts/ChartConfigurator.vue'

const me = useMe()

const chart = ref<ChartForm>({
  owned: {
    organization: null,
    owner: me.value.id,
  },
  title: 'Mon graphique',
  description: '',
  private: false,
  x_axis: {
    column_x: '',
    type: 'discrete',
    sort_combined: '',
  },
  y_axis: {
    label: '',
    min: null,
    max: null,
    unit: '',
    unit_position: 'suffix',
  },
  filter: null,
  chart_type: 'histogram',
  series: [],
  extras: {},
})
</script>
