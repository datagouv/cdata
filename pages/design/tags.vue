<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/tags">
        {{ $t('Tags et labels') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="mb-3">
      Tags et labels
    </h1>

    <div class="mt-8 space-y-12 pb-32">
      <section data-testid="components-tag-examples">
        <h2 class="!mb-3">
          Tags
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <Tag data-testid="components-tag-static">
            Mobilité
          </Tag>
          <Tag
            :icon="RiCheckboxCircleLine"
            data-testid="components-tag-icon"
          >
            Données ouvertes
          </Tag>
          <Tag
            to="#components-tag-examples"
            data-testid="components-tag-link"
          >
            Environnement
          </Tag>
        </div>
      </section>

      <section data-testid="tag-variants">
        <h2 class="!mb-3">
          États interactifs
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <Tag data-testid="static-tag">
            Tag de catégorie
          </Tag>
          <Tag
            :icon="RiInformationLine"
            data-testid="icon-tag"
          >
            Avec icône
          </Tag>
          <Tag to="#tag-variants">
            Cliquable · lien
          </Tag>
          <Tag
            data-testid="clickable-tag"
            @click="() => {}"
          >
            Cliquable · bouton
          </Tag>
          <!-- flex: the wrapper must not add a text line around the inline Tag, it would sit higher than its neighbours -->
          <Toggletip
            class="flex"
            :styled-button="false"
            button-class=""
            :button-props="{
              'as': Tag,
              'icon': RiInformationLine,
              'title': 'Afficher les informations du tag',
              'data-testid': 'toggletip-tag',
            }"
          >
            Avec infobulle
            <template #toggletip>
              <section class="flex flex-col gap-3 text-sm/[22px] text-gray-title">
                <p class="m-0 font-semibold">
                  Informations du tag
                </p>
                <p
                  class="m-0"
                  data-testid="toggletip-tag-content"
                >
                  Ce tag apporte une information complémentaire au clic.
                </p>
              </section>
            </template>
          </Toggletip>
          <Tag
            v-model:pressed="isSelected"
            :icon="isSelected ? RiCheckLine : undefined"
            data-testid="selectable-tag"
          >
            Sélectionnable
          </Tag>
          <Tag
            dismissible
            data-testid="dismissible-tag"
          >
            Supprimable
          </Tag>
          <Tag
            data-testid="disabled-tag"
            disabled
            @click="() => {}"
          >
            Désactivé
          </Tag>
        </div>
      </section>

      <section data-testid="tags-select-example">
        <h2 class="!mb-3">
          TagsSelect
        </h2>
        <div class="max-w-xl">
          <TagsSelect v-model="selectedKeywords" />
        </div>
      </section>

      <section data-testid="dataset-label-examples">
        <h2 class="!mb-3">
          Labels de données
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Sans lien
            </p>
            <LabelTag
              :badge="hvdBadge"
              data-testid="dataset-label-static"
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Avec lien
            </p>
            <LabelTag
              :badge="hvdBadge"
              url="/datasets/search?badge=hvd"
              data-testid="dataset-label-link"
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Libellé long
            </p>
            <LabelTag
              :badge="longBadge"
              data-testid="dataset-label-long"
            />
          </div>
        </div>
      </section>

      <section data-testid="card-business-labels">
        <h2 class="!mb-3">
          Labels métier des cartes
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <ObjectStatusBadge
            v-for="status in cardStatuses"
            :key="status"
            :status
          />
          <AccessTypeBadge access-type="restricted" />
          <AccessTypeBadge access-type="open_with_account" />
          <OrganizationTypeBadge type="public-service" />
        </div>
      </section>

      <section data-testid="access-type-badges">
        <h2 class="!mb-3">
          Types d’accès API
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <AccessTypeBadge access-type="open" />
          <AccessTypeBadge access-type="open_with_account" />
          <AccessTypeBadge access-type="restricted" />
        </div>
      </section>

      <section data-testid="schema-badge">
        <h2 class="!mb-3">
          Schéma de données
        </h2>
        <Tag>etalab/schema-irve</Tag>
      </section>

      <section data-testid="table-statuses">
        <h2 class="!mb-3">
          Statuts des tableaux
        </h2>
        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Publication des objets
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <DatasetBadge
                v-for="dataset in statusDatasets"
                :key="dataset.id"
                size="xs"
                :dataset
              />
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Traitements
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <JobBadge
                v-for="job in statusJobs"
                :key="job.id"
                :job
              />
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Disponibilité des ressources
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <ResourceAvailabilityBadge
                v-for="resource in availabilityResources"
                :key="resource.id"
                :resource
              />
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Discussions
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <DiscussionStatusBadge
                v-for="thread in statusThreads"
                :key="thread.id"
                :thread
              />
            </div>
          </div>
        </div>
      </section>

      <section data-testid="external-link-badge-examples">
        <h2 class="!mb-3">
          Badges vers un lien externe
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <div
            class="space-y-2"
            data-testid="external-link-badge-static"
          >
            <p class="text-sm font-bold">
              Sans lien
            </p>
            <ExternalLinkBadge
              label="Publié"
              :url="null"
              tone="success"
              size="xs"
            />
          </div>
          <div
            class="space-y-2"
            data-testid="external-link-badge-link"
          >
            <p class="text-sm font-bold">
              Avec lien
            </p>
            <ExternalLinkBadge
              label="Publié"
              url="https://www.data.gouv.fr/datasets/base-adresse-nationale"
              tone="success"
              size="xs"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AccessTypeBadge, DatasetBadge, LabelTag, ObjectStatusBadge, OrganizationTypeBadge, Tag, Toggletip, type ObjectStatus, type Resource, type TranslatedBadge } from '@datagouv/components-next'
