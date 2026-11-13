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
    <p class="mb-8 text-gray-plain">
      Les exemples sont autonomes afin de pouvoir vérifier les tailles et les états sans backend local.
    </p>

    <div class="space-y-12 pb-32">
      <section data-testid="components-tag-examples">
        <h2 class="!mb-3">
          Tag — @datagouv/components
        </h2>
        <p class="mb-4 text-gray-plain">
          Ces exemples reprennent directement le composant partagé utilisé dans les informations d’un jeu de données et les cartes de schéma.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <Tag type="secondary">
            Mot-clé statique
          </Tag>
          <Tag
            type="secondary"
            :icon="RiCheckboxCircleLine"
          >
            Schéma de données
          </Tag>
          <NuxtLink
            class="fr-raw-link"
            to="#components-tag-examples"
          >
            <Tag type="secondary">
              Mot-clé avec lien
            </Tag>
          </NuxtLink>
        </div>
      </section>

      <section data-testid="tag-variants">
        <h2 class="!mb-3">
          Tags DSFR interactifs
        </h2>
        <p class="mb-4 text-gray-plain">
          Les variantes propres à cdata reprennent la forme compacte du composant partagé, avec leurs états interactifs DSFR.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <span
            class="fr-tag"
            data-testid="static-tag"
          >Statique</span>
          <button
            class="fr-tag"
            data-testid="clickable-tag"
            type="button"
          >
            Cliquable
          </button>
          <button
            class="fr-tag"
            data-testid="selectable-tag"
            type="button"
            :aria-pressed="isSelected"
            @click="isSelected = !isSelected"
          >
            Sélectionnable
          </button>
          <button
            class="fr-tag fr-tag--dismiss"
            data-testid="dismissible-tag"
            type="button"
            aria-label="Supprimer le tag supprimable"
          >
            Supprimable
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
        <p class="mt-4 text-sm text-gray-plain">
          Survolez les tags et utilisez la touche Tab pour vérifier le hover et le focus clavier.
        </p>
      </section>

      <section data-testid="tags-select-example">
        <h2 class="!mb-3">
          TagsSelect
        </h2>
        <p class="mb-4 text-gray-plain">
          Plusieurs valeurs sélectionnées, avec suppression fonctionnelle.
        </p>
        <div class="max-w-xl">
          <TagsSelect
            v-model="selectedKeywords"
            :suggest="suggestExampleTags"
          />
        </div>
      </section>

      <section data-testid="dataset-label-examples">
        <h2 class="!mb-3">
          DatasetLabelTag
        </h2>
        <p class="mb-4 text-gray-plain">
          La variante liée reste neutre au repos et conserve l’illustration native du label.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Sans lien
            </p>
            <LabelTag
              :badge="servicePublicBadge"
              data-testid="dataset-label-static"
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Avec lien
            </p>
            <LabelTag
              :badge="servicePublicBadge"
              url="#dataset-label-examples"
              class="cdata-dataset-label-tag"
              data-testid="dataset-label-link"
            />
          </div>
          <div class="space-y-2">
            <p class="text-sm font-bold">
              Autre illustration
            </p>
            <LabelTag
              :badge="hvdBadge"
              url="#dataset-label-examples"
              class="cdata-dataset-label-tag"
              data-testid="dataset-label-hvd"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LabelTag, Tag, type TranslatedBadge } from '@datagouv/components-next'
import { RiCheckboxCircleLine } from '@remixicon/vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import TagsSelect from '~/components/TagsSelect.vue'
import type { Tag as KeywordTag } from '~/types/types'

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

async function suggestExampleTags(query: string): Promise<Array<KeywordTag>> {
  const normalizedQuery = query.toLocaleLowerCase()
  return exampleKeywords.filter(tag => tag.text.includes(normalizedQuery))
}

const servicePublicBadge: TranslatedBadge = {
  kind: 'spd',
  label: 'Service public de la donnée',
}
const hvdBadge: TranslatedBadge = {
  kind: 'hvd',
  label: 'Données de forte valeur',
}
</script>
