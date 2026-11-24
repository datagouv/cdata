<script setup lang="ts">
import { Comment, computed, Fragment, Text, useSlots, type Component, type VNode } from 'vue'

const props = defineProps<{
  type: 'primary' | 'primary-frame' | 'warning' | 'gray' | 'danger' | 'success' | 'pink'
  icon?: Component
}>()

const slots = useSlots()

// Rich slots already compose their own illustrations and layout in cdata.
// Keep their structure intact unless the caller explicitly supplies an icon.
function isTextOnly(nodes: Array<VNode>): boolean {
  return nodes.every((node) => {
    if (node.type === Text || node.type === Comment) return true
    if (node.type === Fragment && Array.isArray(node.children)) return isTextOnly(node.children as Array<VNode>)
    if (typeof node.type === 'string' && ['a', 'span', 'strong', 'em'].includes(node.type)) {
      return typeof node.children === 'string' || (Array.isArray(node.children) && isTextOnly(node.children as Array<VNode>))
    }
    return false
  })
}

const icon = computed(() => props.icon)
</script>

<template>
  <div
    class="proposed-simple-banner"
    :data-type="type"
    :class="{ 'proposed-simple-banner--text': icon || isTextOnly(slots.default?.() || []) }"
  >
    <template v-if="icon || isTextOnly(slots.default?.() || [])">
      <component
        :is="icon"
        v-if="icon"
        class="proposed-simple-banner__icon"
        data-icon-align="start"
        data-icon-size="base"
        aria-hidden="true"
        focusable="false"
      />
      <div class="proposed-simple-banner__content">
        <slot />
      </div>
    </template>
    <slot v-else />
  </div>
</template>

<style scoped>
.proposed-simple-banner {
  --banner-surface: var(--color-gray-some);
  --banner-border: var(--color-gray-default);
  --banner-accent: var(--color-gray-secondary);
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  border: 1px solid var(--banner-border);
  border-radius: 4px;
  background: var(--banner-surface);
  color: var(--color-gray-title);
  font-family: var(--font-marianne);
  font-size: 14px;
  line-height: 22px;
}

.proposed-simple-banner:is([data-type="primary"], [data-type="primary-frame"], [data-type="warning"], [data-type="success"], [data-type="danger"]) {
  color: var(--banner-accent);
}

.proposed-simple-banner--text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.proposed-simple-banner[data-type="primary"] {
  --banner-surface: var(--color-new-info-light);
  --banner-border: var(--color-new-info);
  --banner-accent: var(--color-new-info);
}

.proposed-simple-banner[data-type="primary-frame"] {
  --banner-surface: #fff;
  --banner-border: var(--color-new-primary);
  --banner-accent: var(--color-new-primary);
}

.proposed-simple-banner[data-type="warning"] {
  --banner-surface: var(--color-new-warning-light);
  --banner-border: var(--color-new-warning);
  --banner-accent: var(--color-new-warning);
}

.proposed-simple-banner[data-type="success"] {
  --banner-surface: var(--color-new-success-light);
  --banner-border: var(--color-new-success);
  --banner-accent: var(--color-new-success);
}

.proposed-simple-banner[data-type="danger"] {
  --banner-surface: var(--color-new-error-light);
  --banner-border: var(--color-new-error);
  --banner-accent: var(--color-new-error);
}

.proposed-simple-banner[data-type="pink"] {
  --banner-surface: var(--color-pink-softest);
  --banner-border: var(--color-pink-soft);
}

.proposed-simple-banner__icon {
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  margin-top: 3px;
  color: var(--banner-accent);
}

.proposed-simple-banner__content {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.proposed-simple-banner :deep(a),
.proposed-simple-banner :deep(a:visited) {
  color: inherit !important;
  font-weight: 400;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

@media (hover: hover) {
  .proposed-simple-banner :deep(a:hover) {
    color: var(--color-new-primary) !important;
  }
}

.proposed-simple-banner :deep(a:active),
.proposed-simple-banner :deep(a:focus-visible) {
  color: var(--color-new-primary) !important;
}

.proposed-simple-banner :deep(a:focus-visible) {
  outline: 2px solid var(--color-new-focus);
  outline-offset: 2px;
}
</style>
