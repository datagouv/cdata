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
        {{ $t('Édition') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <LoadingBlock
      v-slot="{ data: chart }"
      :status
      :data="loadedChart"
    >
      <ChartConfigurator
        v-if="chartForm"
        v-model="chartForm"
        :initial-chart="chart"
      />
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import type { Chart, ChartForm } from '@datagouv/components-next'
import { LoadingBlock, toChartForm } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ChartConfigurator from '~/components/Charts/ChartConfigurator.vue'

const route = useRoute()

const cid = route.params.cid as string

const { data: loadedChart, status } = await useAPI<Chart>(`/api/1/visualizations/${cid}/`, { lazy: true, server: false })

const chartForm = ref<ChartForm | null>(null)
watchEffect(() => {
  if (loadedChart.value) {
    chartForm.value = toChartForm(loadedChart.value)
  }
})
</script>
