<template>
  <span class="inline-flex items-center space-x-1">
    <!-- A deleted account has no name left to show and no page left to link to, so it
         gets a neutral mark instead of the identicon generated from its identifier. -->
    <template v-if="isDeleted">
      <span
        class="inline-flex flex-none items-center justify-center rounded-full border border-gray-default text-gray-medium"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <RiUserLine
          :size="String(Math.round(size * 0.6))"
          aria-hidden="true"
        />
      </span>
      <span class="rounded bg-gray-some px-1.5 py-0.5 text-[11px] leading-5 text-gray-medium">{{ t('Compte supprimé') }}</span>
    </template>
    <template v-else>
      <Avatar
        v-bind="$attrs"
        :user="user"
        :size
        :rounded="true"
      />
      <component
        :is="withLink ? AppLink : 'span'"
        :to="withLink ? user.page : undefined"
        class="truncate"
        :class="{ 'font-bold': withLink }"
      >
        {{ user.first_name }}
        {{ user.last_name }}
      </component>
    </template>
  </span>
</template>

<script setup lang="ts">
import { RiUserLine } from '@remixicon/vue'
import { computed } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import { isDeletedUser } from '../functions/users'
import type { User, UserReference } from '../types/users'
import AppLink from './AppLink.vue'
import Avatar from './Avatar.vue'

const props = withDefaults(defineProps<{
  user: User | UserReference
  size?: number
  withLink?: boolean
}>(), {
  size: 12,
  withLink: true,
})

const { t } = useTranslation()

const isDeleted = computed(() => isDeletedUser(props.user))
</script>
