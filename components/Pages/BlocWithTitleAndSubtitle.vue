<template>
  <div class="space-y-6">
    <div class="space-y-2.5">
      <EditableText
        v-if="edit"
        :model-value="bloc.title ?? ''"
        class="text-gray-title text-3xl font-extrabold"
        :placeholder="$t('Titre du bloc')"
        @update:model-value="bloc.title = $event || null"
      />
      <div
        v-else-if="bloc.title"
        class="text-gray-title text-3xl font-extrabold"
      >
        {{ bloc.title }}
      </div>

      <EditableText
        v-if="edit && secondaryText"
        :model-value="secondaryText"
        class="text-gray-plain"
        @update:model-value="updateSecondaryText"
      />
      <div
        v-else-if="secondaryText"
        class="text-gray-plain"
      >
        {{ secondaryText }}
      </div>
      <button
        v-else-if="edit"
        type="button"
        class="text-gray-400 hover:text-gray-600 text-sm"
        @click="updateSecondaryText(secondaryLabel)"
      >
        + {{ hasSubtitle ? $t('Ajouter un sous-titre') : $t('Ajouter une description') }}
      </button>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import EditableText from './EditableText.vue'

type BlocWithSubtitle = { id: string, title: string | null, subtitle: string | null }
type BlocWithDescription = { id: string, title: string | null, description: string | null }
type BlocWithSecondaryText = BlocWithSubtitle | BlocWithDescription

defineProps<{
  edit: boolean
}>()

const { t } = useTranslation()

const bloc = defineModel<BlocWithSecondaryText>({ required: true })

const hasSubtitle = computed(() => 'subtitle' in bloc.value)

const secondaryText = computed(() => {
  if (hasSubtitle.value) {
    return (bloc.value as { subtitle?: string | null }).subtitle ?? null
  }
  return (bloc.value as { description?: string | null }).description ?? null
})

const secondaryLabel = computed(() => hasSubtitle.value ? t('Sous-titre') : t('Description'))

function updateSecondaryText(value: string | null) {
  if (hasSubtitle.value) {
    (bloc.value as { subtitle?: string | null }).subtitle = value || null
  }
  else {
    (bloc.value as { description?: string | null }).description = value || null
  }
}
</script>
