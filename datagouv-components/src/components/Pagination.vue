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
          :href="getHref(page - 1)"
          class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
          data-testid="previous-page"
          @click.prevent.stop="previousPage"
        >
          {{ t('Page précédente') }}
        </a>
      </li>
      <li>
        <a
          :aria-current="page === 1 ? 'page' : undefined"
          :href="getHref(1)"
          class="fr-pagination__link"
          :class="{ 'fr-hidden fr-unhidden-sm': page > 1 }"
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
          :class="{ 'fr-hidden fr-unhidden-lg': index < page - 1 || index > page + 1 }"
          :aria-current="page === index ? 'page' : undefined"
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
          :aria-current="page === pageCount ? 'page' : undefined"
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
          :href="getHref(page + 1)"
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
import { useTranslation } from '../composables/useTranslation'

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
   * Customize the links used
   */
  link?: (page: number) => string
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

const PAGES_AROUND = 3

function range(size: number, startAt = 1) {
  return [...Array(size).keys()].map(i => i + startAt)
}

function getPages(pageCount: number) {
  return range(pageCount)
}

function getPagesShown(pages: { length: number }, currentPage: number) {
  return Math.min(
    PAGES_AROUND * 2 + 1,
    pages.length - 2,
    PAGES_AROUND + currentPage - 1,
    PAGES_AROUND + pages.length - currentPage,
  )
}

function getStartPage(currentPage: number) {
  return Math.max(
    currentPage - PAGES_AROUND, // we want to start 3 pages before the current one
    2, // we don't want to start below page 2
  )
}

function getVisiblePages(currentPage: number, pageCount: number) {
  const pages = getPages(pageCount)
  const start = getStartPage(currentPage)
  if (pageCount <= 2) {
    return []
  }
  const pagination: Array<number | null> = range(getPagesShown(pages, currentPage), start)
  if (!pagination.includes(2)) {
    pagination.unshift(null)
  }
  if (!pagination.includes(pageCount - 1)) {
    pagination.push(null)
  }
  return pagination
}

const { t } = useTranslation()
const pageCount = computed(() => Math.ceil(props.totalResults / props.pageSize))
const visiblePages = computed(() => getVisiblePages(props.page, pageCount.value))

const nav = useTemplateRef('navRef')
function change(index: number) {
  emit('change', index)

  if (!nav.value || !nav.value.parentElement) return

  nav.value.parentElement.style.scrollMarginTop = '100px'
  nav.value.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onClick(index: number) {
  if (index !== props.page) {
    change(index)
  }
}

function nextPage() {
  const index = props.page + 1
  if (index <= pageCount.value) {
    change(index)
  }
}

function previousPage() {
  const index = props.page - 1
  if (index > 0) {
    change(index)
  }
}

function getHref(forPage: number) {
  if (forPage < 1 || forPage > pageCount.value) {
    return undefined
  }
  return props.page === forPage ? undefined : (props.link ? props.link(forPage) : '#')
}
</script>
