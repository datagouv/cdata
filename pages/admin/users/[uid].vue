<template>
  <NuxtPage v-if="user" />
</template>

<script setup lang="ts">
import type { User } from '@datagouv/components-next'

const { setCurrentUser } = useCurrentOwned()

const route = useRoute()
const { data: user, refresh } = await useAPI<User>(`api/1/users/${route.params.uid}/`, { lazy: true })

watchEffect(() => {
  if (user.value) setCurrentUser(user.value)
})
</script>
