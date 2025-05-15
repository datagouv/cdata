<template>
  <div>
    <div class="container">
      <div
        v-if="dataset"
        class="flex flex-wrap items-center justify-between"
      >
        <Breadcrumb>
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
        <div class="flex flex-wrap gap-2.5 md:max-w-6/12">
          <EditButton
            v-if="isAdmin(me)"
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
          <h1 class="text-2xl text-gray-title mb-6 font-extrabold">
            {{ dataset.title }}
          </h1>
          <div class="flex flex-col md:space-x-10 md:flex-row">
            <div class="flex-1 overflow-x-hidden">
              <ReadMore class="">
                <MarkdownViewer
                  :content="dataset.description"
                  :min-heading="3"
                />
              </ReadMore>
            </div>
            <dl class="pl-0 w-full shrink-0 md:w-[384px] space-y-3">
              <div class="space-y-1">
                <dt class="text-gray-plain font-bold mb-0 pb-0">
                  {{ $t('Producer') }}
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
                <dt class="text-gray-plain font-bold mb-0 pb-0">
                  {{ $t('Contact') }}
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
                <dt class="text-gray-plain font-bold pb-0">
                  {{ $t('License') }}
                </dt>
                <dd class="p-0 text-sm">
                  <License :license="dataset.license" />
                </dd>
              </div>

              <div class="space-y-1">
                <dt class="text-gray-plain font-bold pb-0">
                  {{ $t('Last update') }}
                </dt>
                <dd class="p-0 text-sm">
                  {{ formatDate(dataset.last_update) }}
                </dd>
              </div>

              <div>
                <DatasetQuality
                  :quality="dataset.quality"
                  show-item-warnings
                />
              </div>

              <SimpleBanner
                v-if="dataset.harvest && 'remote_url' in dataset.harvest"
                type="primary-frame"
                class="text-sm"
              >
                {{ $t("Ce jeu de données provient d'un portail externe.") }}
                <NuxtLink
                  :to="dataset.harvest.remote_url"
                  rel="ugc nofollow noopener"
                >
                  {{ $t("Voir la source originale.") }}
                </NuxtLink>
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
                    <NuxtLink :href="dataset.extras['transport:url']">{{ $t("le Point d'Accès National aux données de mobilités") }}</NuxtLink>
                  </template>
                </i18n-t>
              </SimpleBanner>
            </dl>
          </div>
        </div>

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
import { ReadMore, AvatarWithName, type DatasetV2WithFullObject, SimpleBanner, DatasetQuality } from '@datagouv/components-next'
import EditButton from '~/components/Buttons/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'

const route = useRoute()
const me = useMaybeMe()

const url = computed(() => `/api/2/datasets/${route.params.did}/`)
const { data: dataset, status } = await useAPI<DatasetV2WithFullObject>(url, {
  headers: {
    'X-Get-Datasets-Full-Objects': 'True',
  },
})

const title = computed(() => dataset.value?.title)
const robots = computed(() => dataset.value ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})
</script>
