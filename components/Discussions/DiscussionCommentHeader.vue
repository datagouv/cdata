<template>
  <div class="flex items-center space-x-2 text-xs/loose">
    <div class="flex items-center space-x-1 text-mention-grey">
      <Placeholder
        v-if="comment.posted_by_organization"
        type="organization"
        :src="comment.posted_by_organization.logo_thumbnail"
        class="size-3"
      />
      <Avatar
        v-else
        :user="comment.posted_by"
        :rounded="true"
        class="size-3"
      />
      <NuxtLink
        v-if="comment.posted_by_organization"
        class="link"
        :href="comment.posted_by_organization.page"
      >
        {{ comment.posted_by_organization.name }}
      </NuxtLink>
      <NuxtLink
        v-else
        class="link"
        :href="comment.posted_by.page"
      >
        {{ comment.posted_by.first_name }} {{ comment.posted_by.last_name }}
      </NuxtLink>
    </div>
    <div>—</div>
    <div v-if="comment.last_edit_at">
      {{ $t('Updated the {date}', { date: formatDate(comment.last_edit_at) }) }}
    </div>
    <div v-else>
      {{ $t('Posted the {date}', { date: formatDate(comment.posted_on) }) }}
    </div>
    <div v-if="isProducer">
      —
    </div>
    <AdminBadge
      v-if="isProducer"
      size="xs"
      type="primary"
    >
      {{ $t('Producer') }}
    </AdminBadge>
  </div>
</template>

<script setup lang="ts">
import { Avatar } from '@datagouv/components-next'
import { isProducerOfSubject, type Comment, type DiscussionSubjectTypes } from '~/types/discussions'

const props = defineProps<{
  comment: Comment
  subject?: DiscussionSubjectTypes
}>()

const isProducer = computed(() => props.subject && isProducerOfSubject(props.subject, props.comment))
</script>
