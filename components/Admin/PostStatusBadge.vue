<template>
  <Badge
    size="xs"
    :tone="post.published ? 'primary' : 'neutral'"
  >
    <TranslationT
      v-if="post.published"
      keypath="Publié le {date}"
    >
      <template #date>
        <FormattedDate :date="post.published" />
      </template>
    </TranslationT>
    <template v-else>
      {{ t('Brouillon') }}
    </template>
  </Badge>
</template>

<script setup lang="ts">
import { Badge, FormattedDate, TranslationT } from '@datagouv/components-next'
import type { Post } from '~/types/posts'

defineProps<{
  post: Post
}>()

const { t } = useTranslation()
</script>
