<template>
  <component :is="titleTag" class="object-card-title">
    <AppLink :to="url" class="object-card-title__link" :target="target">
      <component v-if="icon" :is="icon" aria-hidden="true" class="object-card-title__icon" />
      <span class="object-card-title__text" :class="$slots.extra ? 'flex-initial' : 'flex-1'">
        <slot />
      </span>
      <slot name="extra" />
      <span class="absolute inset-0" />
    </AppLink>
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { TitleTag } from '../types/ui'
import AppLink from './AppLink.vue'

withDefaults(
  defineProps<{
    icon?: Component
    url: RouteLocationRaw
    target?: string
    titleTag?: TitleTag
  }>(),
  {
    titleTag: 'h3',
  },
)
</script>

<style scoped>
.object-card-title {
  display: flex;
  width: 100%;
  min-width: 0;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5rem;
}
.object-card-title__link {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  gap: 0.25rem;
  color: #161616;
  background-image: none;
  text-decoration: none;
}
.object-card-title__icon {
  width: 1rem;
  height: 1rem;
  flex: none;
  margin-top: 0.25rem;
}
.object-card-title__text {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.object-card-title__link::after {
  display: none;
}
.object-card-title__link:focus-visible {
  outline: none;
}
@media (hover: hover) {
  .object-card-title__link:hover {
    color: #000091;
  }
}
</style>
