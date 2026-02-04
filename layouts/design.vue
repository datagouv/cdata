<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader :fluid="true" />
    <BannerReadOnly :fluid="true" />
    <div class="flex flex-1">
      <aside class="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <div class="sticky top-0 flex h-screen flex-col overflow-y-auto">
          <div class="border-b border-gray-200 px-4 py-3">
            <NuxtLink
              to="/design"
              class="!bg-none text-base font-semibold text-gray-900 hover:text-datagouv"
            >
              Design System
            </NuxtLink>
          </div>

          <div class="p-3">
            <div class="relative">
              <RiSearchLine class="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="w-full rounded border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm focus:border-datagouv focus:bg-white focus:outline-none"
              >
            </div>
          </div>

          <nav class="flex-1 overflow-y-auto pb-4">
            <template
              v-for="category in filteredNavigation"
              :key="category.name"
            >
              <div class="mb-1 mt-5 px-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                {{ category.name }}
              </div>
              <NuxtLink
                v-for="item in category.items"
                :key="item.to"
                :to="item.to"
                class="!bg-none block border-l-2 border-transparent px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                active-class="!border-datagouv !text-datagouv font-medium bg-blue-50"
              >
                {{ item.label }}
              </NuxtLink>
            </template>
          </nav>

          <div class="border-t border-gray-200 py-3">
            <NuxtLink
              to="/design/settings"
              class="!bg-none flex items-center gap-2 border-l-2 border-transparent px-4 py-1 text-sm text-gray-600 hover:text-gray-900"
              active-class="!border-datagouv !text-datagouv font-medium"
            >
              <RiSettings3Line class="size-4" />
              Configuration
            </NuxtLink>
          </div>
        </div>
      </aside>

      <main class="min-w-0 flex-1 bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  RiSearchLine,
  RiSettings3Line,
} from '@remixicon/vue'

const searchQuery = ref('')

const navigation = [
  {
    name: 'Vue d\'ensemble',
    items: [
      { label: 'Accueil', to: '/design' },
    ],
  },
  {
    name: 'UI',
    items: [
      { label: 'Boutons', to: '/design/ui/buttons' },
      { label: 'Bannières', to: '/design/ui/banners' },
      { label: 'Badges', to: '/design/ui/badges' },
      { label: 'Loaders', to: '/design/ui/loaders' },
    ],
  },
  {
    name: 'Affichage',
    items: [
      { label: 'Avatars', to: '/design/display/avatars' },
      { label: 'Texte', to: '/design/display/text' },
      { label: 'Dates', to: '/design/display/dates' },
      { label: 'Métriques', to: '/design/display/metrics' },
    ],
  },
  {
    name: 'Cards',
    items: [
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
    name: 'Navigation',
    items: [
      { label: 'Pagination', to: '/design/navigation/pagination' },
      { label: 'Tabs', to: '/design/navigation/tabs' },
      { label: 'Breadcrumbs', to: '/design/navigation/breadcrumbs' },
      { label: 'Sidemenu', to: '/design/navigation/sidemenu' },
    ],
  },
  {
    name: 'Formulaires',
    items: [
      { label: 'Inputs', to: '/design/forms/inputs' },
      { label: 'Selects', to: '/design/forms/selects' },
      { label: 'Toggles', to: '/design/forms/toggles' },
      { label: 'Éditeurs', to: '/design/forms/editors' },
    ],
  },
  {
    name: 'Layout',
    items: [
      { label: 'Containers', to: '/design/layout/containers' },
      { label: 'Modals', to: '/design/layout/modals' },
      { label: 'Accordions', to: '/design/layout/accordions' },
    ],
  },
  {
    name: 'Marque',
    items: [
      { label: 'Logos', to: '/design/brand/logos' },
      { label: 'Couleurs', to: '/design/brand/colors' },
    ],
  },
  {
    name: 'Embeds',
    items: [
      { label: 'Cards', to: '/design/embeds/cards' },
      { label: 'OEmbeds', to: '/design/embeds/oembeds' },
    ],
  },
  {
    name: 'Utilitaires',
    items: [
      { label: 'Composables', to: '/design/utilities/composables' },
      { label: 'Traductions', to: '/design/utilities/translations' },
    ],
  },
]

const filteredNavigation = computed(() => {
  if (!searchQuery.value) return navigation

  const query = searchQuery.value.toLowerCase()
  return navigation
    .map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.label.toLowerCase().includes(query),
      ),
    }))
    .filter(category => category.items.length > 0)
})
</script>
