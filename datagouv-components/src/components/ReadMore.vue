<template>
  <div class="relative">
    <div
      ref="readMoreRef"
      class="overflow-hidden"
      :style="{ height: containerHeight + 'px' }"
    >
      <div ref="containerRef">
        <slot />
      </div>
    </div>
    <div
      v-if="readMoreRequired"
      class=" bottom-0 w-full cursor-pointer text-center"
      :class="{
        'relative pt-2.5': expanded,
        'absolute pt-20 bg-linear-to-b from-white/0 via-70% via-white/100 to-white/100': !expanded,
      }"
      @click.stop="toggle"
    >
      <BrandedButton
        color="primary-softer"
        @click.stop="toggle"
      >
        <template v-if="expanded">
          {{ t("Lire moins") }}
        </template>
        <template v-else>
          {{ t("Lire plus") }}
        </template>
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { ref, useTemplateRef, watch } from 'vue'
import { animate } from 'popmotion'
import styler from 'stylefire'
import BrandedButton from './BrandedButton.vue'
import { useTranslation } from '../composables/useTranslation'

const props = withDefaults(defineProps<{
  maxHeight?: string
}>(), {
  maxHeight: '',
})

const { t } = useTranslation()

const DEFAULT_HEIGHT = 284
const expanded = ref(false)
const readMoreRequired = ref(false)
const containerRef = useTemplateRef<HTMLElement | null>('containerRef')
const readMoreRef = useTemplateRef<HTMLElement | null>('readMoreRef')
const { height } = useElementSize(containerRef)
const containerHeight = ref(DEFAULT_HEIGHT)
const getHeight = (elt: Element) => {
  const style = getComputedStyle(elt)
  return parseFloat(style.getPropertyValue('height'))
    + parseFloat(style.getPropertyValue('margin-top'))
    + parseFloat(style.getPropertyValue('margin-bottom'))
}
const getDefaultHeight = () => {
  const elementMaxHeight = document.querySelector(`[data-read-more-max-height="${props.maxHeight}"]`)
  if (!elementMaxHeight) {
    return DEFAULT_HEIGHT
  }
  return Array.from(elementMaxHeight.children)
    .map(getHeight)
    .reduce((total, height) => total + height, 0)
}
const updateReadMoreHeight = (height: number) => {
  containerHeight.value = getDefaultHeight()
  readMoreRequired.value = height > containerHeight.value
  if (!readMoreRequired.value) {
    containerHeight.value = height
  }
}
const toggle = () => {
  if (!readMoreRef.value) {
    return
  }
  const divStyler = styler(readMoreRef.value)
  if (expanded.value) {
    animate({
      from: { height: readMoreRef.value.scrollHeight },
      to: { height: getDefaultHeight() },
      duration: 300,
      onComplete: () => readMoreRef.value?.scrollIntoView({ behavior: 'smooth' }),
      onUpdate: divStyler.set,
    })
  }
  else {
    animate({
      from: { height: getDefaultHeight() },
      to: { height: readMoreRef.value.scrollHeight },
      duration: 300,
      onUpdate: divStyler.set,
      onComplete: () => divStyler.set({ height: 'auto' }),
    })
  }
  expanded.value = !expanded.value
}
watch(height, updateReadMoreHeight)
</script>
