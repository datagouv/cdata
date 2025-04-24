<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
        :external="true"
      >
        {{ $t('Home') }}
      </BreadcrumbItem>
      <BreadcrumbItem>
        {{ $t('Dataservices') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="!mb-2">
      {{ $t('Dataservices') }}
    </h1>
    <p
      v-if="count !== null"
      class="block mb-3"
    >
      {{ $t('Search among {count} dataservices on {site}', {
        count: count,
        site: config.public.title,
      }) }}
    </p>

    <DataservicesSearchPage v-model="count" />
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

const { t } = useI18n()
useSeoMeta({
  title: t('Dataservices'),
})

const count = ref(null as null | number)
const config = useRuntimeConfig()
</script>
