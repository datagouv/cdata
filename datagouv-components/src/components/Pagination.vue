<template>
  <nav
    v-if="totalResults > pageSize"
    ref="navRef"
    role="navigation"
    class="fr-pagination flex justify-center"
    :aria-label="t('Pagination')"
  >
    <ul class="fr-pagination__list">
      <li>
        <a
          :href="getHref(1)"
          class="fr-pagination__link fr-pagination__link--first"
          data-testid="first-page"
          @click.prevent.stop="onClick(1)"
        >
          {{ t('Première page') }}
        </a>
      </li>
      <li>
        <a
          :href="getHref(currentPage - 1)"
          class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
          data-testid="previous-page"
          @click.prevent.stop="previousPage"
        >
          {{ t('Page précédente') }}
        </a>
      </li>
      <li>
        <a
          :aria-current="currentPage === 1 ? 'page' : undefined"
          :href="getHref(1)"
          class="fr-pagination__link"
          :class="{ 'fr-hidden fr-unhidden-sm': currentPage > 1 }"
          :title="t('Page {nb}', { nb: 1 })"
          :data-testid="1"
          @click.prevent.stop="onClick(1)"
        >
          1
        </a>
      </li>
      <li
        v-for="(index, arrayIndex) in visiblePages"
        :key="arrayIndex"
      >
        <a
          v-if="index"
          class="fr-pagination__link"
          :class="{ 'fr-hidden fr-unhidden-lg': index < currentPage - 1 || index > currentPage + 1 }"
          :aria-current="currentPage === index ? 'page' : undefined"
          :href="getHref(index)"
          :title="t('Page {nb}', { nb: index })"
          :data-testid="index"
          @click.prevent.stop="onClick(index)"
        >
          {{ index }}
        </a>
        <a
          v-else
          class="fr-pagination__link fr-hidden fr-unhidden-lg"
        >
          …
        </a>
      </li>
      <li>
        <a
          class="fr-pagination__link"
          :aria-current="currentPage === pageCount ? 'page' : undefined"
          :href="getHref(pageCount)"
          :title="t('Page {nb}', { nb: pageCount })"
          :data-testid="pageCount"
          @click.prevent.stop="onClick(pageCount)"
        >
          {{ pageCount }}
        </a>
      </li>
      <li>
        <a
          class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
          :href="getHref(currentPage + 1)"
          data-testid="next-page"
          @click.prevent.stop="nextPage"
        >
          {{ t('Page suivante') }}
        </a>
      </li>
      <li>
        <a
          class="fr-pagination__link fr-pagination__link--last"
          :href="getHref(pageCount)"
          data-testid="last-page"
          @click.prevent.stop="onClick(pageCount)"
        >
          {{ t('Dernière page') }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useTranslation } from '../composables/useTranslation'
import { clampPage, getVisiblePages } from '../functions/paginate'

type Props = {
  /**
   * The current page.
   */
  page?: number
  /**
   * The page size.
   */
  pageSize?: number
  /**
   * The number of items in the collection. It's used to calculated the number of pages.
   */
  totalResults: number
}

const emit = defineEmits<{
  (event: 'change', page: number): void
}>()

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  pageSize: 20,
})

const { t } = useTranslation()
const route = useRoute()
const pageCount = computed(() => Math.ceil(props.totalResults / props.pageSize))
// The `page` prop often comes straight from a query string, so it is normalised
// once here and every link below builds on an existing page.
const currentPage = computed(() => clampPage(props.page, pageCount.value))
const visiblePages = computed(() => getVisiblePages(currentPage.value, pageCount.value))

const nav = useTemplateRef('navRef')
function change(index: number) {
  emit('change', index)

  if (!nav.value || !nav.value.parentElement) return

  nav.value.parentElement.style.scrollMarginTop = '100px'
  nav.value.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onClick(index: number) {
  if (index !== currentPage.value) {
    change(index)
  }
}

function nextPage() {
  const index = currentPage.value + 1
  if (index <= pageCount.value) {
    change(index)
  }
}

function previousPage() {
  const index = currentPage.value - 1
  if (index > 0) {
    change(index)
  }
}

function getHref(forPage: number) {
  if (forPage < 1 || forPage > pageCount.value) {
    return undefined
  }
  if (currentPage.value === forPage) {
    return undefined
  }
  const search = new URLSearchParams(route.query as Record<string, string>)
  search.set('page', forPage.toFixed(0))
  return `${route.path}?${search.toString()}`
}
</script>
