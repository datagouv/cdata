<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/logos">
        {{ $t('Logos') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Logos
    </h1>

    <div class="space-y-20">
      <div>
        <h2>LogoImage</h2>
        <p>The red line is just to test the centering.</p>

        <div class="flex space-x-24 items-center relative border border-red-700/50 p-12">
          <div class="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-[1px] bg-red-700/50 z-10" />
          <LogoImage class="h-12" />
          <LogoImage class="h-8" />
        </div>
      </div>
      <div>
        <h2>LogoAsText</h2>

        <div class="">
          <div class="text-4xl">
            In a text
            <LogoAsText />
          </div>
          <div class="text-sm">
            … or a smaller one
            <LogoAsText />
          </div>
        </div>
      </div>
      <div>
        <h2>LogoOnly</h2>

        <div class="space-x-12">
          <LogoOnly class="size-24" />
          <LogoOnly class="size-12" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
</script>
