<template>
  <component :is="tag">
    <template
      v-for="(part, index) in parts"
      :key="index"
    >
      <component
        :is="slots[part.placeholder]"
        v-if="part.placeholder && slots[part.placeholder]"
      />
      <template v-else-if="part.text">
        {{ part.text }}
      </template>
      <template v-else-if="part.placeholder">
        {{ '{' + part.placeholder + '}' }}
      </template>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useTranslation, parseTextWithPlaceholders } from '~/composables/useTranslation'

const props = withDefaults(defineProps<{
  keypath: string
  tag?: string
  n?: number
  count?: number
}>(), {
  tag: 'span',
})

const slots = useSlots()
const { t } = useTranslation()

const parts = computed(() => {
  // Extraire les options de traduction
  const { keypath, tag, n, count, ...interpolations } = props

  // Construire les options pour la traduction
  const options: Record<string, string | number> = {
    ...interpolations,
  }

  if (n !== undefined) options.n = n
  if (count !== undefined) options.count = count

  // Obtenir la traduction
  const translated = t(keypath, options)

  // Utiliser la fonction mutualisée pour parser le texte
  return parseTextWithPlaceholders(translated)
})
</script>
