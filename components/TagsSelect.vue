<template>
  <div>
    <SearchableSelect
      v-model="tags"
      :label="t('Tags')"
      :placeholder="t('Search a tag…')"
      :get-option-id="(tag) => tag.text"
      :allow-new-option="toTag"
      :suggest="suggestTags"
      :multiple="true"
      class="!mb-0"

      :error-text
      :warning-text
    >
      <template #option="{ option: tag }">
        {{ tag.text }}
      </template>
    </SearchableSelect>
    <div
      v-if="tags.length"
      class="mt-2 flex flex-wrap"
    >
      <button
        v-for="tag in tags"
        :key="tag.text"
        class="fr-tag fr-tag--sm fr-tag--dismiss mr-2 mb-2"
        type="button"
        @click="removeTag(tag)"
      >
        {{ tag.text }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '~/types/types'

defineProps<{
  errorText?: string | null
  warningText?: string | null
}>()
const tags = defineModel<Array<Tag>>({ required: true })

const { t } = useI18n()
const { $api } = useNuxtApp()

async function suggestTags(query: string) {
  return await $api<Array<Tag>>('/api/1/tags/suggest/', {
    query: {
      q: query,
      size: 5,
    },
  })
}
function removeTag(tag: Tag) {
  tags.value = tags.value.filter(otherTag => otherTag.text !== tag.text)
}

function toTag(query: string): Tag {
  return {
    text: query.toLocaleLowerCase().replace(/ /g, '-'),
  }
}
</script>
