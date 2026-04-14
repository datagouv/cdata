<template>
  <div class="border border-gray-default rounded">
    <TabGroup
      size="sm"
      @change="onTabChange"
    >
      <div class="bg-gray-100 px-3 py-2 border-b border-gray-default flex items-center gap-4">
        <div
          ref="tabListContainer"
          class="overflow-x-auto flex-1 min-w-0"
          :class="{ 'scroll-fade': canScrollRight }"
          @scroll="onScroll"
        >
          <TabList>
            <Tab
              v-for="tab in tabs"
              :key="tab.code"
            >
              <span
                class="inline-block w-2 h-2 rounded-full mr-1.5"
                :class="statusDotColor(tab.code)"
              />
              {{ tab.code }}
            </Tab>
          </TabList>
        </div>
        <ContentTypeSelect
          v-if="currentContentTypes.length"
          :content-types="currentContentTypes"
          :model-value="selectedContentType"
          @update:model-value="selectedContentType = $event"
        />
      </div>
      <TabPanels>
        <TabPanel
          v-for="tab in tabs"
          :key="tab.code"
        >
          <div class="p-3 space-y-3">
            <p
              v-if="tab.response.description"
              class="text-xs text-gray-medium mb-0 pb-3 border-b border-gray-100"
            >
              {{ tab.response.description }}
            </p>
            <template v-if="currentMediaType?.schema">
              <SchemaPanel
                :spec="spec"
                :schema="currentMediaType.schema"
              />
            </template>
            <p
              v-else-if="!tab.response.content"
              class="text-xs text-gray-medium mb-0"
            >
              {{ t("Pas de contenu") }}
            </p>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef, onMounted, nextTick } from 'vue'
import TabGroup from '../Tabs/TabGroup.vue'
import TabList from '../Tabs/TabList.vue'
import Tab from '../Tabs/Tab.vue'
import TabPanels from '../Tabs/TabPanels.vue'
import TabPanel from '../Tabs/TabPanel.vue'
import ContentTypeSelect from './ContentTypeSelect.vue'
import { useTranslation } from '../../composables/useTranslation'
import SchemaPanel from './SchemaPanel.vue'
import type { OpenAPIV3 } from 'openapi-types'

const props = defineProps<{
  responses: Record<string, OpenAPIV3.ResponseObject>
  spec: OpenAPIV3.Document
}>()

const { t } = useTranslation()

const tabListContainer = useTemplateRef('tabListContainer')
const canScrollRight = ref(false)

function checkOverflow() {
  const el = tabListContainer.value
  if (!el) return
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

function onScroll() {
  checkOverflow()
}

onMounted(checkOverflow)

const tabs = computed(() =>
  Object.entries(props.responses).map(([code, response]) => ({ code, response })),
)

watch(tabs, () => {
  nextTick(checkOverflow)
})

const activeTabIndex = ref(0)
const selectedContentType = ref('')

const currentContentTypes = computed(() => {
  const tab = tabs.value[activeTabIndex.value]
  if (!tab?.response.content) return []
  return Object.keys(tab.response.content)
})

const currentMediaType = computed(() => {
  const tab = tabs.value[activeTabIndex.value]
  if (!tab?.response.content) return null
  const ct = selectedContentType.value || currentContentTypes.value[0]
  if (!ct) return null
  return tab.response.content[ct] || null
})

watch(currentContentTypes, (types) => {
  selectedContentType.value = types[0] || ''
}, { immediate: true })

function onTabChange(index: number) {
  activeTabIndex.value = index
}

function statusDotColor(code: string): string {
  if (code.startsWith('2')) return 'bg-green-600'
  if (code.startsWith('3')) return 'bg-blue-600'
  if (code.startsWith('4')) return 'bg-orange-500'
  if (code.startsWith('5')) return 'bg-red-600'
  return 'bg-gray-400'
}
</script>

<style scoped>
.scroll-fade {
  mask-image: linear-gradient(to right, black calc(100% - 60px), transparent);
  mask-size: 100% 100%;
  mask-position: center;
  padding-block: 4px;
  margin-block: -4px;
}
</style>
