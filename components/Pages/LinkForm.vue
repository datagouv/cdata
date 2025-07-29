<template>
  <div>
    <InputGroup
      v-model="link.title"
      :label="$t('Titre')"
    />
    <div class="flex space-x-2">
      <InputGroup
        v-model="link.url"
        class="w-full mb-0"
        :label="$t('Lien vers la page')"
      />
      <div class="w-full h-full flex items-end space-x-2">
        <InputGroup
          v-model="link.color"
          class="w-full h-full mb-0"
          type="color"
          :label="$t('Couleur')"
        />
        <button
          v-for="color in colors"
          :key="color"
          class="size-8 shrink-0 rounded border-white/80"
          :class="color"
          @click="setColor"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LinkInBloc } from '~/types/pages'

const link = defineModel<LinkInBloc>({ required: true })

const colors = ['bg-primary', 'bg-purple-dataservice', 'bg-green-reuse', 'bg-ocher']

const setColor = (event: MouseEvent) => {
  if (!event.target) return
  const styles = getComputedStyle(event.target as Element)
  if (!('background-color' in styles)) return

  link.value.color = rgbToHex(styles['background-color'] as string)
}

function rgbToHex(rgb: string) {
  const result = rgb.match(/\d+/g)
  if (!result || result.length !== 3) throw new Error('Format incorrect')

  const [r, g, b] = result.map(Number)

  if ([r, g, b].some(v => v < 0 || v > 255)) {
    throw new Error('Les valeurs RGB doivent être entre 0 et 255.')
  }

  const toHex = (v: number) => v.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
</script>
