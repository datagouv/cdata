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
          <Tag
            type="secondary"
            class="cdata-tag"
            data-testid="components-tag-static"
          >
            Mobilité
          </Tag>
          <Tag
            type="secondary"
            :icon="RiCheckboxCircleLine"
            class="cdata-tag"
            data-testid="components-tag-icon"
          >
            Données ouvertes
          </Tag>
          <NuxtLink
            class="fr-raw-link cdata-tag-link"
            to="#components-tag-examples"
          >
            <Tag
              type="secondary"
              class="cdata-tag"
              data-testid="components-tag-link"
            >
              Environnement
            </Tag>
          </NuxtLink>
        </div>
      </section>

      <section data-testid="tag-variants">
        <h2 class="!mb-3">
          États interactifs
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <span
            class="fr-tag"
            data-testid="static-tag"
          >Tag de catégorie</span>
          <span class="fr-tag">
            <RiInformationLine
              class="size-3.5"
              aria-hidden="true"
            />
            Avec icône
          </span>
          <a
            class="fr-tag"
            href="#tag-variants"
          >Cliquable · lien</a>
          <button
            class="fr-tag"
            data-testid="clickable-tag"
            type="button"
          >
            Cliquable · bouton
          </button>
          <button
            class="fr-tag"
            data-testid="selectable-tag"
            type="button"
            :aria-pressed="isSelected"
            @click="isSelected = !isSelected"
          >
            Sélectionnable
            <RiCheckLine
              v-if="isSelected"
              class="size-3.5"
              aria-hidden="true"
            />
          </button>
          <button
            class="fr-tag"
            data-testid="dismissible-tag"
            type="button"
            aria-label="Supprimer le tag supprimable"
          >
            Supprimable
            <RiCloseLine
              class="size-3.5"
              aria-hidden="true"
            />
          </button>
          <button
            class="fr-tag"
            data-testid="disabled-tag"
            type="button"
            disabled
          >
            Désactivé
          </button>
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
              class="cdata-dataset-label-tag"
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
              class="cdata-dataset-label-tag"
              data-testid="dataset-label-link"
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Libellé long
            </p>
            <LabelTag
              :badge="longBadge"
              class="cdata-dataset-label-tag"
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
            size="sm"
            :type="label.type"
            :icon="label.icon"
          >
            {{ label.label }}
          </AdminBadge>
        </div>
      </section>

      <section data-testid="table-statuses">
        <h2 class="!mb-3">
          Statuts des tableaux
        </h2>
        <div class="space-y-4">
          <div
            v-for="(group, index) in tableStatusGroups"
            :key="index"
            class="flex flex-wrap items-center gap-2"
          >
            <AdminBadge
              v-for="status in group"
              :key="status.label"
              size="xs"
              :type="status.type"
            >
              {{ status.label }}
            </AdminBadge>
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
import { LabelTag, Tag, type TranslatedBadge } from '@datagouv/components-next'
import { RiArchiveLine, RiCheckboxCircleLine, RiCheckLine, RiCloseLine, RiDeleteBinLine, RiGovernmentLine, RiInformationLine, RiLockLine, RiPassValidLine } from '@remixicon/vue'
import type { Component } from 'vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import HvdStatutBadge from '~/components/SuiviDePublication/HvdStatutBadge.vue'
import TagsSelect from '~/components/TagsSelect.vue'
import type { AdminBadgeType, Tag as KeywordTag } from '~/types/types'

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
  { label: 'Brouillon', type: 'secondary', icon: RiLockLine },
  { label: 'Archivé', type: 'warning', icon: RiArchiveLine },
  { label: 'Accès restreint', type: 'warning', icon: RiLockLine },
  { label: 'Ouvert avec un compte', type: 'warning', icon: RiPassValidLine },
  { label: 'Supprimé', type: 'danger', icon: RiDeleteBinLine },
  { label: 'Service public', type: 'primary', icon: RiGovernmentLine },
]
const tableStatusGroups: Array<Array<{ label: string, type: AdminBadgeType }>> = [
  [
    { label: 'Public', type: 'primary' },
    { label: 'Brouillon', type: 'secondary' },
    { label: 'Archivé', type: 'warning' },
    { label: 'Supprimé', type: 'danger' },
  ],
  [
    { label: 'En attente', type: 'secondary' },
    { label: 'En traitement', type: 'primary' },
    { label: 'Terminé', type: 'success' },
    { label: 'Terminé avec des erreurs', type: 'warning' },
    { label: 'Échoué', type: 'danger' },
  ],
  [
    { label: 'Disponible', type: 'primary' },
    { label: 'Indisponible', type: 'danger' },
    { label: 'Pas encore contrôlé', type: 'secondary' },
    { label: 'Nouveau', type: 'primary' },
    { label: 'Répondu', type: 'secondary' },
    { label: 'Clos', type: 'secondary' },
  ],
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
