<template>
  <!-- The look of the cards of /elections: the image on the left of the text when the card
       is wide enough, above it in a narrow column. -->
  <div class="@container h-full">
    <component
      :is="edit ? 'div' : LinkCard"
      v-bind="edit ? {} : { to: bloc.url, rel: followLinks ? undefined : 'ugc nofollow noopener' }"
      class="h-full flex flex-col @xl:flex-row gap-2.5 p-4"
      :class="{ 'rounded-sm border border-gray-silver bg-white': edit }"
    >
      <img
        v-if="bloc.image"
        :src="bloc.image"
        alt=""
        class="w-full @xl:w-[225px] @xl:h-[130px] object-cover object-left-bottom flex-shrink-0 border border-gray-default rounded-lg"
        loading="lazy"
      >
      <div class="flex-1 space-y-2">
        <template v-if="edit">
          <!-- A title and a URL are required: emptying one keeps the previous one, the bloc
               is deleted instead. -->
          <EditableText
            :model-value="bloc.title"
            tag="span"
            class="font-bold text-base leading-normal text-gray-title"
            :aria-label="$t('Titre de la carte')"
            @update:model-value="bloc.title = $event.trim() || bloc.title"
          />
          <EditableText
            v-if="bloc.description"
            :model-value="bloc.description"
            class="font-normal text-sm leading-normal"
            :aria-label="$t('Description de la carte')"
            @update:model-value="bloc.description = $event.trim() || null"
          />
          <button
            v-else
            type="button"
            class="block text-sm text-gray-400 hover:text-gray-600"
            @click="bloc.description = $t('Description')"
          >
            + {{ $t('Ajouter une description') }}
          </button>
          <input
            :value="bloc.url"
            type="text"
            class="block text-sm text-gray-title placeholder:text-gray-500 bg-white border rounded px-2 py-1 w-full"
            :placeholder="$t('URL de la carte')"
            :aria-label="$t('URL de la carte')"
            @change="changeUrl"
          >
          <BlocImageInput
            v-model="bloc.image"
            removable
          />
        </template>
        <template v-else>
          <component
            :is="tag"
            class="font-bold text-base leading-normal mb-2"
          >
            {{ bloc.title }}
          </component>
          <p
            v-if="bloc.description"
            class="font-normal text-sm leading-normal mb-0"
          >
            {{ bloc.description }}
          </p>
        </template>
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import LinkCard from '../LinkCard.vue'
import BlocImageInput from './BlocImageInput.vue'
import EditableText from './EditableText.vue'
import type { CardBloc } from '~/types/pages'
import { FOLLOW_LINKS } from '~/utils/blocs'
import { BLOCS_LEVEL, type BlocsLevel } from '~/utils/blocsLayout'

defineProps<{
  edit: boolean
}>()

const bloc = defineModel<CardBloc>({ required: true })

function changeUrl(event: Event) {
  const input = event.target as HTMLInputElement
  bloc.value.url = input.value.trim() || bloc.value.url
  input.value = bloc.value.url
}

// Under the title of the section (`h2`), or of the content of an accordion item (`h4`).
const TAGS: Record<BlocsLevel, string> = { section: 'h3', accordion: 'h5' }
const tag = TAGS[inject(BLOCS_LEVEL, 'section')]

// Link chosen by whoever wrote the bloc, see `FOLLOW_LINKS`.
const followLinks = inject(FOLLOW_LINKS, false)
</script>
