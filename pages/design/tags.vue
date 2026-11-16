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
          <Toggletip
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
            :pressed="isSelected"
            :icon="isSelected ? RiCheckLine : undefined"
            data-testid="selectable-tag"
            @click="isSelected = !isSelected"
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
          <TagsSelect
            v-model="selectedKeywords"
            :suggest="suggestExampleTags"
          />
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
          <AdminBadge
            v-for="label in cardBusinessLabels"
            :key="label.label"
            medium
            size="sm"
            :type="label.type"
            :icon="label.icon"
          >
            {{ label.label }}
          </AdminBadge>
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
          <div
            v-for="group in tableStatusGroups"
            :key="group.label"
            class="space-y-2"
          >
            <p class="text-sm font-bold">
              {{ group.label }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <AdminBadge
                v-for="status in group.statuses"
                :key="status.label"
                size="xs"
                :type="status.type"
              >
                {{ status.label }}
              </AdminBadge>
            </div>
          </div>
        </div>
      </section>

      <section data-testid="hvd-status-examples">
        <h2 class="!mb-3">
          Statuts HVD
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <div
            class="space-y-2"
            data-testid="hvd-status-empty"
          >
            <p class="text-sm font-bold">
              Sans statut
            </p>
            <HvdStatutBadge
              :statut="null"
              :url="null"
              type="default"
              :links-to-data="false"
            />
          </div>
          <div
            class="space-y-2"
            data-testid="hvd-status-static"
          >
            <p class="text-sm font-bold">
              Statut fourni par la page
            </p>
            <HvdStatutBadge
              statut="Publié"
              :url="null"
              type="success"
              :links-to-data="false"
            />
          </div>
          <div
            class="space-y-2"
            data-testid="hvd-status-link"
          >
            <p class="text-sm font-bold">
              Avec lien vers les données
            </p>
            <HvdStatutBadge
              statut="Publié"
              url="https://www.data.gouv.fr/datasets/base-adresse-nationale"
              type="success"
              :links-to-data="true"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LabelTag, Tag, Toggletip, type TranslatedBadge } from '@datagouv/components-next'
import { RiArchiveLine, RiCheckboxCircleLine, RiCheckLine, RiDeleteBinLine, RiDraftLine, RiGovernmentLine, RiInformationLine, RiLockLine, RiPassValidLine } from '@remixicon/vue'
import type { Component } from 'vue'
import AccessTypeBadge from '~/components/AccessTypes/AccessTypeBadge.vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import DatasetBadge from '~/components/AdminBadge/DatasetBadge.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import JobBadge from '~/components/Harvesters/JobBadge.vue'
import HvdStatutBadge from '~/components/SuiviDePublication/HvdStatutBadge.vue'
import TagsSelect from '~/components/TagsSelect.vue'
import type { HarvesterJobPreview, HarvesterJobStatus } from '~/types/harvesters'
import type { AdminBadgeType, Tag as KeywordTag } from '~/types/types'
import { exampleDatasets } from '~/utils/design/cardExamples'

const isSelected = ref(false)
const selectedKeywords = ref<Array<KeywordTag>>([
  { text: 'transport' },
  { text: 'données-ouvertes' },
  { text: 'accessibilité' },
])
const exampleKeywords: Array<KeywordTag> = [
  { text: 'transport' },
  { text: 'données-ouvertes' },
  { text: 'accessibilité' },
  { text: 'environnement' },
  { text: 'mobilité' },
]
const cardBusinessLabels: Array<{ label: string, type: AdminBadgeType, icon: Component }> = [
  { label: 'Brouillon', type: 'secondary', icon: RiDraftLine },
  { label: 'Archivé', type: 'warning', icon: RiArchiveLine },
  { label: 'Accès restreint', type: 'warning', icon: RiLockLine },
  { label: 'Ouvert avec un compte', type: 'yellow', icon: RiPassValidLine },
  { label: 'Supprimé', type: 'danger', icon: RiDeleteBinLine },
  { label: 'Service public', type: 'primary', icon: RiGovernmentLine },
]
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
// These statuses come from private getStatus functions of their tables: there is no component to render on its own
const tableStatusGroups: Array<{ label: string, statuses: Array<{ label: string, type: AdminBadgeType }> }> = [
  {
    label: 'Disponibilité des ressources principales',
    statuses: [
      { label: 'Disponible', type: 'primary' },
      { label: 'Indisponible', type: 'danger' },
      { label: 'Inconnu', type: 'warning' },
    ],
  },
  {
    label: 'Disponibilité des ressources communautaires',
    statuses: [
      { label: 'Disponible', type: 'primary' },
      { label: 'Indisponible', type: 'danger' },
      { label: 'Pas encore contrôlé', type: 'secondary' },
    ],
  },
  {
    label: 'Discussions',
    statuses: [
      { label: 'Nouveau', type: 'primary' },
      { label: 'Répondu', type: 'secondary' },
      { label: 'Clos', type: 'secondary' },
    ],
  },
]

async function suggestExampleTags(query: string): Promise<Array<KeywordTag>> {
  const normalizedQuery = query.toLocaleLowerCase()
  return exampleKeywords.filter(tag => tag.text.includes(normalizedQuery))
}

const hvdBadge: TranslatedBadge = {
  kind: 'hvd',
  label: 'Données de forte valeur',
}
const longBadge: TranslatedBadge = {
  kind: 'example',
  label: 'Un label au libellé particulièrement long pour vérifier le retour à la ligne',
}
</script>
