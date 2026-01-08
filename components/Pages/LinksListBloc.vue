<template>
  <div class="flex flex-col sm:flex-row gap-8 sm:gap-16">
    <div
      v-if="bloc.paragraph"
      class="w-full"
    >
      <!-- Editable paragraph -->
      <div
        v-if="edit"
        class="relative"
      >
        <button
          class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          :title="$t('Supprimer le paragraphe')"
          @click="bloc.paragraph = null"
        >
          <RiDeleteBinLine class="size-5" />
        </button>
        <EditableText
          :model-value="bloc.paragraph ?? ''"
          tag="p"
          class="mb-0 font-light text-2xl"
          @update:model-value="bloc.paragraph = $event"
        />
      </div>
      <p
        v-else
        class="mb-0 font-light text-2xl"
      >
        {{ bloc.paragraph }}
      </p>

      <!-- Main link (in the left column when paragraph is present) -->
      <div
        v-if="edit"
        class="mt-12 space-y-2 relative"
      >
        <button
          v-if="bloc.main_link_title || bloc.main_link_url"
          class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          :title="$t('Supprimer')"
          @click="bloc.main_link_title = ''; bloc.main_link_url = ''"
        >
          <RiDeleteBinLine class="size-5" />
        </button>
        <BrandedButton
          :color="mainColor"
          class="pointer-events-none"
        >
          <input
            v-model="bloc.main_link_title"
            type="text"
            class="bg-transparent border-none outline-none text-inherit font-inherit pointer-events-auto"
            :style="{ width: `${Math.max(10, bloc.main_link_title?.length || 0)}ch` }"
            :placeholder="$t('Titre du bouton')"
          >
        </BrandedButton>
        <input
          v-model="bloc.main_link_url"
          type="text"
          class="block text-sm text-gray-500 border rounded px-2 py-1 w-full max-w-xs"
          :placeholder="$t('URL du bouton')"
        >
      </div>
      <BrandedButton
        v-else-if="bloc.main_link_title && bloc.main_link_url"
        :href="bloc.main_link_url"
        class="mt-12"
        :color="mainColor"
      >
        {{ bloc.main_link_title }}
      </BrandedButton>
    </div>
    <div class="space-y-8 w-full">
      <!-- Button to add a paragraph when there is none -->
      <button
        v-if="edit && !bloc.paragraph"
        class="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm"
        @click="bloc.paragraph = $t('Texte du paragraphe')"
      >
        <RiAddLine class="size-4" />
        {{ $t('Ajouter un paragraphe') }}
      </button>

      <div
        v-for="(link, i) in bloc.links"
        :key="i"
        class="relative group/link"
      >
        <!-- Display mode -->
        <template v-if="!edit">
          <CdataLink
            class="hyphens-auto inline-flex items-start relative font-extrabold text-[var(--link-color)] no-underline hover:underline fr-raw-link"
            :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
            :style="{
              '--link-color': link.color,
            }"
            :href="link.url"
          >
            {{ link.title }}
            <RiArrowRightUpLine class="size-9" />
          </CdataLink>
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
              >
              <button
                class="text-gray-500 hover:text-gray-700"
                :title="$t('Supprimer')"
                @click="bloc.links.splice(i, 1)"
              >
                <RiDeleteBinLine class="size-5" />
              </button>
            </div>
            <div
              class="hyphens-auto inline-flex items-start font-extrabold"
              :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
              :style="{ color: link.color ?? '#000091' }"
            >
              <span
                contenteditable="true"
                class="outline-none focus:ring-2 focus:ring-blue-300 rounded min-w-[2ch] caret-current"
                @blur="link.title = ($event.target as HTMLElement).textContent || ''"
                @keydown.enter.prevent="($event.target as HTMLElement).blur()"
                v-text="link.title || $t('Titre du lien')"
              />
              <RiArrowRightUpLine class="size-9 flex-shrink-0" />
            </div>
            <input
              v-model="link.url"
              type="text"
              class="text-sm text-gray-500 border rounded px-2 py-1 max-w-xs"
              :placeholder="$t('URL')"
            >
          </div>
        </template>
      </div>

      <!-- Add a link -->
      <button
        v-if="edit"
        class="text-gray-400 hover:text-gray-600 flex items-center gap-1"
        @click="bloc.links.push({ title: '', url: '', color: '#000091' })"
      >
        <RiAddLine class="size-5" />
        {{ $t('Ajouter un lien') }}
      </button>

      <!-- Main button in edit mode (when no paragraph) -->
      <div
        v-if="edit && !bloc.paragraph"
        class="mt-4 space-y-2 relative"
      >
        <button
          v-if="bloc.main_link_title || bloc.main_link_url"
          class="absolute -left-12 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          :title="$t('Supprimer')"
          @click="bloc.main_link_title = ''; bloc.main_link_url = ''"
        >
          <RiDeleteBinLine class="size-5" />
        </button>
        <BrandedButton
          :color="mainColor"
          class="pointer-events-none"
        >
          <input
            v-model="bloc.main_link_title"
            type="text"
            class="bg-transparent border-none outline-none text-inherit font-inherit pointer-events-auto"
            :style="{ width: `${Math.max(10, bloc.main_link_title?.length || 0)}ch` }"
            :placeholder="$t('Titre du bouton')"
          >
        </BrandedButton>
        <input
          v-model="bloc.main_link_url"
          type="text"
          class="block text-sm text-gray-500 border rounded px-2 py-1 w-full max-w-xs"
          :placeholder="$t('URL du bouton')"
        >
      </div>

      <BrandedButton
        v-if="!edit && !bloc.paragraph && bloc.main_link_title && bloc.main_link_url"
        :href="bloc.main_link_url"
        class="mt-12"
        :color="mainColor"
      >
        {{ bloc.main_link_title }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowRightUpLine, RiDeleteBinLine } from '@remixicon/vue'
import CdataLink from '../CdataLink.vue'
import EditableText from './EditableText.vue'
import type { LinksListBloc } from '~/types/pages'

withDefaults(defineProps<{
  edit: boolean
  mainColor?: ComponentProps<typeof BrandedButton>['color']
}>(), {
  mainColor: 'primary',
})

const bloc = defineModel<LinksListBloc>({ required: true })
</script>
