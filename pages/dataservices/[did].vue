<template>
  <div>
    <div class="container">
      <div
        v-if="dataservice"
        class="mt-4 flex gap-4 flex-wrap md:flex-nowrap items-center justify-between"
      >
        <Breadcrumb class="md:mb-0 md:mt-0">
          <BreadcrumbItem
            to="/"
            :external="true"
          >
            {{ $t('Accueil') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/dataservices">
            {{ $t('API') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ dataservice.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="flex-none flex gap-2.5 items-center">
          <FollowButton
            v-if="dataservice"
            :url="`/api/1/dataservices/${dataservice.id}/followers/`"
          />
          <EditButton
            v-if="dataservice.permissions.edit"
            :id="dataservice.id"
            type="dataservices"
          />
          <ReportModal
            v-if="!isOrganizationCertified(dataservice.organization)"
            :subject="{ id: dataservice.id, class: 'Dataservice' }"
          />
        </div>
      </div>
    </div>
    <LoadingBlock
      v-if="dataservice"
      :status
    >
      <div class="space-y-8">
        <div class="container pt-3 min-h-32">
          <div class="flex flex-col md:space-x-10 md:flex-row">
            <div class="flex-1 overflow-x-hidden">
              <div class="flex gap-3 mb-2">
                <AdminBadge
                  v-if="dataservice.deleted_at"
                  :icon="RiDeleteBinLine"
                  size="sm"
                  type="secondary"
                >
                  {{ $t('Supprimé') }}
                </AdminBadge>
                <AdminBadge
                  v-if="dataservice.private"
                  :icon="RiLockLine"
                  size="sm"
                  type="secondary"
                >
                  {{ $t('Brouillon') }}
                </AdminBadge>
                <AdminBadge
                  v-if="dataservice.archived_at"
                  :icon="RiLockLine"
                  size="sm"
                  type="secondary"
                >
                  {{ $t('Archivé') }}
                </AdminBadge>
              </div>
              <h1 class="text-2xl text-gray-title mb-6 font-extrabold">
                {{ dataservice.title }}
              </h1>
              <ReadMore class="">
                <MarkdownViewer
                  size="md"
                  :content="dataservice.description"
                  :min-heading="3"
                />
              </ReadMore>
            </div>
            <dl class="pl-0 w-full shrink-0 md:w-[384px] space-y-2.5">
              <div class="space-y-1">
                <dt class="text-gray-plain font-bold">
                  {{ $t('Producteur') }}
                </dt>
                <dd class="p-0">
                  <OrganizationOwner
                    v-if="dataservice.organization"
                    :organization="dataservice.organization"
                  />
                  <AvatarWithName
                    v-if="dataservice.owner"
                    :size="32"
                    :user="dataservice.owner"
                    class="space-x-2"
                  />
                </dd>
              </div>

              <div
                v-if="dataservice.contact_points.length"
                class="space-y-1"
              >
                <dt class="text-gray-plain font-bold">
                  {{ $t('Contact') }}
                </dt>
                <dd class="p-0">
                  <ContactPoint
                    v-for="contact in dataservice.contact_points"
                    :key="contact.id"
                    :contact
                  />
                </dd>
              </div>

              <div class="space-y-1">
                <dt class="text-gray-plain font-bold">
                  {{ $t('Dernière mise à jour') }}
                </dt>
                <dd class="p-0">
                  {{ formatDate(dataservice.metadata_modified_at) }}
                </dd>
              </div>

              <div
                v-if="dataservice.rate_limiting "
                class="space-y-1"
              >
                <dt class="text-gray-plain font-bold">
                  {{ $t(`Limite d'appels`) }}
                </dt>
                <dd class="p-0">
                  {{ dataservice.rate_limiting }}
                </dd>
              </div>

              <div
                class="space-y-1"
              >
                <dt class="text-gray-plain font-bold">
                  {{ $t('Taux de disponibilité') }}
                </dt>
                <dd class="p-0">
                  <span v-if="dataservice.availability">
                    {{ dataservice.availability }}%
                  </span>
                  <span v-else>
                    {{ $t('Non communiqué') }}
                  </span>
                </dd>
              </div>

              <div class="space-y-1">
                <dt class="text-gray-plain font-bold">
                  {{ $t('Accès') }}
                </dt>
                <dd class="p-0">
                  <DataserviceAccessTypeBadge
                    v-if="dataservice.access_type"
                    :dataservice
                  />
                  <template v-else>
                    {{ $t('Non spécifié') }}
                  </template>
                  <div
                    v-if="dataservice.authorization_request_url"
                    class="mt-2.5"
                  >
                    <a
                      :href="dataservice.authorization_request_url"
                      rel="ugc nofollow noopener"
                      target="_blank"
                      class="fr-text--sm fr-link"
                    >
                      {{ $t("Faire une demande d'habilitation") }}
                    </a>
                  </div>
                </dd>
                <template v-if="dataservice.access_type === 'restricted'">
                  <dt class="text-gray-plain font-bold mt-2.5">
                    {{ $t('Publics éligibles') }}
                  </dt>
                  <dd
                    class="p-0"
                  >
                    <ul
                      v-if="accessAudiences.length"
                      class="list-none p-0 space-y-1 m-0"
                    >
                      <template
                        v-for="audience in accessAudiences"
                        :key="audience"
                      >
                        <DataservicesAccessAudienceCondition
                          :condition="audience.condition"
                          :audience="audience.role"
                        />
                      </template>
                    </ul>
                    <template v-else>
                      {{ $t('Non spécifiés') }}
                    </template>
                  </dd>
                </template>
              </div>
              <div>
                <StatBox
                  :title="$t('Vues')"
                  :data="metricsViews"
                  size="sm"
                  type="line"
                  :summary="metricsViewsTotal"
                  class="mb-8 md:mb-0"
                />
              </div>
            </dl>
          </div>
        </div>

        <div class="container space-y-4">
          <SimpleBanner
            v-if="dataservice.business_documentation_url"
            type="primary-frame"
            class="flex items-center justify-between"
          >
            <div class="text-datagouv-dark font-bold text-xl">
              {{ $t(`Accéder à l'API`) }}
            </div>
            <BrandedButton
              color="primary"
              :href="dataservice.business_documentation_url"
              :icon="RiExternalLinkLine"
              icon-right
              external
            >
              {{ $t('Documentation métier') }}
            </BrandedButton>
          </SimpleBanner>
          <SimpleBanner
            v-if="dataservice.machine_documentation_url"
            type="primary-frame"
          >
            <button
              type="button"
              class="min-h-[42px] w-full flex items-center justify-between"
              @click="openSwagger = !openSwagger"
            >
              <div class="text-datagouv-dark font-bold text-xl">
                {{ $t('Swagger') }}
              </div>
              <RiArrowUpSLine
                v-if="openSwagger"
                class="size-6 text-gray-title"
              />
              <RiArrowDownSLine
                v-else
                class="size-6 text-gray-title"
              />
            </button>
            <Swagger
              v-if="openSwagger"
              :url="dataservice.machine_documentation_url"
            />
          </SimpleBanner>
        </div>

        <FullPageTabs
          class="mt-12"
          :links="[
            { label: $t('Informations'), href: `/dataservices/${route.params.did}/` },
            { label: $t('Discussions'), href: `/dataservices/${route.params.did}/discussions`, count: dataservice.metrics.discussions ?? 0 },
          ]"
        />
        <div class="bg-white pt-5 pb-8 lg:pb-24">
          <NuxtPage
            v-if="dataservice"
            class="container"
            :dataservice
          />
        </div>
      </div>
    </LoadingBlock>
  </div>
</template>

<script setup lang="ts">
import { isOrganizationCertified, BrandedButton, Swagger, ReadMore, SimpleBanner, type Dataservice, AvatarWithName, useFormatDate, type AccessAudienceType, type AccessAudience, StatBox } from '@datagouv/components-next'
import { RiArrowDownSLine, RiArrowUpSLine, RiDeleteBinLine, RiExternalLinkLine, RiLockLine } from '@remixicon/vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import DataserviceAccessTypeBadge from '~/components/AdminTable/AdminDataservicesTable/DataserviceAccessTypeBadge.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'

const config = useRuntimeConfig()
const route = useRoute()
const { formatDate } = useFormatDate()

const url = computed(() => `/api/1/dataservices/${route.params.did}/`)
const { data: dataservice, status } = await useAPI<Dataservice>(url, { redirectOn404: true })

const title = computed(() => dataservice.value?.title)

useSeoMeta({
  title,
})
await useJsonLd('dataservice', route.params.did)

const openSwagger = ref(false)

const accessAudiences = computed(() => (['local_authority_and_administration', 'company_and_association', 'private'] as Array<AccessAudienceType>)
  .map(type => dataservice.value.access_audiences.find(a => a.role === type))
  .filter(Boolean) as Array<AccessAudience>)

const metricsViews = ref<null | Record<string, number>>(null)
const metricsViewsTotal = ref<null | number>(null)

watchEffect(async () => {
  if (!dataservice.value.id) return
  const response = await fetch(`${config.public.metricsApi}/api/dataservices/data/?dataservice_id__exact=${dataservice.value.id}&metric_month__sort=desc&page_size=12`)
  const page = await response.json()

  const views: Record<string, number> = {}

  for (const { metric_month, monthly_visit } of page.data) {
    views[metric_month] = monthly_visit
  }
  // Fetching totals
  const totalResponse = await fetch(`${config.public.metricsApi}/api/dataservices_total/data/?dataservice_id__exact=${dataservice.value.id}`)
  const totalPage = await totalResponse.json()

  let totalViews = 0
  if (page.data[0]) {
    totalViews = totalPage.data[0].visit
  }
  metricsViews.value = views
  metricsViewsTotal.value = totalViews
})

onMounted(async () => {
  await redirectLegacyHashes([
    { from: 'discussions', to: `/dataservices/${route.params.did}/discussions/`, queryParam: 'discussion_id' },
    { from: 'discussion', to: `/dataservices/${route.params.did}/discussions/`, queryParam: 'discussion_id' },
  ])
})
</script>
