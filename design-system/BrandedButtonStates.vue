<template>
  <div class="space-y-12">
    <section data-capture="sizes">
      <h2 class="text-xl font-bold mb-4">
        Couleurs × tailles
      </h2>
      <div class="overflow-x-auto">
        <table class="border-separate border-spacing-3">
          <thead>
            <tr>
              <th class="text-left text-xs font-normal text-gray-medium" />
              <th
                v-for="size in sizes"
                :key="size"
                class="text-left text-xs font-normal text-gray-medium"
              >
                {{ size }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="color in colors"
              :key="color"
            >
              <th class="text-left text-xs font-normal text-gray-medium pr-2">
                {{ color }}
              </th>
              <td
                v-for="size in sizes"
                :key="size"
                class="align-middle"
              >
                <BrandedButton
                  :color
                  :size
                >
                  Publier
                </BrandedButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section data-capture="states">
      <h2 class="text-xl font-bold mb-4">
        Couleurs × états (taille standard)
      </h2>
      <div class="overflow-x-auto">
        <table class="border-separate border-spacing-3">
          <thead>
            <tr>
              <th />
              <th
                v-for="state in states"
                :key="state.label"
                class="text-left text-xs font-normal text-gray-medium"
              >
                {{ state.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="color in colors"
              :key="color"
            >
              <th class="text-left text-xs font-normal text-gray-medium pr-2">
                {{ color }}
              </th>
              <td
                v-for="state in states"
                :key="state.label"
                class="align-middle"
              >
                <BrandedButton
                  :color
                  v-bind="state.props"
                >
                  {{ state.text }}
                </BrandedButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section data-capture="icon-sizes">
      <h2 class="text-xl font-bold mb-4">
        Icônes et boutons iconiques × tailles
      </h2>
      <div class="overflow-x-auto">
        <table class="border-separate border-spacing-3">
          <tbody>
            <tr
              v-for="color in ['primary', 'secondary', 'tertiary'] as const"
              :key="color"
            >
              <th class="text-left text-xs font-normal text-gray-medium pr-2">
                {{ color }}
              </th>
              <td
                v-for="size in sizes"
                :key="size"
                class="align-middle"
              >
                <div class="flex items-center gap-2">
                  <BrandedButton
                    :color
                    :size
                    :icon="RiAddLine"
                  >
                    Ajouter
                  </BrandedButton>
                  <BrandedButton
                    :color
                    :size
                    :icon="RiAddLine"
                    icon-only
                  >
                    Ajouter
                  </BrandedButton>
                  <BrandedButton
                    :color
                    :size
                    :icon="RiAddLine"
                    loading
                  >
                    Ajouter
                  </BrandedButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      data-capture="banners"
      class="space-y-3 max-w-3xl"
    >
      <h2 class="text-xl font-bold mb-4">
        Dans BannerAction (type hérité)
      </h2>
      <BannerAction
        v-for="type in (['primary', 'warning', 'danger'] as const)"
        :key="type"
        :type
        title="Ce jeu de données n'a pas de licence"
      >
        Choisissez une licence pour permettre sa réutilisation.
        <template #button>
          <BrandedButton :icon="RiPencilLine">
            Modifier
          </BrandedButton>
        </template>
      </BannerAction>
    </section>

    <section
      data-capture="parents"
      class="space-y-4"
    >
      <h2 class="text-xl font-bold mb-4">
        Classes ajoutées par les parents
      </h2>
      <div class="flex flex-wrap items-start gap-4">
        <BrandedButton class="mt-3">
          mt-3
        </BrandedButton>
        <BrandedButton
          color="secondary"
          class="w-full sm:w-auto"
        >
          w-full sm:w-auto
        </BrandedButton>
        <BrandedButton
          color="secondary"
          size="xs"
          class="rounded-full"
        >
          rounded-full
        </BrandedButton>
        <BrandedButton
          color="tertiary"
          size="xs"
          class="bg-white shadow-sm"
        >
          bg-white shadow-sm
        </BrandedButton>
        <div class="bg-new-blue-illustration p-3">
          <BrandedButton
            color="white-flat"
            class="text-new-blue-illustration"
          >
            white-flat + text-new-blue-illustration
          </BrandedButton>
        </div>
        <BrandedButton
          size="lg"
          class="rounded-l-none rounded-br-none rounded-tr min-h-12"
          :icon="RiSearchLine"
        >
          Rechercher
        </BrandedButton>
        <BrandedButton
          color="secondary"
          class="hidden"
        >
          hidden (ne doit pas apparaître)
        </BrandedButton>
      </div>
    </section>

    <section
      data-capture="long"
      class="space-y-4"
    >
      <h2 class="text-xl font-bold mb-4">
        Libellés longs (conteneur de 240 px)
      </h2>
      <div class="w-60 space-y-3 border border-dashed border-gray-silver p-2">
        <BrandedButton>
          Télécharger toutes les ressources de ce jeu de données au format CSV
        </BrandedButton>
        <BrandedButton
          color="secondary"
          size="xs"
          :icon="RiDownloadLine"
        >
          Télécharger toutes les ressources de ce jeu de données
        </BrandedButton>
        <BrandedButton
          color="tertiary"
          href="https://www.data.gouv.fr/fr/pages/onboarding/producteurs"
          new-tab
        >
          Consulter le guide de publication des producteurs
        </BrandedButton>
      </div>
    </section>

    <section
      data-capture="mobile"
      class="space-y-4"
    >
      <h2 class="text-xl font-bold mb-4">
        Icône seule sur mobile (sous 576 px)
      </h2>
      <div class="flex gap-3">
        <BrandedButton
          :icon="RiAddLine"
          icon-only-on-mobile
        >
          Publier sur data.gouv.fr
        </BrandedButton>
        <BrandedButton
          color="secondary"
          icon-only-on-mobile
        >
          Sans icône, le texte reste
        </BrandedButton>
      </div>
    </section>

    <section
      data-capture="lab"
      class="space-y-4"
    >
      <h2 class="text-xl font-bold mb-4">
        Exemples du Lab (buttons-01)
      </h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="example in labExamples"
          :key="example.label"
          class="space-y-2"
        >
          <div class="text-xs text-gray-medium">
            {{ example.label }}
          </div>
          <form @submit.prevent>
            <BrandedButton v-bind="example.props">
              Publier les données
            </BrandedButton>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiDownloadLine, RiPencilLine, RiSearchLine } from '@remixicon/vue'

const colors = ['primary', 'secondary', 'tertiary', 'tertiary-blue', 'warning', 'danger', 'white-flat', 'brown-illustration', 'green-illustration'] as const
const sizes = ['2xs', 'xs', 'sm', 'lg', 'xl'] as const

const states = [
  { label: 'Défaut', text: 'Publier', props: {} },
  { label: 'Icône', text: 'Ajouter', props: { icon: RiAddLine } },
  { label: 'Icône à droite', text: 'Ajouter', props: { icon: RiAddLine, iconRight: true } },
  { label: 'Iconique', text: 'Ajouter', props: { icon: RiAddLine, iconOnly: true } },
  { label: 'Chargement', text: 'Publier', props: { loading: true } },
  { label: 'Désactivé', text: 'Publier', props: { disabled: true } },
  { label: 'Lien', text: 'Voir', props: { href: '/datasets' } },
  { label: 'Nouvel onglet', text: 'Voir', props: { href: 'https://www.data.gouv.fr', newTab: true } },
  { label: 'Lien désactivé', text: 'Voir', props: { href: '/datasets', disabled: true } },
]

// Same list as src/buttonExamples.js in the former Design Lab
const labExamples = [
  ...(['primary', 'secondary', 'tertiary', 'warning', 'danger', 'white-flat', 'brown-illustration', 'green-illustration'] as const).map(color => ({ label: color, props: { color } })),
  ...sizes.map(size => ({ label: `Taille ${size}`, props: { size } })),
  { label: 'Désactivé', props: { disabled: true } },
  { label: 'Chargement', props: { loading: true } },
  { label: 'Avec icône', props: { icon: RiAddLine } },
  { label: 'Icône à droite', props: { icon: RiAddLine, iconRight: true } },
  { label: 'Icône seule', props: { icon: RiAddLine, iconOnly: true, title: 'Publier les données', ariaLabel: 'Publier les données' } },
  { label: 'Icône seule en chargement', props: { icon: RiAddLine, iconOnly: true, loading: true, title: 'Publier les données', ariaLabel: 'Publier les données' } },
  { label: 'Icône sur mobile', props: { icon: RiAddLine, iconOnlyOnMobile: true } },
  { label: 'Lien externe', props: { href: 'https://www.data.gouv.fr', newTab: true } },
  { label: 'Lien désactivé', props: { href: 'https://www.data.gouv.fr', disabled: true } },
  { label: 'Soumission', props: { type: 'submit' as const } },
]
</script>
