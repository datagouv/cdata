<template>
  <AvatarWithName
    v-if="actor.class === 'User'"
    :user="actor"
    :size
    :with-link
  />
  <!-- What follows the owner is plain text rather than part of a flex box, so that a
       long key or application name wraps with the sentence it belongs to. -->
  <span v-else-if="actor.class === 'ApiToken'">
    <AvatarWithName
      :user="actor.owner"
      :size
      :with-link
      class="mr-1 align-middle"
    />
    <span class="text-gray-medium">
      {{ actor.name ? t('via la clé d\'API « {name} »', { name: actor.name }) : t('via une clé d\'API') }}
    </span>
  </span>
  <span v-else-if="actor.class === 'OAuth2Token'">
    <AvatarWithName
      :user="actor.owner"
      :size
      :with-link
      class="mr-1 align-middle"
    />
    <span class="text-gray-medium">{{ t('via {name}', { name: actor.client.name }) }}</span>
  </span>
  <span
    v-else
    class="inline-flex items-center space-x-1"
  >
    <span
      class="inline-flex flex-none items-center justify-center rounded-full border border-gray-default text-gray-medium"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <RiRobot2Line
        :size="String(Math.round(size * 0.6))"
        aria-hidden="true"
      />
    </span>
    <span
      v-if="actor.name"
      class="truncate font-bold"
    >{{ actor.name }}</span>
    <span
      v-else
      class="rounded bg-gray-some px-1.5 py-0.5 text-[11px] leading-5 text-gray-medium"
    >{{ t('Moissonnage supprimé') }}</span>
  </span>
</template>

<script setup lang="ts">
import { RiRobot2Line } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import type { ActivityActor } from '../../types/activity'
import AvatarWithName from '../AvatarWithName.vue'

withDefaults(defineProps<{
  actor: ActivityActor
  size?: number
  withLink?: boolean
}>(), {
  size: 12,
  withLink: true,
})

const { t } = useTranslation()
</script>
