<template>
  <DevOnly>
    <div class="space-y-8 p-8 bg-gray-50 pb-32">
      <h1 class="!mb-3">
        Design System
      </h1>
      <section>
        <h2 class="!mb-3">
          Colors
        </h2>

        <div class="space-y-4">
          <div>
            <h3 class="!mb-2">
              Info
            </h3>

            <div class="flex space-x-4">
              <div class="size-12 bg-datagouv" />
              <div class="size-12 bg-datagouv-lightest" />
            </div>
          </div>
          <div>
            <h3 class="!mb-2">
              Danger
            </h3>

            <div class="flex space-x-4">
              <div class="size-12 bg-danger-dark" />
              <div class="size-12 bg-danger-lightest" />
            </div>
          </div>
          <div>
            <h3 class="!mb-2">
              Warning
            </h3>

            <div class="flex space-x-4">
              <div class="size-12 bg-warning-dark" />
              <div class="size-12 bg-warning-lightest" />
            </div>
          </div>
          <div>
            <h3 class="!mb-2">
              Success
            </h3>

            <div class="flex space-x-4">
              <div class="size-12 bg-success-dark" />
              <div class="size-12 bg-success-lightest" />
            </div>
          </div>
        </div>
      </section>
      <BrandedButton />
      <AdminBadge />
      <BannerAction />
      <BannerNotif />
      <OrganizationNameWithCertificate />

      <DatasetCard
        v-if="dataset"
        :dataset
        dataset-url="#"
      />
      <DatasetQuality
        v-if="dataset"
        :quality="dataset.quality"
      />
      <ResourceAccordion
        v-if="dataset && dataset.resources.length"
        :resource="dataset.resources[1]"
        :dataset="dataset"
        can-edit
      />

      <ReadMore v-if="dataset">
        <div class="prose">
          {{ dataset.description }}
        </div>
      </ReadMore>

      <SearchInput />
      <div class="bg-white py-4 px-4 -mx-4">
        <DatasetSearchPage />
      </div>
    </div>
    <div class="space-y-8 py-8 pb-64">
      <h2 class="!mb-3">
        SimpleBanner
      </h2>

      <SimpleBanner
        v-for="type in ['primary', 'warning']"
        :key="type"
        :type="(type as 'primary' | 'warning')"
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit vel corporis molestias exercitationem quod ad facilis laborum officiis nesciunt, rem, deserunt illo delectus tempore distinctio natus sed architecto, reiciendis consectetur.
      </SimpleBanner>
    </div>
    <div />
    <div class="space-y-8 py-8 pb-64">
      <h2 class="!mb-3">
        Full width content
      </h2>

      <BannerSticky />
    </div>
  </DevOnly>
</template>

<script setup lang="ts">
import { DatasetCard, DatasetQuality, ReadMore, ResourceAccordion, SimpleBanner, type Dataset } from '@datagouv/components-next'
import DatasetSearchPage from '~/components/Datasets/SearchPage.vue'
import AdminBadge from '~/design-system/AdminBadge.vue'
import BannerAction from '~/design-system/BannerAction.vue'
import BannerNotif from '~/design-system/BannerNotif.vue'
import BannerSticky from '~/design-system/BannerSticky.vue'
import BrandedButton from '~/design-system/BrandedButton.vue'
import OrganizationNameWithCertificate from '~/design-system/OrganizationNameWithCertificate.vue'
import SearchInput from '~/design-system/SearchInput.vue'

const { data: dataset } = await useAPI<Dataset>('/api/1/datasets/repertoire-national-des-elus-1')
</script>
