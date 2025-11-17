<template>
  <div class="fr-container">
    <Breadcrumb>
      <BreadcrumbItem
        :external="true"
        to="/"
      >
        {{ t('Accueil') }}
      </BreadcrumbItem>
      <BreadcrumbItem
        :external="true"
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
                v-for="(tab, index) in tabsOptions"
                :key="tab.key"
              >
                <div class="tab-content">
                  <span
                    v-if="tab.key == 'equipe' && card?.team"
                    class="tab-icon"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_33_7)">
                        <path
                          d="M7.99998 7.33334C8.88403 7.33334 9.73188 7.68453 10.357 8.30965C10.9821 8.93477 11.3333 9.78261 11.3333 10.6667V14.6667H9.99998V10.6667C10 10.1565 9.8051 9.66566 9.45512 9.2945C9.10515 8.92333 8.62657 8.69993 8.11731 8.67L7.99998 8.66667C7.48984 8.66664 6.99897 8.86155 6.62781 9.21153C6.25664 9.5615 6.03324 10.0401 6.00331 10.5493L5.99998 10.6667V14.6667H4.66665V10.6667C4.66665 9.78261 5.01784 8.93477 5.64296 8.30965C6.26808 7.68453 7.11592 7.33334 7.99998 7.33334ZM3.66665 9.33334C3.85265 9.33334 4.03331 9.35534 4.20665 9.396C4.09266 9.73534 4.02516 10.0885 4.00598 10.446L3.99998 10.6667V10.724C3.92335 10.6966 3.84364 10.6787 3.76265 10.6707L3.66665 10.6667C3.41806 10.6667 3.17839 10.7593 2.99437 10.9264C2.81035 11.0935 2.69518 11.3232 2.67131 11.5707L2.66665 11.6667V14.6667H1.33331V11.6667C1.33331 11.0478 1.57915 10.4543 2.01673 10.0168C2.45432 9.57917 3.04781 9.33334 3.66665 9.33334V9.33334ZM12.3333 9.33334C12.9522 9.33334 13.5456 9.57917 13.9832 10.0168C14.4208 10.4543 14.6666 11.0478 14.6666 11.6667V14.6667H13.3333V11.6667C13.3333 11.4181 13.2407 11.1784 13.0736 10.9944C12.9064 10.8104 12.6768 10.6952 12.4293 10.6713L12.3333 10.6667C12.2166 10.6667 12.1046 10.6867 12 10.7233V10.6667C12 10.2227 11.928 9.796 11.794 9.39734C11.9666 9.35534 12.1473 9.33334 12.3333 9.33334ZM3.66665 5.33334C4.10867 5.33334 4.5326 5.50893 4.84516 5.82149C5.15772 6.13405 5.33331 6.55798 5.33331 7C5.33331 7.44203 5.15772 7.86595 4.84516 8.17851C4.5326 8.49107 4.10867 8.66667 3.66665 8.66667C3.22462 8.66667 2.8007 8.49107 2.48814 8.17851C2.17557 7.86595 1.99998 7.44203 1.99998 7C1.99998 6.55798 2.17557 6.13405 2.48814 5.82149C2.8007 5.50893 3.22462 5.33334 3.66665 5.33334V5.33334ZM12.3333 5.33334C12.7753 5.33334 13.1993 5.50893 13.5118 5.82149C13.8244 6.13405 14 6.55798 14 7C14 7.44203 13.8244 7.86595 13.5118 8.17851C13.1993 8.49107 12.7753 8.66667 12.3333 8.66667C11.8913 8.66667 11.4674 8.49107 11.1548 8.17851C10.8422 7.86595 10.6666 7.44203 10.6666 7C10.6666 6.55798 10.8422 6.13405 11.1548 5.82149C11.4674 5.50893 11.8913 5.33334 12.3333 5.33334V5.33334ZM3.66665 6.66667C3.57824 6.66667 3.49346 6.70179 3.43094 6.7643C3.36843 6.82681 3.33331 6.9116 3.33331 7C3.33331 7.08841 3.36843 7.17319 3.43094 7.23571C3.49346 7.29822 3.57824 7.33334 3.66665 7.33334C3.75505 7.33334 3.83984 7.29822 3.90235 7.23571C3.96486 7.17319 3.99998 7.08841 3.99998 7C3.99998 6.9116 3.96486 6.82681 3.90235 6.7643C3.83984 6.70179 3.75505 6.66667 3.66665 6.66667ZM12.3333 6.66667C12.2449 6.66667 12.1601 6.70179 12.0976 6.7643C12.0351 6.82681 12 6.9116 12 7C12 7.08841 12.0351 7.17319 12.0976 7.23571C12.1601 7.29822 12.2449 7.33334 12.3333 7.33334C12.4217 7.33334 12.5065 7.29822 12.569 7.23571C12.6315 7.17319 12.6666 7.08841 12.6666 7C12.6666 6.9116 12.6315 6.82681 12.569 6.7643C12.5065 6.70179 12.4217 6.66667 12.3333 6.66667ZM7.99998 1.33334C8.70722 1.33334 9.3855 1.61429 9.8856 2.11438C10.3857 2.61448 10.6666 3.29276 10.6666 4C10.6666 4.70725 10.3857 5.38552 9.8856 5.88562C9.3855 6.38572 8.70722 6.66667 7.99998 6.66667C7.29274 6.66667 6.61446 6.38572 6.11436 5.88562C5.61426 5.38552 5.33331 4.70725 5.33331 4C5.33331 3.29276 5.61426 2.61448 6.11436 2.11438C6.61446 1.61429 7.29274 1.33334 7.99998 1.33334V1.33334ZM7.99998 2.66667C7.64636 2.66667 7.30722 2.80714 7.05717 3.05719C6.80712 3.30724 6.66665 3.64638 6.66665 4C6.66665 4.35362 6.80712 4.69276 7.05717 4.94281C7.30722 5.19286 7.64636 5.33334 7.99998 5.33334C8.3536 5.33334 8.69274 5.19286 8.94279 4.94281C9.19284 4.69276 9.33331 4.35362 9.33331 4C9.33331 3.64638 9.19284 3.30724 8.94279 3.05719C8.69274 2.80714 8.3536 2.66667 7.99998 2.66667V2.66667Z"
                          :fill="selectedTabIndex === index ? '#3558A2' : '#161616'"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_33_7">
                          <rect
                            width="16"
                            height="16"
                            fill="white"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <span
                    v-if="tab.key == 'presentation' && card?.presentation"
                    class="tab-icon"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_776_46072)">
                        <path
                          d="M11 21V19.93C9.33387 19.6891 7.81031 18.856 6.7084 17.5833C5.60648 16.3106 4.99998 14.6835 5 13V8C5 7.08075 5.18106 6.1705 5.53284 5.32122C5.88463 4.47194 6.40024 3.70026 7.05025 3.05025C7.70026 2.40024 8.47194 1.88463 9.32122 1.53284C10.1705 1.18106 11.0807 1 12 1C12.9193 1 13.8295 1.18106 14.6788 1.53284C15.5281 1.88463 16.2997 2.40024 16.9497 3.05025C17.5998 3.70026 18.1154 4.47194 18.4672 5.32122C18.8189 6.1705 19 7.08075 19 8V13C19 14.6835 18.3935 16.3106 17.2916 17.5833C16.1897 18.856 14.6661 19.6891 13 19.93V21H17V23H7V21H11ZM12 3C10.6739 3 9.40215 3.52678 8.46447 4.46447C7.52678 5.40215 7 6.67392 7 8V13C7 14.3261 7.52678 15.5979 8.46447 16.5355C9.40215 17.4732 10.6739 18 12 18C13.3261 18 14.5979 17.4732 15.5355 16.5355C16.4732 15.5979 17 14.3261 17 13V8C17 6.67392 16.4732 5.40215 15.5355 4.46447C14.5979 3.52678 13.3261 3 12 3ZM12 9C12.2652 9 12.5196 8.89464 12.7071 8.70711C12.8946 8.51957 13 8.26522 13 8C13 7.73478 12.8946 7.48043 12.7071 7.29289C12.5196 7.10536 12.2652 7 12 7C11.7348 7 11.4804 7.10536 11.2929 7.29289C11.1054 7.48043 11 7.73478 11 8C11 8.26522 11.1054 8.51957 11.2929 8.70711C11.4804 8.89464 11.7348 9 12 9ZM12 11C11.2044 11 10.4413 10.6839 9.87868 10.1213C9.31607 9.55871 9 8.79565 9 8C9 7.20435 9.31607 6.44129 9.87868 5.87868C10.4413 5.31607 11.2044 5 12 5C12.7956 5 13.5587 5.31607 14.1213 5.87868C14.6839 6.44129 15 7.20435 15 8C15 8.79565 14.6839 9.55871 14.1213 10.1213C13.5587 10.6839 12.7956 11 12 11Z"
                          :fill="selectedTabIndex === index ? '#3558A2' : '#161616'"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_776_46072">
                          <rect
                            width="24"
                            height="24"
                            fill="white"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <span
                    v-if="tab.key == 'impact' && card?.impact_dataset"
                    class="tab-icon"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.33333 2V12.6667H14V14H2V2H3.33333ZM13.5287 4.19533L14.4713 5.138L10.6667 8.94267L8.66667 6.94333L5.80467 9.80467L4.862 8.862L8.66667 5.05733L10.6667 7.05667L13.5287 4.19533Z"
                        :fill="selectedTabIndex === index ? '#3558A2' : '#161616'"
                      />
                    </svg>
                  </span>
                  <span
                    v-if="tab.key == 'budget' && card?.budget_url"
                    class="tab-icon"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.00004 1.33331C11.682 1.33331 14.6667 4.31798 14.6667 7.99998C14.6667 11.682 11.682 14.6666 8.00004 14.6666C4.31804 14.6666 1.33337 11.682 1.33337 7.99998C1.33337 4.31798 4.31804 1.33331 8.00004 1.33331ZM8.00004 2.66665C5.05452 2.66665 2.66671 5.05446 2.66671 7.99998C2.66671 10.9455 5.05452 13.3333 8.00004 13.3333C10.9456 13.3333 13.3334 10.9455 13.3334 7.99998C13.3334 5.05446 10.9456 2.66665 8.00004 2.66665ZM10.5434 5.63798L9.40937 6.39331C8.95983 6.01316 8.34308 5.89838 7.78688 6.09135C7.23067 6.28433 6.81754 6.75643 6.70004 7.33331H10V8.66665H6.70004C6.81754 9.24353 7.23067 9.71563 7.78688 9.90861C8.34308 10.1016 8.95983 9.9868 9.40937 9.60665L10.5427 10.362C9.74736 11.2278 8.51955 11.5493 7.40196 11.1842C6.28436 10.8192 5.483 9.83502 5.35204 8.66665H4.66671V7.33331H5.35137C5.48188 6.16433 6.2835 5.17947 7.40165 4.81436C8.5198 4.44925 9.74815 4.77127 10.5434 5.63798Z"
                        :fill="selectedTabIndex === index ? '#3558A2' : '#161616'"
                      />
                    </svg>
                  </span>
                  <span
                    v-if="tab.key == 'roadmap' && card?.roadmap_url"
                    class="tab-icon"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.66671 4.09536V12.6447L6.04337 11.198L10.0434 13.198L13.3334 11.7867V3.23803L14.202 2.86603C14.2528 2.84429 14.3081 2.83548 14.3631 2.84039C14.418 2.84531 14.4709 2.86379 14.517 2.89419C14.563 2.92459 14.6008 2.96595 14.627 3.01456C14.6531 3.06317 14.6668 3.11751 14.6667 3.1727V12.6667L10 14.6667L6.00004 12.6667L1.79804 14.4674C1.74732 14.4891 1.69199 14.4979 1.63702 14.493C1.58205 14.4881 1.52916 14.4696 1.4831 14.4392C1.43704 14.4088 1.39924 14.3674 1.37311 14.3188C1.34698 14.2702 1.33333 14.2159 1.33337 14.1607V4.6667L2.66671 4.09536ZM10.8287 7.49536L8.00004 10.3234L5.17137 7.49536C4.61203 6.93593 4.23114 6.22319 4.07685 5.44729C3.92256 4.67138 4.00182 3.86715 4.30459 3.13629C4.60736 2.40542 5.12005 1.78075 5.77783 1.34125C6.43561 0.901754 7.20894 0.667175 8.00004 0.667175C8.79114 0.667175 9.56447 0.901754 10.2223 1.34125C10.88 1.78075 11.3927 2.40542 11.6955 3.13629C11.9983 3.86715 12.0775 4.67138 11.9232 5.44729C11.7689 6.22319 11.388 6.93593 10.8287 7.49536ZM8.00004 8.43803L9.88537 6.55203C10.2584 6.17912 10.5124 5.70397 10.6154 5.18666C10.7184 4.66936 10.6656 4.13314 10.4638 3.64582C10.262 3.15851 9.92019 2.74198 9.48164 2.44893C9.0431 2.15588 8.52749 1.99946 8.00004 1.99946C7.47259 1.99946 6.95698 2.15588 6.51844 2.44893C6.07989 2.74198 5.73809 3.15851 5.53628 3.64582C5.33447 4.13314 5.28171 4.66936 5.38467 5.18666C5.48763 5.70397 5.74169 6.17912 6.11471 6.55203L8.00004 8.43803Z"
                        :fill="selectedTabIndex === index ? '#3558A2' : '#161616'"
                      />
                    </svg>
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
