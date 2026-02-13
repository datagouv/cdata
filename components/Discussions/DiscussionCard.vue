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
      {{ $t('Discussion close par ') }}
      <span class="inline-flex items-center space-x-1 text-mention-grey">
        <OrganizationLogo
          v-if="thread.closed_by_organization"
          :organization="thread.closed_by_organization"
          size-class="size-3"
        />
        <Avatar
          v-else-if="thread.closed_by"
          :user="thread.closed_by"
          :rounded="true"
          class="size-3"
        />
        <CdataLink
          v-if="thread.closed_by_organization"
          class="link"
          :href="thread.closed_by_organization.page"
        >
          {{ thread.closed_by_organization.name }}
        </CdataLink>
        <CdataLink
          v-else-if="thread.closed_by"
          class="link"
          :href="thread.closed_by.page"
        >
          {{ thread.closed_by.first_name }} {{ thread.closed_by.last_name }}
        </CdataLink>
      </span>
      {{ $t('le {date}', { date: formatDate(thread.closed) }) }}
    </div>
    <template v-if="!thread.closed || openDiscussionIfClosed">
      <template
        v-for="comment, index in thread.discussion"
        :key="index"
      >
        <ReadMore
          v-if="index == 0"
          class="prose whitespace-pre-line max-w-none text-sm"
        >
          {{ comment.content }}
        </ReadMore>
        <CommentBlock
          v-else
          :thread
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
        <span v-if="openDiscussionIfClosed">{{ $t('Cacher la discussion') }}</span>
        <span v-else>{{ $t('Voir la discussion') }}</span>
      </BrandedButton>
      <BrandedButton
        v-else-if="!showRespondForm"
        color="secondary"
        size="xs"
        @click="showRespondFormIfConnected"
      >
        {{ $t('Répondre') }}
      </BrandedButton>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, OrganizationLogo, ReadMore, useFormatDate } from '@datagouv/components-next'
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
const { formatDate } = useFormatDate()
const me = useMaybeMe()
const route = useRoute()

const showRespondFormIfConnected = () => {
  if (me.value) {
    showRespondForm.value = true
  }
  else {
    navigateTo({ path: '/login', query: { next: route.fullPath } }, { external: true })
  }
}
</script>
