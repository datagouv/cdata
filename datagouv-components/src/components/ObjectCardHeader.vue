<template>
  <component
    :is="titleTag"
    class="dg-card-title"
  >
    <AppLink
      :to="url"
      class="dg-card-title-link"
      :target="target"
    >
      <component
        :is="icon"
        v-if="icon"
        data-icon-align="start"
        data-icon-size="base"
        focusable="false"
        aria-hidden="true"
        class="dg-card-title-icon dg-ds-icon"
      />
      <span
        class="dg-card-title-text"
        :class="$slots.extra ? 'flex-initial' : 'flex-1'"
      >
        <slot />
      </span>
      <slot name="extra" />
      <span class="absolute inset-0" />
    </AppLink>
  </component>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
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
.dg-card-title {
  margin: 0;
  font: var(--dg-card-weight-semibold) var(--dg-card-text-title)/var(--dg-card-leading-title)
    var(--dg-card-font-sans);
  min-width: 0;
}
.dg-card-title-link {
  display: flex;
  align-items: flex-start;
  gap: var(--dg-card-space-4);
  width: 100%;
  color: var(--dg-card-text);
  background-image: none;
  font: inherit;
  text-decoration: none;
}
.dg-card-title-text {
  display: block;
  min-width: 0;
  overflow-wrap: anywhere;
}
.dg-card-title-icon {
  width: var(--dg-card-icon);
  height: var(--dg-card-icon);
  flex-shrink: 0;
  margin-top: var(--dg-card-space-4);
}
.dg-card-title-link:focus-visible {
  outline: var(--dg-card-focus-width) solid var(--dg-card-focus);
  outline-offset: var(--dg-card-focus-offset);
  border-radius: var(--dg-card-radius-technical);
}
.dg-card-title-link::after {
  display: none;
}
</style>
