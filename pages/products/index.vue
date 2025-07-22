<template>
  <div>
    <div class="container">
      <Breadcrumb>
        <BreadcrumbItem
          :external="true"
          to="/"
        >
          {{ $t('Accueil') }}
        </BreadcrumbItem>
        <BreadcrumbItem>
            Produits
        </BreadcrumbItem>
      </Breadcrumb>
        <div class="product-page-intro">
            <h1 class="!text-4.5xl !font-extrabold !mb-0">
                Une infrastructure de la donnée publique, pensée pour durer et servir l’intérêt général
            </h1>
            <br />
            <div class="product-page-intro-subtitle"><i>Des produits pour faciliter l’accès, organiser la circulation et faciliter les usages des données publiques.</i></div>
        </div>
    </div>
  </div>
  <div class="fr-container">
    <div class="grid md:grid-cols-6 gap-6">
      <BrandCard
        v-for="card in cards"
        :key="card.id"
        actions-alignment="start"
        :background-type="card.backgroundType || 'sky'"
        size="medium"
        :rounded="false"
        :description="card.description"
        :cta-url="`/products/${card.slug}`"
        cta-label="Voir le produit"
        :tagline="card.tagline"
        class="col-span-2"
        :show-title-logo="true"
        type="brand"
        :border="true"
        :use-static-image="true"
        :image-src="`/nuxt_images/products/${card.slug}.png`"
        :image-alt="card.slug"
        :title="card.product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import BrandCard from '~/components/BrandCard/BrandCard.vue'

interface Card {
  id: number | string
  product: string
  slug: string
  backgroundType?: string
  description?: string
  tagline?: string
  title?: string
}

const cards = ref<Card[]>([])
const loading = ref(true)

onMounted(async () => {
  const res = await fetch('https://grist.numerique.gouv.fr/api/docs/pJuuC9r8GvA1/tables/Produits/records')
  const data = await res.json()
  cards.value = data.records.map((r: any) => ({
    id: r.fields.slug,
    product: r.fields.product,
    slug: r.fields.slug,
    backgroundType: r.fields.backgroundType || 'sky',
    description: r.fields.description,
    tagline: r.fields.tagline,
    title: r.fields.product,
  }))
  loading.value = false
})

definePageMeta({
  layout: 'brand',
})


const { t } = useI18n()

useSeoMeta({
  title: 'Produits',
})
const route = useRoute()
const page = ref(route.query.page ?? 1)

watch(page, async () => {
  await navigateTo({
    ...route,
    query: {
      ...route.query,
      page: page.value,
    },
  })
  document.children[0].scrollIntoView({ behavior: 'smooth', block: 'start' })
})

</script>

<style scoped>
.product-page-intro{
    text-align: center;
    margin-top: 4em;
    margin-bottom: 4em;
    margin-left: 10%;
    margin-right: 10%;
}
.product-page-intro-subtitle{
    margin-left: 15%;
    margin-right: 15%;
    font-size: 24px;
    font-family: 'Spectral';
    line-height: 30px;
}
</style>