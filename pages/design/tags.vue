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
      Reprise des variantes proposées dans le Component Design Lab. Les exemples sont autonomes afin de vérifier les états sans backend local.
    </p>

    <div class="space-y-12 pb-32">
      <section data-testid="components-tag-examples">
        <h2 class="!mb-3">
          Tag — proposition du Design Lab
        </h2>
        <p class="mb-4 text-gray-plain">
          Le composant est possédé par @datagouv/components-next. Ces exemples montrent son rendu actuel côté consommateur ; son API interactive devra être portée dans ce dépôt partagé.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <Tag type="secondary">
            Mobilité
          </Tag>
          <Tag
            type="secondary"
            :icon="RiCheckboxCircleLine"
          >
            Données ouvertes
          </Tag>
          <NuxtLink
            class="fr-raw-link"
            to="#components-tag-examples"
          >
            <Tag type="secondary">
              Environnement
            </Tag>
          </NuxtLink>
        </div>
      </section>

      <section data-testid="tag-variants">
        <h2 class="!mb-3">
          Variantes et états interactifs
        </h2>
        <p class="mb-4 text-gray-plain">
          Géométrie et états de la proposition Tag : 12/18, icônes 14 px, pilule neutre et couleurs d’action DSFR.
        </p>
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
        <p class="mt-4 text-sm text-gray-plain">
          Survolez les tags et utilisez la touche Tab pour vérifier le hover et le focus clavier.
        </p>
      </section>

      <section data-testid="tags-select-example">
        <h2 class="!mb-3">
          TagsSelect
        </h2>
        <p class="mb-4 text-gray-plain">
          Plusieurs valeurs sélectionnées avec la géométrie du Design Lab et suppression fonctionnelle.
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
          DatasetLabelTag — proposition du Design Lab
        </h2>
        <p class="mb-4 text-gray-plain">
          La variante statique reste informative ; la variante liée adopte les états du tag interactif. L’illustration est contenue dans 14 px, sans pastille blanche.
        </p>
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

      <section data-testid="hvd-status-examples">
        <h2 class="!mb-3">
          HvdStatutBadge — proposition du Design Lab
        </h2>
        <p class="mb-4 text-gray-plain">
          Le statut conserve sa couleur métier. Avec une URL, toute la pastille est cliquable, l’icône externe n’apparaît qu’une fois et seul le libellé se souligne au survol.
        </p>
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
import { RiCheckLine, RiCheckboxCircleLine, RiCloseLine, RiInformationLine } from '@remixicon/vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import HvdStatutBadge from '~/components/SuiviDePublication/HvdStatutBadge.vue'
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

const hvdBadge: TranslatedBadge = {
  kind: 'hvd',
  label: 'Données de forte valeur',
}
const longBadge: TranslatedBadge = {
  kind: 'example',
  label: 'Un label au libellé particulièrement long pour vérifier le retour à la ligne',
}
</script>
