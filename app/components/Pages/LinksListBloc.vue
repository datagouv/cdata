<template>
  <BlocWithTitleAndSubtitle
    v-model="bloc"
    :edit
  >
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
            type="button"
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
        <BrandedButtonEditor
          v-model:title="bloc.main_link_title"
          v-model:href="bloc.main_link_url"
          :edit
          :color="mainColor"
          class="mt-12"
          @clear="bloc.main_link_title = ''; bloc.main_link_url = ''"
        />
      </div>
      <div class="space-y-8 w-full">
        <!-- Button to add a paragraph when there is none -->
        <button
          v-if="edit && !bloc.paragraph"
          type="button"
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
            <h3>
              <CdataLink
                class="hyphens-auto inline-flex items-start relative font-extrabold text-(--link-color) no-underline hover:underline fr-raw-link"
                :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
                :style="{
                  '--link-color': link.color,
                }"
                :href="link.url"
              >
                {{ link.title }}
                <RiArrowRightUpLine class="size-9" />
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
                class="hyphens-auto inline-flex items-start font-extrabold"
                :class="[bloc.paragraph ? 'text-6xl' : 'text-7xl']"
                :style="{ color: link.color ?? '#000091' }"
              >
                <EditableText
                  :model-value="link.title || $t('Titre du lien')"
                  tag="span"
                  class="min-w-[2ch] caret-current"
                  @update:model-value="link.title = $event"
                />
                <RiArrowRightUpLine class="size-9 flex-shrink-0" />
              </div>
              <input
                v-model="link.url"
                type="text"
                class="text-sm text-gray-500 border rounded px-2 py-1 max-w-xs"
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

        <!-- Main button (in the right column when no paragraph) -->
        <BrandedButtonEditor
          v-if="!bloc.paragraph"
          v-model:title="bloc.main_link_title"
          v-model:href="bloc.main_link_url"
          :edit
          :color="mainColor"
          class="mt-4"
          @clear="bloc.main_link_title = ''; bloc.main_link_url = ''"
        />
      </div>
    </div>
  </BlocWithTitleAndSubtitle>
</template>

<script setup lang="ts">
import type { ComponentProps } from 'vue-component-type-helpers'
import type { BrandedButton } from '@datagouv/components-next'
import { RiAddLine, RiArrowRightUpLine, RiDeleteBinLine } from '@remixicon/vue'
import CdataLink from '../CdataLink.vue'
import EditableText from './EditableText.vue'
import BrandedButtonEditor from './BrandedButtonEditor.vue'
import BlocWithTitleAndSubtitle from './BlocWithTitleAndSubtitle.vue'
import type { LinksListBloc } from '~/types/pages'

withDefaults(defineProps<{
  edit: boolean
  mainColor?: ComponentProps<typeof BrandedButton>['color']
}>(), {
  mainColor: 'primary',
})

const bloc = defineModel<LinksListBloc>({ required: true })
</script>
