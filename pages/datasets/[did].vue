<template>
  <div>
    <div class="container">
      <div
        v-if="dataset"
        class="mt-4 flex gap-4 flex-wrap md:flex-nowrap items-center justify-between"
      >
        <Breadcrumb class="md:my-0">
          <BreadcrumbItem
            to="/"
          >
            {{ $t("Accueil") }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/datasets">
            {{ $t("Jeux de données") }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ dataset.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="md:flex-none flex flex-wrap md:flex-nowrap gap-2.5 md:max-w-6/12">
          <FollowButton
            v-if="dataset"
            :url="`/api/1/datasets/${dataset.id}/followers/`"
          />
          <ReportModal
            v-if="!isOrganizationCertified(dataset.organization)"
            :subject="{ id: dataset.id, class: 'Dataset' }"
          />
          <BrandedButton
            v-if="exploreUrl"
            :href="exploreUrl"
            :icon="RiExternalLinkFill"
            icon-right
            size="xs"
            new-tab
            @click="$matomo.trackEvent('Jeux de données', 'Explorer les données', 'Bouton : explorer les données')"
          >
            {{ $t("Explorer les données") }}
          </BrandedButton>
          <EditButton
            v-if="dataset.permissions.edit"
            :id="dataset.id"
            type="datasets"
          />
        </div>
      </div>
    </div>
    <LoadingBlock
      v-if="dataset"
      v-slot="{ data: dataset }"
      :status
      :data="dataset"
    >
      <div class="space-y-8">
        <div class="container pt-3 min-h-32">
          <div class="flex flex-col md:space-x-10 md:flex-row md:items-start">
            <div class="flex-1 overflow-x-hidden">
              <div ref="header">
                <div class="flex gap-3 mb-2">
                  <AdminBadge
                    v-if="dataset.deleted"
                    :icon="RiDeleteBinLine"
                    size="sm"
                    type="secondary"
                  >
                    {{ $t("Supprimé") }}
                  </AdminBadge>
                  <AdminBadge
                    v-if="dataset.private"
                    :icon="RiLockLine"
                    size="sm"
                    type="secondary"
                  >
                    {{ $t("Brouillon") }}
                  </AdminBadge>
                  <AdminBadge
                    v-if="dataset.archived"
                    :icon="RiLockLine"
                    size="sm"
                    type="secondary"
                  >
                    {{ $t("Archivé") }}
                  </AdminBadge>
                </div>
                <h1 class="text-2xl text-gray-title font-extrabold mb-6">
                  {{ dataset.title }}

                  <span
                    v-if="dataset.acronym"
                    class="text-xs text-gray-title font-bold"
                  >
                    {{ dataset.acronym }}
                  </span>
                </h1>
              </div>
              <div class="text-sm text-gray-plain font-bold mb-1 pb-0">
                {{ $t("Description") }}
              </div>
              <ReadMore :wanted-height="sidebarHeight - headerHeight">
                <MarkdownViewer
                  size="sm"
                  :content="dataset.description"
                  :no-headings="true"
                />
              </ReadMore>
            </div>
            <dl
              ref="sidebar"
              class="pl-0 w-full shrink-0 md:w-[384px] space-y-4"
            >
              <div class="space-y-1">
                <dt class="text-sm text-gray-plain font-bold mb-0 pb-0">
                  <template v-if="hasContactPointsWithSpecificRole">
                    {{ $t("Diffuseur") }}
                  </template>
                  <template v-else>
                    {{ $t("Producteur") }}
                  </template>
                </dt>
                <dd class="p-0 text-sm">
                  <OrganizationOwner
                    v-if="dataset.organization"
                    :organization="dataset.organization"
                    as="h2"
                  />
                  <AvatarWithName
                    v-if="dataset.owner"
                    :size="32"
                    :user="dataset.owner"
                    class="space-x-2"
                  />
                  <SimpleBanner
                    v-if="dataset.owner"
                    type="warning"
                    class="text-sm"
                  >
                    {{
                      $t(
                        "Ce jeu de données a été publié à l'initiative et sous la responsabilité de {author}.",
                        {
                          author: `${dataset.owner.first_name} ${dataset.owner.last_name}`,
                        },
                      )
                    }}
                  </SimpleBanner>
                </dd>
              </div>

              <div
                v-if="dataset.contact_points.length"
                class="space-y-1"
              >
                <dt class="text-sm text-gray-plain font-bold mb-0 pb-0">
                  <template v-if="hasContactPointsWithSpecificRole">
                    {{ $t("Attributions") }}
                  </template>
                  <template v-else>
                    {{ $t("Contacts") }}
                  </template>
                </dt>
                <dd class="p-0 text-sm">
                  <ContactPoint
                    v-for="contact in dataset.contact_points"
                    :key="contact.id"
                    :contact
                  />
                </dd>
              </div>

              <div
                v-if="dataset.license && dataset.access_type === 'open'"
                class="space-y-1"
              >
                <dt class="text-sm text-gray-plain font-bold pb-0">
                  {{ $t("Licence") }}
                </dt>
                <dd class="p-0 text-sm">
                  <License :license="dataset.license" />
                </dd>
              </div>

              <div class="space-y-1">
                <dt class="text-sm text-gray-plain font-bold pb-0">
                  {{ $t("Dernière mise à jour") }}
                </dt>
                <dd class="p-0 text-sm">
                  {{ formatDate(dataset.last_update) }}
                </dd>
              </div>

              <AccessTypePanel
                v-if="dataset.access_type !== 'open'"
                :object="dataset"
              />

              <div class="grid gap-4 xl:grid-cols-2">
                <StatBox
                  :title="$t('Vues')"
                  :data="datasetVisits"
                  size="sm"
                  type="line"
                  :summary="datasetVisitsTotal"
                  :since="metricsSince"
                />
                <StatBox
                  v-if="dataset.access_type === 'open'"
                  :title="$t('Téléchargements')"
                  :data="datasetDownloadsResources"
                  size="sm"
                  type="line"
                  :summary="datasetDownloadsResourcesTotal"
                  :since="metricsSince"
                />
              </div>

              <div v-if="dataset.access_type === 'open'">
                <DatasetQuality
                  :quality="dataset.quality"
                  :hide-warnings
                />
              </div>

              <div v-if="badges.length > 0">
                <dt
                  class="text-sm text-gray-plain font-bold flex items-center pb-0"
                >
                  <Toggletip
                    :button-props="{
                      'class': '-ml-2 mt-px px-2',
                      'title': $t('Label'),
                      'data-testid': 'label-toggletip-button',
                    }"
                    no-margin
                  >
                    <template #toggletip="{ close }">
                      <div class="flex justify-between border-b">
                        <h5 class="fr-text--sm fr-my-0 fr-p-2v">
                          {{ $t("Label") }}
                        </h5>
                        <button
                          type="button"
                          :title="$t('Fermer')"
                          class="border-l border-gray-default w-10 text-[1.2rem] flex items-center justify-center"
                          data-testid="label-toggletip-close-button"
                          @click="close"
                        >
                          &times;
                        </button>
                      </div>
                      <div
                        class="py-2 px-4"
                        data-testid="label-toggletip-content"
                      >
                        {{
                          $t(
                            "Certains jeux de données bénéficient d’un ou plusieurs labels reconnus au niveau national, européen ou international.",
                          )
                        }}
                        <br>
                        {{
                          $t(
                            "Ces labels peuvent signaler une valeur réglementaire ou une importance stratégique.",
                          )
                        }}
                      </div>
                      <div
                        v-if="config.public.guidesLabelsUrl"
                        class="w-full text-right py-2 px-4"
                        target="_blank"
                      >
                        <a :href="config.public.guidesLabelsUrl">{{
                          $t("Voir les labels de données")
                        }}</a>
                      </div>
                    </template>
                  </Toggletip>
                  {{ $t("Label") }}
                </dt>
                <dd
                  class="p-0 text-sm flex flex-wrap gap-1"
                  data-testid="label-list"
                >
                  <LabelTag
                    v-for="badge in badges"
                    :key="badge.kind"
                    :badge
                    :url="`/datasets/search?badge=${badge.kind}`"
                  />
                </dd>
              </div>

              <SimpleBanner
                v-if="hideWarnings"
                type="primary-frame"
                class="text-sm"
              >
                {{
                  $t(
                    "La qualité des métadonnées peut être trompeuse car les métadonnées de la source originale peuvent avoir été perdues lors de leur récupération. Nous travaillons actuellement à améliorer la situation.",
                  )
                }}
              </SimpleBanner>

              <SimpleBanner
                v-if="dataset.harvest && 'remote_url' in dataset.harvest"
                type="primary-frame"
                class="text-sm"
              >
                {{ $t("Ce jeu de données provient d'un portail externe.") }}
                <CdataLink
                  :to="dataset.harvest.remote_url as string"
                  rel="ugc nofollow noopener"
                  target="_blank"
                  external
                >
                  {{ $t("Voir la source originale.") }}
                </CdataLink>
              </SimpleBanner>
              <SimpleBanner
                v-if="
                  'transport:url' in dataset.extras
                    && dataset.extras['transport:url']
                "
                type="primary-frame"
              >
                <TranslationT
                  keypath="Consulter ce jeu de données sur {link} pour bénéficier d'informations supplémentaires : validations, visualisations, etc."
                  tag="p"
                  class="!m-0 text-sm"
                >
                  <template #link>
                    <CdataLink :href="dataset.extras['transport:url']">
                      {{
                        $t("le Point d'Accès National aux données de mobilités")
                      }}
                    </CdataLink>
                  </template>
                </TranslationT>
              </SimpleBanner>
            </dl>
          </div>
        </div>

        <RecommendationExternal
          v-if="dataset"
          :dataset
        />

        <div
          v-if="dataset.access_type === 'restricted'"
          class="container"
        >
          <SimpleBanner
            type="pink"
            class="p-4 flex justify-between items-center"
          >
            <div class="space-y-3.5">
              <div>
                <AdminBadge
                  :icon="RiLockLine"
                  size="xs"
                  type="pink"
                >
                  {{ $t('Accès restreint') }}
                </AdminBadge>
              </div>
              <p class="font-bold text-xl">
                {{ $t('Ces données ne sont accessibles que sur habilitation') }}
              </p>
              <p
                v-if="dataset.access_type_reason"
                class="text-sm"
              >
                {{ dataset.access_type_reason }}
              </p>
              <p
                v-else-if="category"
                class="text-sm"
              >
                {{ category.label }}
              </p>
              <p
                v-if="config.public.datasetRestrictedGuideUrl"
                class="mb-0"
              >
                <AppLink
                  :to="config.public.datasetRestrictedGuideUrl"
                  external
                >
                  En savoir plus
                </AppLink>
              </p>
            </div>
            <div v-if="dataset.authorization_request_url">
              <BrandedButton
                color="secondary"
                :icon="RiExternalLinkLine"
                icon-right
                :href="dataset.authorization_request_url"
              >
                {{ $t('Faire une demande d\'habilitation') }}
              </BrandedButton>
            </div>
          </SimpleBanner>
        </div>

        <FullPageTabs
          class="mt-12"
          :links="[
            {
              label: dataset.access_type === 'open' ? $t('Fichiers') : $t('Fichiers publics'),
              href: `/datasets/${route.params.did}`,
              count: dataset.resources.total,
            },
            {
              label: $t('Réutilisations et API'),
              href: `/datasets/${route.params.did}/reuses_and_dataservices`,
              count:
                (dataset.metrics.dataservices || 0)
                + (dataset.metrics.reuses || 0),
            },
            {
              label: $t('Discussions'),
              href: `/datasets/${route.params.did}/discussions`,
              count: dataset.metrics.discussions ?? 0,
            },
            {
              label: $t('Ressources communautaires'),
              href: `/datasets/${route.params.did}/community-resources`,
            },
            {
              label: $t('Informations'),
              href: `/datasets/${route.params.did}/informations`,
            },
          ]"
        />
        <div class="bg-white pt-5 pb-8 lg:pb-24">
          <NuxtPage
            v-if="dataset"
            class="container"
            :dataset
          />
        </div>
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import {
  ReadMore,
  AvatarWithName,
  type DatasetV2WithFullObject,
  SimpleBanner,
  DatasetQuality,
  isOrganizationCertified,
  LoadingBlock,
  type Resource,
  BrandedButton,
  useFormatDate,
  StatBox,
  Toggletip,
  type TranslatedBadge,
  LabelTag,
  AppLink,
  MarkdownViewer,
  useMetrics,
  type DatasetMetrics,
  TranslationT,
  getDescriptionShort,
} from '@datagouv/components-next'
import {
  RiDeleteBinLine,
  RiExternalLinkFill,
  RiExternalLinkLine,
  RiLockLine,
} from '@remixicon/vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'
import type { PaginatedArray } from '~/types/types'
import AccessTypePanel from '~/components/AccessTypes/AccessTypePanel.vue'
import { useElementSize } from '@vueuse/core'

