<template>
  <NotificationLayout
    :icon="icon"
    :title="title"
    :notification="notification"
    :title-link="notification.details.discussion.self_web_url"
    :title-link-title="notification.handled_at ? $t('Voir la discussion') : $t('Voir la discussion et la marquer comme lue')"
  >
    <p
      v-if="notification.type === 'discussion.comment' && message"
      class="flex items-center gap-1 m-0 text-xs"
    >
      <span class="text-gray-medium">{{ $t('de') }}</span>
      <OrganizationOwner
        v-if="message?.posted_by_organization"
        :organization="message.posted_by_organization"
        logo-size-class="size-3"
        :logo-no-border="true"
        name-size="xs"
        name-color="text-gray-plain"
        :with-link="false"
      />
      <AvatarWithName
        v-else-if="message"
        :user="message.posted_by"
        :with-link="false"
      />
    </p>
    <p
      class="m-0 text-xs truncate"
      :class="{ 'text-gray-medium': notification.type === 'discussion.comment' }"
    >
      <template v-if="notification.type === 'discussion.new'">
        {{ notification.details.discussion.title }}
      </template>
      <template v-else-if="message">
        {{ message.content }}
      </template>
    </p>
    <p
      v-if="subject && notification.type !== 'discussion.closed'"
      class="m-0 text-xs italic truncate"
    >
      {{ $t('sur') }} {{ getSubjectTitle(subject) }}
    </p>
  </NotificationLayout>
</template>

<script setup lang="ts">
import { AvatarWithName } from '@datagouv/components-next'
import { RiQuestionAnswerLine, RiChatCheckLine, RiChat4Line } from '@remixicon/vue'
import type { DiscussionSubjectTypes } from '~/types/discussions'
import type { DiscussionNotification } from '~/types/notifications'
import NotificationLayout from './NotificationLayout.vue'

const props = defineProps<{
  notification: DiscussionNotification
  subject: DiscussionSubjectTypes | null
}>()

const { t } = useTranslation()

const message = computed(() => props.notification.details.message_id ? props.notification.details.discussion.discussion.find(message => props.notification.details.message_id === message.id) : null)

const icon = computed(() => {
  return {
    'discussion.closed': RiChatCheckLine,
    'discussion.comment': RiQuestionAnswerLine,
    'discussion.new': RiChat4Line,
  }[props.notification.type]
})

const title = computed(() => {
  return {
    'discussion.closed': t('Une discussion a été cloturée'),
    'discussion.comment': t('Nouveau commentaire'),
    'discussion.new': t('Nouvelle discussion'),
  }[props.notification.type]
})
</script>
