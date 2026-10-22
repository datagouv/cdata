<template>
  <div class="space-y-8">
    <div
      v-for="(link, i) in bloc.links"
      :key="i"
      class="relative group/link"
    >
      <!-- Display mode -->
      <template v-if="!edit">
        <h3>
          <CdataLink
            class="hyphens-auto inline-flex items-start relative font-extrabold text-3xl text-(--link-color) no-underline hover:underline fr-raw-link"
            :style="{
              '--link-color': link.color,
            }"
            :href="link.url"
          >
            {{ link.title }}
            <RiArrowRightUpLine class="size-6" />
          </CdataLink>
        </h3>
      </template>

      <!-- Edit mode -->
      <template v-else>
        <div class="space-y-2 relative">
          <!-- Floating controls on the left -->
          <div class="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
            <input
              v-model="link.color"
              type="color"
              class="size-6 rounded cursor-pointer border-0"
              :aria-label="$t('Couleur du lien')"
            >
            <button
              type="button"
              class="text-gray-500 hover:text-gray-700"
              :title="$t('Supprimer')"
              @click="bloc.links.splice(i, 1)"
            >
              <RiDeleteBinLine class="size-5" />
            </button>
          </div>
          <div
            class="hyphens-auto inline-flex items-start font-extrabold text-3xl"
            :style="{ color: link.color ?? '#000091' }"
          >
            <EditableText
              :model-value="link.title || $t('Titre du lien')"
              tag="span"
              class="min-w-[2ch] caret-current"
              @update:model-value="link.title = $event"
            />
            <RiArrowRightUpLine class="size-6 flex-shrink-0" />
          </div>
          <input
            v-model="link.url"
            type="text"
            class="text-sm text-gray-title placeholder:text-gray-500 bg-white border rounded px-2 py-1 max-w-xs"
            :placeholder="$t('URL')"
            :aria-label="$t('URL du lien')"
          >
        </div>
      </template>
    </div>

    <!-- Add a link -->
    <button
      v-if="edit"
      type="button"
      class="text-gray-400 hover:text-gray-600 flex items-center gap-1"
      @click="bloc.links.push({ title: '', url: '', color: '#000091' })"
    >
      <RiAddLine class="size-5" />
      {{ $t('Ajouter un lien') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { RiAddLine, RiArrowRightUpLine, RiDeleteBinLine } from '@remixicon/vue'
import CdataLink from '../CdataLink.vue'
import EditableText from './EditableText.vue'
import type { LinksListBloc } from '~/types/pages'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<LinksListBloc>({ required: true })
</script>
