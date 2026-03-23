<template>
  <div
    class="rounded fr-p-3w flex flex-col"
    :class="{ 'h-full': stretchHeight, 'bg-new-info-light': isPrimary, '!border border-gray-default bg-white': !isPrimary }"
  >
    <div
      class="flex-1 flex flex-wrap gap-4"
      :class="{ 'text-datagouv': isPrimary }"
    >
      <div class="flex-none">
        <NuxtImg
          class="w-20"
          :src="icon"
          loading="lazy"
          alt=""
        />
      </div>
      <div class="fr-col-12 fr-col-sm flex flex-col justify-between">
        <div class="mb-2">
          <component
            :is="heading"
            class="!m-0 !mb-2"
            :class="{ '!font-bold !text-base': isPrimary, 'fr--h5': !isPrimary }"
          >
            {{ title }}
          </component>
          <p
            v-if="content"
            class="my-2"
          >
            {{ content }}
          </p>
          <slot v-else />
        </div>
        <div
          class="flex"
          :class="alignment"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AxisAlignment } from '~/types/types'

const props = withDefaults(defineProps<{
  title: string
  icon: string
  actionsAlignment: AxisAlignment

  type?: 'primary' | 'default'
  heading?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  stretchHeight?: boolean
  content?: string
}>(), {
  heading: 'h2',
  stretchHeight: false,
  type: 'default',
})

function getMainAxisAlignment(alignment: AxisAlignment) {
  switch (alignment) {
    case 'start':
      return 'left'
    case 'center':
      return 'center'
    case 'end':
      return 'right'
  }
}

const alignment = computed(() => `fr-grid-row--${getMainAxisAlignment(props.actionsAlignment)}`)
const isPrimary = computed(() => props.type === 'primary')
</script>
