<template>
  <div class="p-4 border border-gray-default rounded space-y-3">
    <ThreadHeader
      :thread
      :subject
      show-actions
      @change="$emit('change')"
    />
    <div
      v-if="thread.closed"
      class="border-l-2 pl-2.5 border-gray-default text-xs/loose"
    >
      {{ $t('Discussion closed by ') }}
      <span class="inline-flex items-center space-x-1 text-mention-grey">
        <Avatar
          :user="thread.closed_by"
          :rounded="true"
          class="size-3"
        />
        <NuxtLink
          class=""
          :href="thread.closed_by.page"
        >
          {{ thread.closed_by.first_name }} {{ thread.closed_by.last_name }}
        </NuxtLink>
      </span>
      {{ $t('the {date}', { date: formatDate(thread.closed) }) }}
    </div>
    <template v-if="!thread.closed || openDiscussionIfClosed">
      <template
        v-for="comment, index in thread.discussion"
        :key="index"
      >
        <div
          v-if="index == 0"
          class="prose whitespace-pre"
        >
          {{ comment.content }}
        </div>
        <CommentBlock
          v-else
          :for-delete-info="{ thread, index }"
          :for-edit-info="{ thread, index }"
          :comment
          :subject
          @change="$emit('change')"
        />
      </template>
      <RespondForm
        v-if="showRespondForm"
        class="mt-8"
        :thread
        @responded="$emit('change'); showRespondForm = false"
        @close="showRespondForm = false"
      />
    </template>
    <footer class="flex justify-end">
      <BrandedButton
        v-if="thread.closed"
        color="secondary"
        size="xs"
        @click="openDiscussionIfClosed = !openDiscussionIfClosed"
      >
        <span v-if="openDiscussionIfClosed">{{ $t('Hide discussion') }}</span>
        <span v-else>{{ $t('See discussion') }}</span>
      </BrandedButton>
      <BrandedButton
        v-else-if="!showRespondForm"
        color="secondary"
        size="xs"
        @click="showRespondForm = true"
      >
        {{ $t('Respond') }}
      </BrandedButton>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton } from '@datagouv/components-next'
import ThreadHeader from './ThreadHeader.vue'
import CommentBlock from './CommentBlock.vue'
import RespondForm from './RespondForm.vue'
import type { DiscussionSubjectTypes, Thread } from '~/types/discussions'

defineProps<{
  thread: Thread
  subject: DiscussionSubjectTypes
}>()
defineEmits<{
  change: []
}>()

const openDiscussionIfClosed = ref(false)
const showRespondForm = ref(false)
</script>
