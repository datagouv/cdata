<template>
  <div
    class="flex flex-wrap gap-2"
    role="listbox"
    :aria-labelledby="question.id"
    tabindex="0"
    :aria-activedescendant="active"
    @keydown="handleKeyPressForActiveDescendant"
    @keydown.space.prevent="$emit('select', active)"
    @keydown.enter.prevent="$emit('select', active)"
    @focusout="focusOut"
  >
    <SupportChoice
      v-for="choice in question.choices"
      :key="choice.id"
      :active="isActive(choice.id)"
      :selected="choice.id === selected"
      @select="$emit('select', choice.id)"
    >
      {{ choice.label }}
    </SupportChoice>
  </div>
</template>

<script setup lang="ts">
import useActiveDescendant from '~/datagouv-components/src/composables/useActiveDescendant'
import type { Question } from '~/types/support'

defineEmits<{
  select: [id: string | undefined]
}>()

const props = defineProps<{
  question: Question
  selected: string | undefined
}>()

const { isActive, active, focusOut, handleKeyPressForActiveDescendant } = useActiveDescendant(props.question.choices, 'horizontal')
</script>
