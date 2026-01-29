<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">
        Design System
      </h1>
      <p class="mt-2 text-lg text-gray-600">
        Documentation des composants UI de data.gouv.fr.
        Explorez les composants disponibles dans la librairie
        <code class="rounded bg-gray-100 px-1.5 py-0.5 text-sm">@datagouv/components-next</code>
        et les composants locaux qui peuvent être portés.
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="category in categories"
        :key="category.title"
      >
        <h2 class="text-sm font-semibold uppercase tracking-wide text-gray-400">
          {{ category.title }}
        </h2>
        <ul class="mt-2 space-y-1">
          <li
            v-for="page in category.pages"
            :key="page.to"
          >
            <NuxtLink
              :to="page.to"
              class="!bg-none text-sm text-gray-700 hover:text-datagouv"
            >
              {{ page.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const categories = [
  {
    title: 'UI',
    pages: [
      { label: 'Boutons', to: '/design/ui/buttons' },
      { label: 'Bannières', to: '/design/ui/banners' },
      { label: 'Badges', to: '/design/ui/badges' },
      { label: 'Loaders', to: '/design/ui/loaders' },
    ],
  },
  {
    title: 'Cards',
    pages: [
      { label: 'Datasets', to: '/design/cards/datasets' },
      { label: 'Dataservices', to: '/design/cards/dataservices' },
      { label: 'Organizations', to: '/design/cards/organizations' },
      { label: 'Reuses', to: '/design/cards/reuses' },
      { label: 'Topics', to: '/design/cards/topics' },
      { label: 'Posts', to: '/design/cards/posts' },
      { label: 'Discussions', to: '/design/cards/discussions' },
      { label: 'Autres', to: '/design/cards/other' },
    ],
  },
  {
    title: 'Affichage',
    pages: [
      { label: 'Avatars', to: '/design/display/avatars' },
      { label: 'Texte', to: '/design/display/text' },
      { label: 'Dates', to: '/design/display/dates' },
      { label: 'Métriques', to: '/design/display/metrics' },
    ],
  },
  {
    title: 'Navigation',
    pages: [
      { label: 'Pagination', to: '/design/navigation/pagination' },
      { label: 'Tabs', to: '/design/navigation/tabs' },
      { label: 'Breadcrumbs', to: '/design/navigation/breadcrumbs' },
      { label: 'Sidemenu', to: '/design/navigation/sidemenu' },
    ],
  },
  {
    title: 'Formulaires',
    pages: [
      { label: 'Inputs', to: '/design/forms/inputs' },
      { label: 'Selects', to: '/design/forms/selects' },
      { label: 'Toggles', to: '/design/forms/toggles' },
      { label: 'Éditeurs', to: '/design/forms/editors' },
    ],
  },
  {
    title: 'Layout',
    pages: [
      { label: 'Containers', to: '/design/layout/containers' },
      { label: 'Modals', to: '/design/layout/modals' },
      { label: 'Accordions', to: '/design/layout/accordions' },
    ],
  },
  {
    title: 'Marque',
    pages: [
      { label: 'Logos', to: '/design/brand/logos' },
      { label: 'Couleurs', to: '/design/brand/colors' },
    ],
  },
  {
    title: 'Embeds',
    pages: [
      { label: 'Cards', to: '/design/embeds/cards' },
      { label: 'OEmbeds', to: '/design/embeds/oembeds' },
    ],
  },
  {
    title: 'Utilitaires',
    pages: [
      { label: 'Composables', to: '/design/utilities/composables' },
      { label: 'Traductions', to: '/design/utilities/translations' },
    ],
  },
]
</script>
