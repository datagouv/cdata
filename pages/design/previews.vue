<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/previews">
        {{ $t('Previews') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Previews
    </h1>

    <div class="space-y-20">
      <div>
        <h2>Tabular Preview</h2>
        <p>Two added tabs: <b>Aperçu</b> and <b>Structure des données</b>.</p>

        <ResourceAccordion
          :resource="tabularDataset.resources.filter((r) => r.format === 'csv')[0]"
          :dataset="tabularDataset"
        />
      </div>
      <div>
        <h2>Pmtiles Preview</h2>
        <p>One added tab: <b>Carte</b>.</p>
        <ResourceAccordion
          :resource="pmtilesDataset.resources.filter((r) => r.format === 'pmtiles')[0]"
          :dataset="pmtilesDataset"
        />
      </div>
      <div>
        <h2>OGC WMS Preview</h2>
        <p>One added tab: <b>Carte</b>.</p>
        <ResourceAccordion
          :resource="ogcDataset.resources.filter((r) => r.format === 'ogc:wms')[0]"
          :dataset="ogcDataset"
        />
      </div>
      <div>
        <h2>Pdf Preview</h2>
        <p>One added tab: <b>Aperçu</b>.</p>
        <ResourceAccordion
          :resource="pdfDataset.resources.filter((r) => r.format === 'pdf')[0]"
          :dataset="pdfDataset"
        />
      </div>
      <div>
        <h2>XML Preview</h2>
        <p>One added tab: <b>Aperçu</b>.</p>
        <ResourceAccordion
          :resource="xmlAndJsonDataset.resources.filter((r) => r.format === 'xml')[0]"
          :dataset="xmlAndJsonDataset"
        />
      </div>
      <div>
        <h2>JSON Preview</h2>
        <p>One added tab: <b>Aperçu</b>.</p>
        <ResourceAccordion
          :resource="xmlAndJsonDataset.resources.filter((r) => r.format === 'json')[0]"
          :dataset="xmlAndJsonDataset"
        />
      </div>
      <div>
        <h2>datafair Preview</h2>
        <h3>Iframe preview</h3>
        <p>One added tab: <b>Aperçu</b>. The iframe could show a map, data table or a structure field table.</p>
        <ResourceAccordion
          :resource="datafairDataset.resources.filter((r) => r.extras['datafairEmbed'] === 'map')[0]"
          :dataset="datafairDataset"
        />
        <h3 class="mt-4">
          API doc preview
        </h3>
        <p>One added tab: <b>Aperçu</b>. Show the api doc with a Swagger UI.</p>
        <ResourceAccordion
          :resource="datafairDataset.resources.filter((r) => r.extras['apidocUrl'])[0]"
          :dataset="datafairDataset"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import { ResourceAccordion, type Dataset } from '@datagouv/components-next'

const { data: tabularDataset } = await useAPI<Dataset>('/api/1/datasets/repertoire-national-des-elus-1/')
const { data: pmtilesDataset } = await useAPI<Dataset>('/api/1/datasets/proposition-de-contours-des-bureaux-de-vote/')
const { data: ogcDataset } = await useAPI<Dataset>('/api/1/datasets/bassins-versant-topographiques-metropole-2023-bd-topage-r/')
const { data: pdfDataset } = await useAPI<Dataset>('/api/1/datasets/etudes-impact-open-data/')
const { data: xmlAndJsonDataset } = await useAPI<Dataset>('/api/1/datasets/paris-2024-sites-de-competition/')
const { data: datafairDataset } = await useAPI<Dataset>('/api/1/datasets/mobilite-stationnement-des-parkings-en-temps-reel-1/')
</script>
