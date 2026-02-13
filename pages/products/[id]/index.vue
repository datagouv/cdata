<template>
  <div class="fr-container">
    <Breadcrumb>
      <BreadcrumbItem
        to="/"
      >
        {{ t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem
        to="/products"
      >
        {{ t('Produits') }}
      </BreadcrumbItem>
      <BreadcrumbItem v-if="card">
        {{ card.product }}
      </BreadcrumbItem>
    </Breadcrumb>

    <div v-if="card">
      <BrandCard
        :background-type="card.backgroundType || 'sky'"
        size="large"
        :description="card.description"
        :tagline="card.tagline"
        :site="card.site"
        :code="card.code"
        :contact="card.contact"
        :show-title-logo="true"
        :border="false"
        :use-static-image="true"
        :image-src="card.image_url"
        :image-alt="card.product"
        :title="card.product"
      />
      <div class="mt-8">
        <TabGroup
          size="md"
          :default-index="defaultTabIndex"
          @change="switchTab"
        >
          <div>
            <TabList style="max-width: 100%; overflow-y: auto;">
              <Tab
                v-for="tab in tabsOptions"
                :key="tab.key"
              >
                <div class="tab-content">
                  <span
                    v-if="tab.key == 'equipe'"
                    class="tab-icon"
                  >
                    <RiTeamLine
                      class="size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    v-if="tab.key == 'presentation' && card?.presentation"
                    class="tab-icon"
                  >
                    <RiWebcamLine
                      class="size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    v-if="tab.key == 'impact' && card?.impact_dataset"
                    class="tab-icon"
                  >
                    <RiLineChartLine
                      class="size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    v-if="tab.key == 'budget' && card?.budget_url"
                    class="tab-icon"
                  >
                    <RiMoneyEuroCircleLine
                      class="size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    v-if="tab.key == 'roadmap' && card?.roadmap_url"
                    class="tab-icon"
                  >
                    <RiRoadMapLine
                      class="size-4"
                      aria-hidden="true"
                    />
                  </span>
                  <span class="tab-label">{{ tab.label }}</span>
                </div>
              </Tab>
            </TabList>
          </div>
          <TabPanels>
            <TabPanel
              v-for="tab in tabsOptions"
              :key="tab.key"
            >
              <div
                v-if="tab.key === 'presentation' && card.presentation"
                class="fr-mt-4v presentation-tab"
              >
                <h3 class="fr-h4">
                  Présentation
                </h3>
                <MarkdownViewer
                  size="md"
                  :content="card.presentation"
                  :min-heading="3"
                />
              </div>
              <div
                v-if="tab.key === 'equipe'"
                class="fr-mt-4v"
              >
                <h3 class="fr-h4">
                  Notre équipe
                </h3>
                <div
                  v-if="teamForProduct.length > 0"
                  class="fr-mt-6v"
                >
                  <div class="team-grid">
                    <div
                      v-for="member in teamForProduct"
                      :key="member.name"
                      class="team-member"
                    >
                      <div class="member-avatar">
                        <img
                          :src="member.image"
                          :alt="member.name"
                          class="avatar-image"
                        >
                      </div>
                      <h4 class="member-name">
                        {{ member.name }}
                      </h4>
                      <p class="member-role">
                        {{ member.role }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="tab.key === 'impact'"
                class="fr-mt-4v"
              >
                <h3 class="fr-h4">
                  Impact et résultats
                </h3>
                <p class="fr-text--lg">
                  Nous publions de manière transparente les indicateurs d'impacts du produit <b>{{ card.product }}</b> dans un jeu de données dédié.
                </p>
                <div
                  v-if="card.impact_dataset"
                  class="fr-mt-6v"
                >
                  <div class="impact-datasets">
                    <DatasetCard
                      :slug="card.impact_dataset"
                      class="impact-dataset-card"
                    />
                  </div>
                </div>
              </div>
              <div
                v-if="tab.key === 'roadmap' && card.roadmap_url"
                class="fr-mt-4v"
              >
                <h3 class="fr-h4">
                  Feuille de route
                </h3>
                <p class="fr-text--lg">
                  Nous publions de manière transparente notre feuille de route sur le produit <b>{{ card.product }}</b> afin que nos utilisateurs puissent avoir un aperçu des chantiers en cours et en préparation au sein de l'équipe produit.
                </p>
                <div class="fr-mt-6v">
                  <GristTableViewer
                    :url="card.roadmap_url"
                    :columns="card.roadmap_column?.filter((col: string) => col !== 'L')"
                  />
                </div>
              </div>
              <div
                v-if="tab.key === 'budget' && card.budget_url"
                class="fr-mt-4v"
              >
                <h3 class="fr-h4">
                  Budget et financement
                </h3>
                <p class="fr-text--lg">
                  Nous publions de manière transparente le budget de l'année en cours sur le produit <b>{{ card.product }}</b> en le détaillant poste par poste. Le budget du produit est à la fois composé de coûts humains (agents publics, prestataires et indépendants), de coûts de licences logicielles et coûts d'infrastructure.
                </p>
                <div class="fr-mt-6v">
                  <GristTableViewer
                    :url="card.budget_url"
                    :columns="card.budget_columns?.filter((col: string) => col !== 'L')"
                    :total-column="card.budget_column_total"
                    :unit="card.budget_unit"
                    :unit-column="card.budget_column_total"
                  />
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MarkdownViewer, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@datagouv/components-next'
import { RiWebcamLine, RiRoadMapLine, RiMoneyEuroCircleLine, RiLineChartLine, RiTeamLine } from '@remixicon/vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Breadcrumb from '~/components/Breadcrumb/Breadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import BrandCard from '~/components/Brand/BrandCard.vue'
import DatasetCard from '~/components/Embeds/DatasetCard.global.vue'
import GristTableViewer from '~/components/GristTableViewer/GristTableViewer.vue'

const route = useRoute()
interface ProductCard {
  id: string
  slug: string
  product: string
  description?: string
  image_url?: string
  tagline?: string
  site?: string
  code?: string
  contact?: string
  backgroundType?: string
  impact_dataset?: string
  roadmap_url?: string
  roadmap_column?: string[]
  budget_url?: string
  budget_columns?: string[]
  budget_column_total?: string
  budget_unit?: string
  team?: string[]
  presentation?: string
}

interface TeamMember {
  name: string
  role: string
  image: string
  product: string
}

const cards = ref<ProductCard[]>([])
const loading = ref(true)
const team = ref<TeamMember[]>([])

onMounted(async () => {
  const res = await fetch('https://grist.numerique.gouv.fr/api/docs/pJuuC9r8GvA1/tables/Productsv2/records')
  const data = await res.json()
  cards.value = data.records.map((r: { fields: ProductCard }) => ({
    ...r.fields,
    id: r.fields.slug,
  }))

  const resTeam = await fetch('https://grist.numerique.gouv.fr/api/docs/pJuuC9r8GvA1/tables/Member/records')
  const dataTeam = await resTeam.json()
  team.value = dataTeam.records.map((r: { fields: TeamMember }) => r.fields)
  loading.value = false
})

const card = computed(() => cards.value.find(c => c.slug === route.params.id))

const teamForProduct = computed(() => {
  if (!card.value) return []
  return team.value.filter(member => member.product === card.value!.slug)
})

const tabsOptions = computed(() => {
  if (!card.value) return []
  const allTabs = [
    { key: 'presentation', label: 'Présentation', hasData: () => !!card.value!.presentation },
    { key: 'roadmap', label: 'Roadmap', hasData: () => !!card.value!.roadmap_url },
    { key: 'budget', label: 'Budget', hasData: () => !!card.value!.budget_url },
    { key: 'impact', label: 'Impact', hasData: () => !!card.value!.impact_dataset },
    { key: 'equipe', label: 'Équipe', hasData: () => teamForProduct.value.length > 0 },
  ]
  return allTabs.filter(tab => tab.hasData())
})

const defaultTabIndex = computed(() => {
  if (!tabsOptions.value.length) return 0

  const tabFromUrl = route.query.tab as string

  let targetTabKey = tabFromUrl
  if (!targetTabKey && tabsOptions.value.length > 0) {
    targetTabKey = tabsOptions.value[0].key
  }

  const defaultIndex = tabsOptions.value.findIndex(tab => tab.key === targetTabKey)

  return defaultIndex >= 0 ? defaultIndex : 0
})

const selectedTabIndex = ref(0)

watch(defaultTabIndex, (newIndex) => {
  selectedTabIndex.value = newIndex
}, { immediate: true })

const switchTab = (index: number) => {
  selectedTabIndex.value = index
  const option = tabsOptions.value[index]

  if (option) {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', option.key)
    window.history.replaceState({}, '', url.toString())
  }
}

const { t } = useTranslation()
useSeoMeta({ title: card.value ? ' Produit ' + card.value.product : t('Produit') })
</script>

<style scoped>
.tab-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-icon {
  display: flex;
  align-items: center;
}

.tab-label {
  font-weight: 500;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.team-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.member-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 3px solid var(--blue-france-500);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-default-grey);
}

.member-role {
  font-size: 0.875rem;
  color: var(--text-mention-grey);
  margin: 0;
  font-weight: 500;
}

.impact-datasets {
  margin-top: 1rem;
}

.impact-dataset-card {
  max-width: 100%;
  margin-bottom: 1rem;
}

.presentation-tab {
  margin-bottom: 5rem;
}
</style>