const config = useRuntimeConfig()
const route = useRoute()
const { formatDate } = useFormatDate()
const { t } = useTranslation()

definePageMeta({
  keepScroll: true,
})

const sidebar = useTemplateRef('sidebar')
const header = useTemplateRef('header')

const { height: sidebarHeight } = useElementSize(sidebar)
const { height: headerHeight } = useElementSize(header)

const url = computed(() => `/api/2/datasets/${route.params.did}/`)
const { data: dataset, status } = await useAPI<DatasetV2WithFullObject>(url, {
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
  redirectOn404: true,
  redirectOnSlug: 'did',
})

const title = computed(() => t('Jeu de données - {title} | {site}', { title: dataset.value?.title ?? '', site: config.public.title }))
const robots = computed(() => dataset.value && dataset.value.archived ? 'noindex' : undefined)
const description = computed(() => dataset.value ? getDescriptionShort(dataset.value) : '')

useSeoMeta({
  title,
  robots,
  description,
})

const hideWarnings = computed(() => {
  if (!dataset.value?.harvest) return false
  if (!dataset.value.harvest.backend) return false

  return config.public.harvestBackendsForHidingQuality.includes(
    dataset.value.harvest.backend,
  )
})

const hasContactPointsWithSpecificRole = computed(() => {
  if (!dataset.value) return false
  return dataset.value.contact_points.some(
    contactPoint => contactPoint.role !== 'contact',
  )
})

