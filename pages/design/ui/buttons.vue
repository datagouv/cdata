<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Boutons
      </h1>
      <p class="mt-2 text-gray-600">
        Composants de boutons pour les actions utilisateur.
      </p>
    </div>

    <DesignDocSection
      title="BrandedButton"
      description="Bouton principal avec variantes de couleur, taille, et support d'icônes."
      :in-lib="true"
    >
      <template #props>
        <PropsTable :props="brandedButtonProps" />
      </template>

      <template #preview>
        <ComponentPreview>
          <div class="flex flex-wrap items-center gap-4">
            <BrandedButton color="primary">
              Primary
            </BrandedButton>
            <BrandedButton color="secondary">
              Secondary
            </BrandedButton>
            <BrandedButton color="tertiary">
              Tertiary
            </BrandedButton>
            <BrandedButton color="warning">
              Warning
            </BrandedButton>
            <BrandedButton color="danger">
              Danger
            </BrandedButton>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample
          title="Utilisation basique"
          :code="basicButtonCode"
        />
      </template>

      <template #variants>
        <div class="space-y-6">
          <div>
            <h4 class="mb-3 text-sm font-medium text-gray-700">
              Couleurs
            </h4>
            <div class="flex flex-wrap items-center gap-3">
              <BrandedButton
                v-for="color in colors"
                :key="color"
                :color="color"
              >
                {{ color }}
              </BrandedButton>
            </div>
          </div>

          <div>
            <h4 class="mb-3 text-sm font-medium text-gray-700">
              Tailles
            </h4>
            <div class="flex flex-wrap items-center gap-3">
              <BrandedButton
                v-for="size in sizes"
                :key="size"
                :size="size"
                color="primary"
              >
                {{ size }}
              </BrandedButton>
            </div>
          </div>

          <div>
            <h4 class="mb-3 text-sm font-medium text-gray-700">
              Avec icône
            </h4>
            <div class="flex flex-wrap items-center gap-3">
              <BrandedButton
                color="primary"
                :icon="RiAddLine"
              >
                Icône à gauche
              </BrandedButton>
              <BrandedButton
                color="primary"
                :icon="RiArrowRightLine"
                :icon-right="true"
              >
                Icône à droite
              </BrandedButton>
            </div>
          </div>

          <div>
            <h4 class="mb-3 text-sm font-medium text-gray-700">
              États
            </h4>
            <div class="flex flex-wrap items-center gap-3">
              <BrandedButton
                color="primary"
                disabled
              >
                Désactivé
              </BrandedButton>
              <BrandedButton
                color="primary"
                :loading="true"
              >
                Chargement
              </BrandedButton>
            </div>
          </div>

          <div>
            <h4 class="mb-3 text-sm font-medium text-gray-700">
              En tant que lien
            </h4>
            <div class="flex flex-wrap items-center gap-3">
              <BrandedButton
                color="primary"
                href="https://data.gouv.fr"
              >
                Lien externe
              </BrandedButton>
            </div>
          </div>
        </div>
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowRightLine } from '@remixicon/vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'
import PropsTable, { type PropDefinition } from '~/design-system/PropsTable.vue'

const colors = ['primary', 'secondary', 'tertiary', 'warning', 'danger', 'brown-illustration', 'green-illustration', 'white-flat'] as const
const sizes = ['lg', 'sm', 'xs', '2xs'] as const

const brandedButtonProps: PropDefinition[] = [
  { name: 'color', type: 'string', default: '\'primary\'', description: 'Variante de couleur', options: [...colors] },
  { name: 'size', type: 'string', description: 'Taille du bouton', options: ['lg', 'sm', 'xs', '2xs'] },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Désactive le bouton' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Affiche un état de chargement' },
  { name: 'icon', type: 'Component', description: 'Composant icône à afficher' },
  { name: 'iconRight', type: 'boolean', default: 'false', description: 'Place l\'icône à droite' },
  { name: 'href', type: 'string', description: 'URL pour rendre le bouton comme un lien' },
  { name: 'to', type: 'string | RouteLocation', description: 'Route pour NuxtLink' },
]

const basicButtonCode = `
<template>
  <BrandedButton color="primary">
    Mon bouton
  </BrandedButton>

  <BrandedButton color="secondary" :icon="RiAddLine">
    Ajouter
  </BrandedButton>

  <BrandedButton color="danger" :loading="isLoading">
    Supprimer
  </BrandedButton>
</template>

<script setup>
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine } from '@remixicon/vue'
<\/script>
`
</script>
