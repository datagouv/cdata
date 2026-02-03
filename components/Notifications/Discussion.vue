<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <component
        :is="icon"
        class="size-4"
      />
    </div>
    <div class="flex-1 truncate">
      <p class="m-0 text-xs font-bold">
        {{ title }}
      </p>
      <p
        v-if="notification.details.status === 'new_comment'"
        class="flex items-center gap-1 m-0 text-xs"
      >
        <span class="text-gray-medium">{{ $t('de') }}</span>
        <AvatarWithName
          v-if="notification.details.discussion.user"
          :user="notification.details.discussion.user"
          :with-link="false"
        />
        <OrganizationOwner
          v-else-if="notification.details.discussion.organization"
          :organization="notification.details.discussion.organization as OrganizationReference"
          logo-size-class="size-3"
          :logo-no-border="true"
          name-size="xs"
          name-color="text-gray-plain"
          :with-link="false"
        />
      </p>
      <p class="m-0 text-xs truncate">
        <CdataLink
          class="after:absolute after:inset-0 bg-none truncate"
          :class="{ 'text-gray-medium': notification.details.status === 'new_comment' }"
          :to="notification.details.discussion.self_web_url"
          :title="notification.handled_at ? $t('Voir la discussion') : $t('Voir la discussion et la marquer comme lue')"
          @click="markAsRead(notification)"
        >
          {{ notification.details.discussion.title }}
        </CdataLink>
      </p>
    </div>
    <div class="flex-none flex m-0 gap-1.5">
      <p class="m-0 text-xs">
        {{ formatDate(notification.created_at) }}
      </p>
      <AnimatedLoader
        v-if="loading"
        class="size-2"
      />
      <div
        v-else-if="!notification.handled_at"
        class="size-2 rounded-full bg-new-primary mt-0.5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, AvatarWithName, useFormatDate, type OrganizationReference } from '@datagouv/components-next'
import { RiQuestionAnswerLine, RiChatCheckLine, RiChat4Line } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import type { DiscussionNotification } from '~/types/notifications'

const props = defineProps<{
  notification: DeepReadonly<DiscussionNotification>
}>()

const { t } = useTranslation()
const { formatDate } = useFormatDate()
const { loading, markAsRead } = useMarkAsRead()

const icon = computed(() => {
  return {
    closed: RiChatCheckLine,
    new_comment: RiQuestionAnswerLine,
    new_discussion: RiChat4Line,
  }[props.notification.details.status]
})

const title = computed(() => {
  return {
    closed: t('Une discussion a été cloturée'),
    new_comment: t('Nouveau commentaire'),
    new_discussion: t('Nouvelle discussion'),
  }[props.notification.details.status]
})
</script>
