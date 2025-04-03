<template>
  <div class="flex items-center space-x-2 text-xs/loose">
    <div class="flex items-center space-x-1 text-mention-grey">
      <Avatar
        :user="comment.posted_by"
        :rounded="true"
        class="size-3"
      />
      <NuxtLink
        class="link"
        :href="comment.posted_by.page"
      >
        {{ comment.posted_by.first_name }} {{ comment.posted_by.last_name }}
      </NuxtLink>
    </div>
    <div>—</div>
    <div>
      {{ $t('Posted the {date}', { date: formatDate(comment.posted_on) }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Avatar } from '@datagouv/components-next'
import type { Comment } from '~/types/discussions'

defineProps<{
  comment: Comment
}>()
</script>
