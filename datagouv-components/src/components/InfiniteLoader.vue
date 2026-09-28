<template>
  <div ref="sentinel">
    <slot>
      <div class="flex items-center justify-center p-4">
        <span class="inline-flex items-center gap-2 text-xs text-gray-medium">
          <RiLoader4Line
            class="size-4 animate-spin"
            aria-hidden="true"
          />
          {{ t('Chargement…') }}
        </span>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { RiLoader4Line } from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'

const props = defineProps<{
  root?: HTMLElement | null
}>()

const emit = defineEmits<{
  intersect: []
}>()

const { t } = useTranslation()

const sentinelRef = useTemplateRef<HTMLElement>('sentinel')
let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  const el = sentinelRef.value
  if (!el) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        emit('intersect')
      }
    },
    { root: props.root ?? null, rootMargin: '200px' },
  )
  observer.observe(el)
}

onMounted(setupObserver)
watch([sentinelRef, () => props.root], setupObserver)
onUnmounted(() => observer?.disconnect())
</script>