await useJsonLd('dataset', route.params.did as string)

onMounted(async () => {
  await redirectLegacyHashes([
    {
      from: 'resources',
      to: `/datasets/${route.params.did}`,
      queryParam: 'resource_id',
    },
    {
      from: 'resource',
      to: `/datasets/${route.params.did}`,
      queryParam: 'resource_id',
    },
    {
      from: 'community-reuses',
      to: `/datasets/${route.params.did}/reuses_and_dataservices`,
    },
    {
      from: 'discussions',
      to: `/datasets/${route.params.did}/discussions`,
      queryParam: 'discussion_id',
    },
    {
      from: 'discussion',
      to: `/datasets/${route.params.did}/discussions`,
      queryParam: 'discussion_id',
    },
    {
      from: 'community-resources',
      to: `/datasets/${route.params.did}/community-resources`,
      queryParam: 'resource_id',
    },
    { from: 'information', to: `/datasets/${route.params.did}/informations` },
  ])
})

const { data: resources } = await useAPI<PaginatedArray<Resource>>(
  `/api/2/datasets/${route.params.did}/resources/`,
  { query: { type: 'main' } },
)
const exploreUrl = computed(() => {
  if (!resources.value) return null
  for (const resource of resources.value.data) {
    if (!resource.preview_url) continue
    return resource.preview_url
  }
  return null
})

