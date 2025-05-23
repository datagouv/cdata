<template>
  <div>
    <div class="container">
      <div
        v-if="dataservice"
        class="flex flex-wrap items-center justify-between"
      >
        <Breadcrumb>
          <BreadcrumbItem
            to="/"
            :external="true"
          >
            {{ $t('Home') }}
          </BreadcrumbItem>
          <BreadcrumbItem to="/dataservices">
            {{ $t('Dataservices') }}
          </BreadcrumbItem>
          <BreadcrumbItem>
            {{ dataservice.title }}
          </BreadcrumbItem>
        </Breadcrumb>
        <div class="flex gap-3 items-center">
          <EditButton
            v-if="isMeAdmin()"
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
          <div class="flex gap-3 mb-2">
            <AdminBadge
              v-if="dataservice.deleted_at"
              :icon="RiDeleteBinLine"
              size="sm"
              type="secondary"
            >
              {{ $t('Deleted') }}
            </AdminBadge>
            <AdminBadge
              v-if="dataservice.private"
              :icon="RiLockLine"
              size="sm"
              type="secondary"
            >
              {{ $t('Draft') }}
            </AdminBadge>
            <AdminBadge
              v-if="dataservice.archived_at"
              :icon="RiLockLine"
              size="sm"
              type="secondary"
            >
              {{ $t('Archived') }}
            </AdminBadge>
          </div>
          <h1 class="text-2xl text-gray-title mb-6 font-extrabold">
            {{ dataservice.title }}
          </h1>
          <div class="flex flex-col md:space-x-10 md:flex-row">
            <div class="flex-1 overflow-x-hidden">
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
                  {{ $t('Producer') }}
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
                  {{ $t('Last update') }}
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
                  {{ $t('Rate limiting') }}
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
                  {{ $t('Access') }}
                </dt>
                <dd class="p-0">
                  <DataserviceAccessTypeBadge :dataservice />

                  <div
                    v-if="dataservice.authorization_request_url"
                    class="mt-2"
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
              {{ $t('Access the API') }}
            </div>
            <BrandedButton
              color="primary"
              :href="dataservice.business_documentation_url"
              :icon="RiExternalLinkLine"
              icon-right
              external
            >
              {{ $t('Business documentation') }}
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
import { isOrganizationCertified, BrandedButton, Swagger, ReadMore, SimpleBanner, type Dataservice, AvatarWithName, formatDate } from '@datagouv/components-next'
import { RiArrowDownSLine, RiArrowUpSLine, RiDeleteBinLine, RiExternalLinkLine, RiLockLine } from '@remixicon/vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import DataserviceAccessTypeBadge from '~/components/AdminTable/AdminDataservicesTable/DataserviceAccessTypeBadge.vue'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'
import ReportModal from '~/components/Spam/ReportModal.vue'

const route = useRoute()

const url = computed(() => `/api/1/dataservices/${route.params.did}/`)
const { data: dataservice, status } = await useAPI<Dataservice>(url)

const title = computed(() => dataservice.value?.title)

useSeoMeta({
  title,
})
await useJsonLd('dataservice', route.params.did)

const openSwagger = ref(false)

onMounted(async () => {
  await redirectLegacyHashes([
    { from: 'discussions', to: `/dataservices/${route.params.did}/discussions/`, queryParam: 'discussion_id' },
  ])
})
</script>
