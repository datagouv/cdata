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
    column_x: 'libellé_EPCI',
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
  series: [{
    type: 'histogram',
    column_y: 'Nombre de logements',
    aggregate_y: null,
    resource_id: '14dba482-41e3-4c54-b82a-d8c11d1d80eb',
    filters: null,
    column_x_name_override: null,
  }],
  extras: {},
})
</script>
