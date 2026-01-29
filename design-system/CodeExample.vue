<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
    <div class="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2">
      <span
        v-if="title"
        class="text-sm font-medium text-gray-600"
      >{{ title }}</span>
      <span v-else />
      <button
        type="button"
        class="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700"
        @click="copyCode"
      >
        <RiFileCopyLine
          v-if="!copied"
          class="size-4"
        />
        <RiCheckLine
          v-else
          class="size-4 text-green-600"
        />
        {{ copied ? 'Copié!' : 'Copier' }}
      </button>
    </div>
    <div class="overflow-x-auto p-4">
      <pre class="text-sm leading-relaxed"><code
class="hljs"
                                                 v-html="highlightedCode"
      /></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiCheckLine, RiFileCopyLine } from '@remixicon/vue'

const props = defineProps<{
  code: string
  title?: string
}>()

const copied = ref(false)
const hljs = ref<typeof import('highlight.js/lib/core').default | null>(null)

const normalizedCode = computed(() => {
  const lines = props.code.split('\n')
  if (lines[0] === '') lines.shift()
  if (lines[lines.length - 1] === '') lines.pop()

  const minIndent = lines
    .filter(line => line.trim())
    .reduce((min, line) => {
      const indent = line.match(/^\s*/)?.[0].length ?? 0
      return Math.min(min, indent)
    }, Infinity)

  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
})

const highlightedCode = computed(() => {
  if (!hljs.value) return escapeHtml(normalizedCode.value)
  return hljs.value.highlight(normalizedCode.value, { language: 'xml' }).value
})

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

onMounted(async () => {
  const hljsModule = (await import('highlight.js/lib/core')).default
  const xml = (await import('highlight.js/lib/languages/xml')).default
  const javascript = (await import('highlight.js/lib/languages/javascript')).default
  const typescript = (await import('highlight.js/lib/languages/typescript')).default

  hljsModule.registerLanguage('xml', xml)
  hljsModule.registerLanguage('javascript', javascript)
  hljsModule.registerLanguage('typescript', typescript)

  hljs.value = hljsModule
})

const copyCode = async () => {
  await navigator.clipboard.writeText(normalizedCode.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>

<style>
.hljs {
  background: transparent !important;
  padding: 0 !important;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-built_in,
.hljs-name,
.hljs-tag {
  color: #d73a49;
}

.hljs-string,
.hljs-title,
.hljs-attr,
.hljs-variable,
.hljs-template-variable {
  color: #22863a;
}

.hljs-comment,
.hljs-quote,
.hljs-meta {
  color: #6a737d;
  font-style: italic;
}

.hljs-number,
.hljs-literal,
.hljs-type,
.hljs-params {
  color: #005cc5;
}

.hljs-attribute {
  color: #e36209;
}

.hljs-selector-class,
.hljs-selector-attr,
.hljs-selector-pseudo {
  color: #6f42c1;
}
</style>
