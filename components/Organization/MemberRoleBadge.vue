<template>
  <Badge
    :size
    :tone="role === 'admin' ? 'primary' : 'neutral'"
  >
    {{ label }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge, type MemberRole } from '@datagouv/components-next'

// The label comes from the caller: members carry it, invitations look it up in the organization roles
withDefaults(defineProps<{
  role: MemberRole
  label: string
  size?: 'xs' | 'sm'
}>(), {
  size: 'xs',
})
</script>
