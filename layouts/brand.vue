<template>
  <div
    class="group/layout"
    :data-with-container="true"
  >
    <SiteHeader />
    <BannerReadOnly />
    <slot />
    <div class="brand-layout">
        <div class="brand-background"></div>
    </div>
    <SiteFooter />
  </div>
</template>

<style scoped>
.brand-layout {
    top: 0;
    width: 100%;
    height: 50vh;
}
.brand-background {
    float: right;
    width: 50vw;
    height: 50vh;
    background-image: url('@/assets/svg/brand/background.svg');
    background-size: cover;
    background-position: bottom;
    background-repeat: no-repeat;
}
</style>