const { data: badgeTranslations } = await useAPI<Record<string, string>>(
  '/api/1/datasets/badges',
)

const badges = computed(() =>
  (dataset.value?.badges ?? []).map<TranslatedBadge>(b => ({
    ...b,
    label: badgeTranslations.value?.[b.kind] ?? '',
  })),
)

const metricsSince = computed(() => {
  if (!dataset.value) return config.public.metricsSince
  // max of the start of metrics computing and the creation of the dataset on the platform
  return [dataset.value.internal.created_at_internal, config.public.metricsSince].reduce((max, c) => c > max ? c : max)
})

const { getDatasetMetrics } = useMetrics()
const datasetMetrics = ref<DatasetMetrics | null>(null)

watchEffect(async () => {
  if (!dataset.value || !dataset.value.id) return
  datasetMetrics.value = await getDatasetMetrics(dataset.value.id)
})

const datasetVisits = computed(() => datasetMetrics.value?.visits ?? {})
const datasetDownloadsResources = computed(() => datasetMetrics.value?.downloads ?? {})
const datasetVisitsTotal = computed(() => datasetMetrics.value?.visitsTotal ?? 0)
const datasetDownloadsResourcesTotal = computed(() => datasetMetrics.value?.downloadsTotal ?? 0)

const { data: categories } = await useAPI<Array<{ value: string, label: string }>>('/api/1/access_type/reason_categories')
const category = computed(() => {
  if (!dataset.value?.access_type_reason_category) return null
  return categories.value?.find(c => c.value === dataset.value?.access_type_reason_category)
})
</script>
