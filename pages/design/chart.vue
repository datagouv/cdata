<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/chart">
        {{ $t('Chart') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Chart Configurator
    </h1>

    <ChartConfigurator v-model="chart" />
  </div>
</template>

<script setup lang="ts">
import type { ChartForm } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ChartConfigurator from '~/design-system/ChartConfigurator.vue'

const me = useMaybeMe()

const chart = ref<ChartForm>({
  owned: {
    organization: null,
    owner: me.value ? me.value.id : 'dummyForDS',
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
