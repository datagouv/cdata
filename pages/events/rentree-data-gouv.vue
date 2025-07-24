<template>
  <div>
    <BrandBanner
      v-if="banner"
      :background-image="banner.url_banner"
      :title="banner.title"
      :subtitle="banner.subtitle"
      :cta-label="banner.ctaLabel"
      :cta-url="banner.ctaLink"
      :right-image="banner.url_img"
    />
    <div
      v-if="!loading"
      class="fr-container"
    >
      <br><br>
      <div
        v-for="section in sections"
        :key="section.id"
        class="section-block"
      >
        <h1 class="title-section">
          {{ section.title }}
        </h1>
        <div
          class="section-content"
          v-html="section.content"
        />
        <div class="brandcards-list">
          <div class="grid md:grid-cols-6 gap-12">
            <BrandCard
              v-for="event in eventsBySection[section.title] || []"
              :key="event.id"
              :tagline="event.titre"
              :theme="event.format"
              :image-src="event.url_img"
              size="medium"
              :border="true"
              :class="event.class"
              actions-alignment="start"
              :use-static-image="true"
              :cta-url="event.ctaUrl"
              :cta-label="event.ctaLabel"
            />
          </div>
        </div>
      </div>
      <div
        v-if="faq.length"
        class="fr-mt-10w"
      >
        <h1 class="title-section">
          Foire aux questions
        </h1>
        <AccordionGroup>
          <Accordion
            v-for="item in faq"
            :key="item.id"
            :title="item.question"
          >
            <div
              class="fr-mb-2w"
              v-html="formatMarkdown(item.answer, 3)"
            />
            <div
              v-if="item.ctaLabel && item.ctaUrl"
              class="flex justify-center"
            >
              <a
                class="fr-btn fr-btn--primary mt-4"
                :href="item.ctaUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.ctaLabel }}
              </a>
            </div>
          </Accordion>
        </AccordionGroup>
      </div>
      <br>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BrandBanner from '~/components/Brand/BrandBanner.vue'
import BrandCard from '~/components/Brand/BrandCard.vue'
import AccordionGroup from '~/components/Accordion/AccordionGroup.global.vue'
import Accordion from '~/components/Accordion/Accordion.global.vue'

interface Banner {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaLink?: string
  url_banner: string
  url_img?: string
  card: string
  class: string
  ctaUrl: string
}
interface Section {
  id: number
  title: string
  content: string
}
interface Event {
  id: number
  titre: string
  format: string
  url_img: string
  card: string
  class: string
  ctaUrl: string
  ctaLabel?: string
}

interface FaqItem {
  id: number
  question: string
  answer: string
  ctaLabel?: string | null
  ctaUrl?: string | null
}

const banner = ref<Banner | null>(null)
const sections = ref<Section[]>([])
const eventsBySection = ref<Record<string, Event[]>>({})
const loading = ref(true)
const faq = ref<FaqItem[]>([])

onMounted(async () => {
  const resBanner = await fetch('https://grist.numerique.gouv.fr/api/docs/vPC8NpR9HWux/tables/Banner/records')
  const dataBanner = await resBanner.json()
  if (dataBanner.records && dataBanner.records.length > 0) {
    banner.value = dataBanner.records[0].fields
  }

  const resSections = await fetch('https://grist.numerique.gouv.fr/api/docs/vPC8NpR9HWux/tables/Sections/records?&sort=ordre')
  const dataSections = await resSections.json()
  sections.value = dataSections.records.map((r: { id: number, fields: { title: string, content: string } }) => ({
    id: r.id,
    title: r.fields.title,
    content: r.fields.content,
  }))

  await Promise.all(sections.value.map(async (section) => {
    const filter = encodeURIComponent(JSON.stringify({ display: [true], Theme: [section.title] }))
    const url = `https://grist.numerique.gouv.fr/api/docs/vPC8NpR9HWux/tables/Evenements/records?filter=${filter}&sort=Date_debut`
    const resEvents = await fetch(url)
    const dataEvents = await resEvents.json()
    eventsBySection.value[section.title] = (dataEvents.records || []).map((r: { id: number, fields: { Titre: string, format_online: string, url_img: string, card: string, cssClass: string, ctaUrl: string, ctaLabel: string } }) => ({
      id: r.id,
      titre: r.fields.Titre,
      format: r.fields.format_online,
      url_img: r.fields.url_img,
      card: r.fields.card,
      class: r.fields.cssClass,
      ctaUrl: r.fields.ctaUrl,
      ctaLabel: r.fields.ctaLabel,
    }))
  }))

  const resFaq = await fetch('https://grist.numerique.gouv.fr/api/docs/vPC8NpR9HWux/tables/Faq/records')
  const dataFaq = await resFaq.json()
  faq.value = dataFaq.records.map((r: { id: number, fields: { question: string, answer: string, ctaLabel?: string | null, ctaUrl?: string | null } }) => ({
    id: r.id,
    question: r.fields.question,
    answer: r.fields.answer,
    ctaLabel: r.fields.ctaLabel,
    ctaUrl: r.fields.ctaUrl,
  }))
  loading.value = false
})
</script>

<style scoped>
.section-block {
  margin-bottom: 4rem;
}
.section-content {
  margin-bottom: 2rem;
  font-size: 1.15rem;
}
.title-section {
    font-weight: 800;
    margin-bottom: 1.5rem;
}
</style>
