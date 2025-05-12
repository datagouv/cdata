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
            <dl class="pl-0 w-full shrink-0 md:w-[384px] space-y-2.5">
              <div class="space-y-1">
                <dt class="text-gray-plain font-bold">
                  {{ $t('Producer') }}
                </dt>
                <dd class="p-0">
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
                </dd>
              </div>

              <div
                v-if="dataset.contact_points.length"
                class="space-y-1"
              >
                <dt class="text-gray-plain font-bold">
                  {{ $t('Contact') }}
                </dt>
                <dd class="p-0">
                  <ContactPoint
                    v-for="contact in dataset.contact_points"
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
                  {{ formatDate(dataset.last_update) }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <FullPageTabs
          class="mt-12"
          :links="[
            { label: $t('Fichiers'), href: `/datasets/${route.params.did}/`, count: dataset.resources.total },
            { label: $t('Réutilisations et API'), href: `/datasets/${route.params.did}/reuses_and_dataservices` },
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
import { ReadMore, AvatarWithName, type DatasetV2 } from '@datagouv/components-next'
import EditButton from '~/components/BrandedButton/EditButton.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'

const route = useRoute()
const me = useMaybeMe()

const url = computed(() => `/api/2/datasets/${route.params.did}/`)
const { data: dataset, status } = await useAPI<DatasetV2>(url)

const title = computed(() => dataset.value?.title)
const robots = computed(() => dataset.value ? 'noindex, nofollow' : 'all')

useSeoMeta({
  title,
  robots,
})
</script>
