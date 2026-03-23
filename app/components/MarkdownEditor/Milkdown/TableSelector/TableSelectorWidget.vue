<template>
  <button
    ref="containerRef"
    type="button"
    :draggable="type !== 'top-left'"
    class="block p-0 cursor-pointer hover:!bg-primary absolute bg-neutral-300"
    :class="className + ' ' + common"
    @click.stop="click"
    @dragstart.stop="dragStart"
    @dragover.stop.prevent="dragOver"
    @dragleave="dragLeave"
    @drop="drop"
  />
</template>

<script setup lang="ts">
import type { Editor } from '@milkdown/core'
import { commandsCtx } from '@milkdown/core'
import { useInstance } from '@milkdown/vue'
import { useWidgetViewContext } from '@prosemirror-adapter/vue'
import { computed, ref } from 'vue'
import { moveColCommand, moveRowCommand, selectColCommand, selectRowCommand, selectTableCommand } from '@milkdown/preset-gfm'
import { tableTooltipCtx } from '~/components/MarkdownEditor/Milkdown/TableTooltip/tableTooltipCtx'

const { spec } = useWidgetViewContext()
const type = spec?.type
const index = spec?.index ?? 0
const [loading, getEditor] = useInstance()
const containerRef = ref<HTMLDivElement | null>(null)

const drag = ref(false)

const common = computed(
  () => (drag.value ? 'border border-primary border-2' : ''),
)

const className = computed(() => {
  if (type === 'left') return 'w-2 h-full -left-3.5 top-0 py-1'

  if (type === 'top') return 'right-px h-2 w-full left-0 -top-3.5'

  return 'h-3 w-3 -left-4 -top-4 rounded-full'
})

function click(_e: Event) {
  const div = containerRef.value
  if (!div) return
  if (loading.value) return
  const editor = getEditor() as Editor
  editor.action(async (ctx) => {
    const tooltip = ctx.get(tableTooltipCtx.key)
    tooltip?.show({
      getBoundingClientRect: () => div.getBoundingClientRect(),
    })

    const commands = ctx.get(commandsCtx)

    if (type === 'left') commands.call(selectRowCommand.key, { index })
    else if (type === 'top') commands.call(selectColCommand.key, { index })
    else commands.call(selectTableCommand.key)
  })
}

function dragStart(e: DragEvent) {
  const data = { index: spec?.index, type: spec?.type }
  if (e.dataTransfer) {
    e.dataTransfer.setData(
      'application/milkdown-table-sort',
      JSON.stringify(data),
    )
    e.dataTransfer.effectAllowed = 'move'
  }
}

function dragOver(e: DragEvent) {
  drag.value = true
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function dragLeave() {
  drag.value = false
}

function drop(e: DragEvent) {
  drag.value = false
  if (type === 'top-left') return
  const i = spec?.index
  if (loading.value || i == null) return
  const data = e.dataTransfer?.getData('application/milkdown-table-sort') ?? ''
  try {
    const { index, type } = JSON.parse(data)
    const editor = getEditor() as Editor
    editor.action((ctx) => {
      const commands = ctx.get(commandsCtx)
      const options = {
        from: Number(index),
        to: i,
      }

      commands.call(
        type === 'left' ? moveRowCommand.key : moveColCommand.key,
        options,
      )
    })
  }
  catch {
    // ignore data from other source
  }
}
</script>
