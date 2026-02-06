<template>
  <section class="fr-search-bar fr-search-bar--lg w-full">
    <label
      class="sr-only"
      :for="id"
    >
      {{ t('Recherche') }}
    </label>
    <input
      :id="id"
      ref="inputRef"
      v-model="q"
      type="search"
      name="q"
      class="input max-h-12 m-0 rounded-tl shadow-input-blue"
      :aria-label="placeholder || t('Rechercher...')"
      :placeholder="placeholder || t('Rechercher...')"
    >
    <BrandedButton
      class="rounded-l-none rounded-br-none rounded-tr min-h-12"
      size="lg"
      color="primary"
      :icon="RiSearchLine"
      icon-only-on-mobile
      type="submit"
    >
      {{ t('Recherche') }}
    </BrandedButton>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, useId, useTemplateRef } from 'vue'
import { RiSearchLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import BrandedButton from '../BrandedButton.vue'

const q = defineModel<string>({ required: true })

withDefaults(defineProps<{
  placeholder?: string
  autoFocus?: boolean
}>(), {
  autoFocus: true,
})

const { t } = useTranslation()

const id = useId()

const input = useTemplateRef<HTMLInputElement>('inputRef')

const focus = () => {
  input.value?.focus({
    preventScroll: true,
  })
}

onMounted(async () => {
  await nextTick()
  focus()
})
</script>
