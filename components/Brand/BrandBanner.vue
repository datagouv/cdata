<template>
  <section
    class="brand-banner"
    :style="{ backgroundImage: `url(${props.backgroundImage})` }"
  >
    <div class="brand-banner__content">
      <div class="brand-banner__left">
        <h1
          class="brand-banner__title"
          v-html="props.title"
        />
        <p
          v-if="props.subtitle"
          class="brand-banner__subtitle"
          v-html="props.subtitle"
        />
        <a
          v-if="props.ctaLabel && props.ctaUrl"
          :href="props.ctaUrl"
          class="brand-banner__cta"
        >{{ props.ctaLabel }}</a>
      </div>
      <div
        v-if="props.rightImage"
        class="brand-banner__right"
      >
        <img
          :src="props.rightImage"
          alt=""
          class="brand-banner__right-img"
        >
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps({
  backgroundImage: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  ctaLabel: { type: String, default: '' },
  ctaUrl: { type: String, default: '' },
  rightImage: { type: String, default: '' },
})
</script>

<style scoped>
.brand-banner {
  width: 100%;
  min-height: 380px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: stretch;
  justify-content: center;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50%;
  margin-right: -50%;
}

.brand-banner__content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 2rem;
  box-sizing: border-box;
}

.brand-banner__left {
  flex: 1 1 0;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
}

.brand-banner__title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.brand-banner__subtitle {
  font-size: 1.6rem;
  font-style: italic;
  font-family: 'Spectral';
  margin-bottom: 2rem;
  max-width: 32rem;
}

.brand-banner__cta {
  display: inline-block;
  background: #fff;
  color: #2176ae;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  text-decoration: none;
  font-size: 1rem;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.brand-banner__cta:hover {
  background: #e6f0fa;
  color: #174c7c;
}

.brand-banner__right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  margin-left: 2rem;
}

.brand-banner__right-img {
  max-height: 260px;
  width: auto;
  display: block;
}

@media (max-width: 900px) {
  .brand-banner__content {
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem 1rem;
  }
  .brand-banner__right {
    margin-left: 0;
    margin-top: 2rem;
    width: 100%;
    justify-content: center;
  }
  .brand-banner__right-img {
    max-width: 80vw;
    max-height: 180px;
  }
  .brand-banner__right{
    display: none;
  }
}
</style>
