<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design/">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="!mb-3">
      Design System
    </h1>
    <div class="space-y-8 py-8 pb-64">
      <h2 class="!mb-3">
        DateRangeDetails
      </h2>

      <div class="flex flex-col">
        <DateRangeDetails :range="{ start: '2024-01-01', end: null }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-12-31' }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2025-12-31' }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2026-12-31' }" />

        <DateRangeDetails :range="{ start: '2024-02-01', end: null }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-01-31' }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-02-29' }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-03-31' }" />
        <DateRangeDetails :range="{ start: '2024-12-01', end: '2025-01-31' }" />
        <DateRangeDetails :range="{ start: '2024-12-01', end: '2025-04-30' }" />

        <DateRangeDetails :range="{ start: '2024-02-12', end: null }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-01-12' }" />
        <DateRangeDetails :range="{ start: '2024-01-01', end: '2024-01-01' }" />
      </div>
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
      <AdminBadge />
      <div class="container">
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
      </div>
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
      <h2 class="mb-3">
        Support Card
      </h2>
      <div class="grid md:grid-cols-2">
        <SupportCard
          image="/img/forum.svg"
          title="Forum"
          description="Echangez avec la communauté, partagez vos retours sur la plateforme et demandez l'ouverture de données."
        >
          <template #link>
            <BrandedButton
              href="https://forum.data.gouv.fr"
              color="tertiary"
              :icon="RiArrowRightLine"
              :icon-right="true"
            >
              Voir le forum
            </BrandedButton>
          </template>
        </SupportCard>
      </div>
      <div class="space-y-8 py-8 pb-64">
        <h2 class="!mb-3">
          Full width content
        </h2>

        <BannerSticky />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, DatasetCard, DatasetQuality, ReadMore, ResourceAccordion, SimpleBanner, type Dataset } from '@datagouv/components-next'
import { RiArrowRightLine } from '@remixicon/vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import DateRangeDetails from '~/components/DateRangeDetails.vue'
import AdminBadge from '~/design-system/AdminBadge.vue'
import BannerAction from '~/design-system/BannerAction.vue'
import BannerNotif from '~/design-system/BannerNotif.vue'
import BannerSticky from '~/design-system/BannerSticky.vue'
import OrganizationNameWithCertificate from '~/design-system/OrganizationNameWithCertificate.vue'
import SearchInput from '~/design-system/SearchInput.vue'

const { data: dataset } = await useAPI<Dataset>('/api/2/datasets/repertoire-national-des-elus-1/')
</script>
