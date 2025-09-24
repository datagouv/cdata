<template>
  <component :is="tag">
    <template
      v-for="(part, index) in parts"
      :key="index"
    >
      <component
        :is="part.slot"
        v-if="part.slot"
      />
      <template v-else>
        {{ part.text }}
      </template>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots, type Slot } from 'vue'
import { useTranslation } from '~/composables/useTranslation'

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

  // Parser la traduction pour identifier les slots
  const result: Array<{ text?: string, slot?: Slot }> = []
  const regex = /\{(\w+)\}/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(translated)) !== null) {
    // Ajouter le texte avant le placeholder
    if (match.index > lastIndex) {
      result.push({ text: translated.slice(lastIndex, match.index) })
    }

    // Vérifier si c'est un slot ou une valeur interpolée
    const slotName = match[1]
    if (slots[slotName]) {
      result.push({ slot: slots[slotName] })
    }
    else {
      // Si ce n'est pas un slot, garder le texte interpolé
      result.push({ text: match[0] })
    }

    lastIndex = regex.lastIndex
  }

  // Ajouter le reste du texte
  if (lastIndex < translated.length) {
    result.push({ text: translated.slice(lastIndex) })
  }

  return result
})
</script>
