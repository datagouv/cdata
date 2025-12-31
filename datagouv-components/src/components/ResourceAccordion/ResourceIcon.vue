<template>
  <component
    :is="(resource.format ? getResourceFormatIcon(resource.format) : null) || File"
    class="text-gray-800 shrink-0"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import type { ResourceFileType } from '../../types/resources'
import File from '../Icons/File.vue'
import { getResourceFormatIcon } from '../../functions/resources'

defineProps<{
  // We would like to use Resource | ResourceForm but ResourceForm is not in
  // datagouv/components yet. We don't use `filetype` but we need otherwise
  // TS don't like passing some object without `format` because it would have
  // nothing in common with `{}`. We could do `{ format: … } | object` but it's
  // really generic and I prefer to have something like `filetype` which is specific
  // to resources' objects.
  resource: { format?: string | null, filetype: ResourceFileType | null }
}>()
</script>
