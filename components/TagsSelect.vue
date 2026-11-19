<template>
  <div>
    <SearchableSelect
      v-model="tags"
      :label="t('Mots clés')"
      :placeholder="t('Chercher un mot clé…')"
      :get-option-id="(tag: Tag) => tag.text"
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
      class="mt-2 flex flex-wrap gap-2"
      data-testid="selected-tags"
    >
      <TagComponent
        v-for="tag in tags"
        :key="tag.text"
        dismissible
        :data-testid="`selected-tag-${tag.text}`"
        @click="removeTag(tag)"
      >
        {{ tag.text }}
      </TagComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchableSelect, Tag as TagComponent } from '@datagouv/components-next'
import type { Tag } from '~/types/types'

defineProps<{
  errorText?: string | null
  warningText?: string | null
}>()
const tags = defineModel<Array<Tag>>({ required: true })

const { t } = useTranslation()
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