import { RiCheckboxCircleLine, RiCheckLine, RiInformationLine } from '@remixicon/vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ResourceAvailabilityBadge from '~/components/Datasets/ResourceAvailabilityBadge.vue'
import DiscussionStatusBadge from '~/components/Discussions/DiscussionStatusBadge.vue'
import JobBadge from '~/components/Harvesters/JobBadge.vue'
import ExternalLinkBadge from '~/components/ExternalLinkBadge.vue'
import TagsSelect from '~/components/TagsSelect.vue'
import type { Thread } from '~/types/discussions'
import type { HarvesterJobPreview, HarvesterJobStatus } from '~/types/harvesters'
import type { Tag as KeywordTag } from '~/types/types'
import { exampleDatasets } from '~/utils/design/cardExamples'

const isSelected = ref(false)
const selectedKeywords = ref<Array<KeywordTag>>([
  { text: 'transport' },
  { text: 'données-ouvertes' },
  { text: 'accessibilité' },
])
const cardStatuses: Array<ObjectStatus> = ['private', 'archived', 'deleted']
const [publicDataset, , draftDataset, archivedDataset] = exampleDatasets.map(example => example.data)
const statusDatasets = [
  publicDataset!,
  draftDataset!,
  archivedDataset!,
  { ...publicDataset!, id: 'demo-dataset-deleted', deleted: '2026-01-01T00:00:00Z' },
]
const jobStatuses: Array<HarvesterJobStatus> = ['pending', 'initializing', 'initialized', 'processing', 'done', 'done-errors', 'failed']
const statusJobs: Array<HarvesterJobPreview> = jobStatuses.map(status => ({
  id: `demo-job-${status}`,
  created: '2026-01-01T00:00:00Z',
  started: null,
  ended: null,
  status,
  errors: [],
  items: [],
  source: { id: 'demo-harvester', class: 'HarvestSource' },
}))
// The availability and discussion badges only read the fields below: the rest of each object is irrelevant here
const availabilityResources = [true, false, undefined].map((available, index) => ({
  id: `demo-resource-${index}`,
  extras: available === undefined ? {} : { 'check:available': available },
}) as unknown as Resource)
const statusThreads = [
  { id: 'demo-thread-new', closed: null, discussion: [{}] },
  { id: 'demo-thread-answered', closed: null, discussion: [{}, {}] },
  { id: 'demo-thread-closed', closed: '2026-01-01T00:00:00Z', discussion: [{}, {}] },
].map(thread => thread as unknown as Thread)

const hvdBadge: TranslatedBadge = {
  kind: 'hvd',
  label: 'Données de forte valeur',
}
const longBadge: TranslatedBadge = {
  kind: 'example',
  label: 'Un label au libellé particulièrement long pour vérifier le retour à la ligne',
}
</script>
