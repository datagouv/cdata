<template>
  <div>
    <div class="container">
      <div
        v-if="dataset"
        class="mt-4 flex gap-4 flex-wrap md:flex-nowrap items-center justify-between"
      >
        <Breadcrumb class="md:mb-0 md:mt-0">
          <BreadcrumbItem
            to="/"
            :external="true"
          >
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/datasets">
            {{ $t('Jeux de données') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ dataset.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="flex-none flex gap-2.5 md:max-w-6/12">
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
            target="blank"
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
      :status
    >
      <div class="space-y-8">
        <div class="container pt-3 min-h-32">
          <div class="flex flex-col md:space-x-10 md:flex-row">
            <div class="flex-1 overflow-x-hidden">
              <div class="flex gap-3 mb-2">
                <AdminBadge
                  v-if="dataset.deleted"
                  :icon="RiDeleteBinLine"
                  size="sm"
                  type="secondary"
                >
                  {{ $t('Supprimé') }}
                </AdminBadge>
                <AdminBadge
                  v-if="dataset.private"
                  :icon="RiLockLine"
                  size="sm"
                  type="secondary"
                >
                  {{ $t('Brouillon') }}
                </AdminBadge>
                <AdminBadge
                  v-if="dataset.archived"
                  :icon="RiLockLine"
                  size="sm"
                  type="secondary"
                >
                  {{ $t('Archivé') }}
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
              <div class="text-sm text-gray-plain font-bold mb-1 pb-0">
                {{ $t('Description') }}
              </div>
              <ReadMore>
                <MarkdownViewer
                  size="sm"
                  :content="dataset.description"
                  :min-heading="3"
                />
              </ReadMore>
            </div>
            <dl class="pl-0 w-full shrink-0 md:w-[384px] space-y-4">
              <div class="space-y-1">
                <dt class="text-sm text-gray-plain font-bold mb-0 pb-0">
                  <template v-if="hasContactPointsWithSpecificRole">
                    {{ $t('Diffuseur') }}
                  </template>
                  <template v-else>
                    {{ $t('Producteur') }}
                  </template>
                </dt>
                <dd class="p-0 text-sm">
                  <OrganizationOwner
                    v-if="dataset.organization"
                    :organization="dataset.organization"
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
                    {{ $t("Ce jeu de données a été publié à l'initiative et sous la responsabilité de {author}.", { author: `${dataset.owner.first_name} ${dataset.owner.last_name}` }) }}
                  </SimpleBanner>
                </dd>
              </div>

              <div
                v-if="dataset.contact_points.length"
                class="space-y-1"
              >
                <dt class="text-sm text-gray-plain font-bold mb-0 pb-0">
                  <template v-if="hasContactPointsWithSpecificRole">
                    {{ $t('Attributions') }}
                  </template>
                  <template v-else>
                    {{ $t('Contacts') }}
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
                v-if="dataset.license"
                class="space-y-1"
              >
                <dt class="text-sm text-gray-plain font-bold pb-0">
                  {{ $t('Licence') }}
                </dt>
                <dd class="p-0 text-sm">
                  <License :license="dataset.license" />
                </dd>
              </div>

              <div class="space-y-1">
                <dt class="text-sm text-gray-plain font-bold pb-0">
                  {{ $t('Dernière mise à jour') }}
                </dt>
                <dd class="p-0 text-sm">
                  {{ formatDate(dataset.last_update) }}
                </dd>
              </div>
              <div class="grid gap-4 xl:grid-cols-2">
                <StatBox
                  :title="$t('Vues')"
                  :data="datasetVisits"
                  size="sm"
                  type="line"
                  :summary="datasetVisitsTotal"
                />
                <StatBox
                  :title="$t('Téléchargements')"
                  :data="datasetDownloadsResources"
                  size="sm"
                  type="line"
                  :summary="datasetDownloadsResourcesTotal"
                />
              </div>
              <div>
                <DatasetQuality
                  :quality="dataset.quality"
                  :hide-warnings
                />
              </div>

              <div>
                <dt class="text-sm text-gray-plain font-bold flex items-center pb-0">
                  <Toggletip
                    :button-props="{ class: '-ml-2 mt-px px-2', title: $t('Label') }"
                    no-margin
                  >
                    <template #toggletip="{ close }">
                      <div class="flex justify-between border-bottom">
                        <h5 class="fr-text--sm fr-my-0 fr-p-2v">
                          {{ $t("Label") }}
                        </h5>
                        <button
                          type="button"
                          :title="$t('Fermer')"
                          class="border-l border-gray-default w-10 text-[1.2rem] flex items-center justify-center"
                          @click="close"
                        >
                          &times;
                        </button>
                      </div>
                      <div class="py-2 px-4">
                        {{ $t('Certains jeux de données bénéficient d’un ou plusieurs labels reconnus au niveau national, européen ou international.') }}
                        <br>
                        {{ $t('Ces labels peuvent signaler une valeur réglementaire ou une importance stratégique.') }}
                      </div>
                      <div
                        v-if="config.public.guidesLabelsUrl"
                        class="w-full text-right py-2 px-4"
                        target="_blank"
                      >
                        <a :href="config.public.guidesLabelsUrl">{{ $t('Voir les labels de données') }}</a>
                      </div>
                    </template>
                  </Toggletip>
                  {{ $t('Label') }}
                </dt>
                <dd class="p-0 text-sm">
                  {{ dataset.badges.map(b => b.kind).join(', ') }}
                </dd>
              </div>

              <SimpleBanner
                v-if="hideWarnings"
                type="primary-frame"
                class="text-sm"
              >
                {{ $t("La qualité des métadonnées peut être trompeuse car les métadonnées de la source originale peuvent avoir été perdues lors de leur récupération. Nous travaillons actuellement à améliorer la situation.") }}
              </SimpleBanner>

              <SimpleBanner
                v-if="dataset.harvest && 'remote_url' in dataset.harvest"
                type="primary-frame"
                class="text-sm"
              >
                {{ $t("Ce jeu de données provient d'un portail externe.") }}
                <CdataLink
                  :to="dataset.harvest.remote_url"
                  rel="ugc nofollow noopener"
                  target="_blank"
                  external
                >
                  {{ $t("Voir la source originale.") }}
                </CdataLink>
              </SimpleBanner>
              <SimpleBanner
                v-if="'transport:url' in dataset.extras && dataset.extras['transport:url']"
                type="primary-frame"
              >
                <i18n-t
                  keypath="Consulter ce jeu de données sur {link} pour bénéficier d'informations supplémentaires : validations, visualisations, etc."
                  tag="p"
                  class="!m-0 text-sm"
                >
                  <template #link>
                    <CdataLink :href="dataset.extras['transport:url']">
                      {{ $t("le Point d'Accès National aux données de mobilités") }}
                    </CdataLink>
                  </template>
                </i18n-t>
              </SimpleBanner>
            </dl>
          </div>
        </div>

        <RecommendationExternal
          v-if="dataset"
          :dataset
        />

        <FullPageTabs
          class="mt-12"
          :links="[
            { label: $t('Fichiers'), href: `/datasets/${route.params.did}/`, count: dataset.resources.total },
            { label: $t('Réutilisations et API'), href: `/datasets/${route.params.did}/reuses_and_dataservices`, count: (dataset.metrics.dataservices || 0) + (dataset.metrics.reuses || 0) },
            { label: $t('Discussions'), href: `/datasets/${route.params.did}/discussions`, count: dataset.metrics.discussions ?? 0 },
            { label: $t('Ressources communautaires'), href: `/datasets/${route.params.did}/community-resources` },
            { label: $t('Informations'), href: `/datasets/${route.params.did}/informations` },
          ]"
        />
        <div class="bg-white pt-5 pb-8 lg:pb-24 ">
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
import { ReadMore, AvatarWithName, type DatasetV2WithFullObject, SimpleBanner, DatasetQuality, isOrganizationCertified, type Resource, BrandedButton, useFormatDate, StatBox, Toggletip } from '@datagouv/components-next'
import { RiDeleteBinLine, RiExternalLinkFill, RiLockLine } from '@remixicon/vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'
import type { PaginatedArray } from '~/types/types'

const config = useRuntimeConfig()
const route = useRoute()
const { formatDate } = useFormatDate()

definePageMeta({
  keepScroll: true,
})

const url = computed(() => `/api/2/datasets/${route.params.did}/`)
const { data: dataset, status } = await useAPI<DatasetV2WithFullObject>(url, {
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
  redirectOn404: true,
})

const title = computed(() => dataset.value?.title)

useSeoMeta({
  title,
})

const hideWarnings = computed(() => {
  if (!dataset.value.harvest) return false
  if (!dataset.value.harvest.backend) return false

  return config.public.harvestBackendsForHidingQuality.includes(dataset.value.harvest.backend)
})

const hasContactPointsWithSpecificRole = computed(() => {
  return dataset.value.contact_points.some(contactPoint => contactPoint.role !== 'contact')
})

await useJsonLd('dataset', route.params.did as string)

onMounted(async () => {
  await redirectLegacyHashes([
    { from: 'resources', to: `/datasets/${route.params.did}/`, queryParam: 'resource_id' },
    { from: 'resource', to: `/datasets/${route.params.did}/`, queryParam: 'resource_id' },
    { from: 'community-reuses', to: `/datasets/${route.params.did}/reuses_and_dataservices/` },
    { from: 'discussions', to: `/datasets/${route.params.did}/discussions/`, queryParam: 'discussion_id' },
    { from: 'discussion', to: `/datasets/${route.params.did}/discussions/`, queryParam: 'discussion_id' },
    { from: 'community-resources', to: `/datasets/${route.params.did}/community-resources/`, queryParam: 'resource_id' },
    { from: 'information', to: `/datasets/${route.params.did}/informations/` },
  ])
})

const { data: resources } = await useAPI<PaginatedArray<Resource>>(`/api/2/datasets/${route.params.did}/resources/`, { query: { type: 'main' } })
const exploreUrl = computed(() => {
  if (!resources.value) return null
  for (const resource of resources.value.data) {
    if (!resource.preview_url) continue
    return resource.preview_url
  }
  return null
})

const datasetVisits = ref<Record<string, number>>({})
const datasetDownloadsResources = ref<Record<string, number>>({})

const datasetVisitsTotal = ref(0)
const datasetDownloadsResourcesTotal = ref(0)

watchEffect(async () => {
  if (!dataset.value.id) return
  // Fetching last 12 months
  const response = await fetch(`${config.public.metricsApi}/api/datasets/data/?dataset_id__exact=${dataset.value.id}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  for (const { metric_month, monthly_visit, monthly_download_resource } of page.data) {
    datasetVisits.value[metric_month] = monthly_visit
    datasetDownloadsResources.value[metric_month] = monthly_download_resource
  }
  // Fetching totals
  if (page.data[0]) {
    const totalResponse = await fetch(`${config.public.metricsApi}/api/datasets_total/data/?dataset_id__exact=${dataset.value.id}`)
    const totalPage = await totalResponse.json()

    datasetVisitsTotal.value = totalPage.data[0].visit
    datasetDownloadsResourcesTotal.value = totalPage.data[0].download_resource
  }
})
</script>
