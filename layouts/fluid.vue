<template>
  <div
    class="group/layout flex flex-col"
    :data-with-container="false"
  >
    <SiteHeader :fluid="true" />
    <BannerReadOnly :fluid="true" />
    <slot />
  </div>
</template>
