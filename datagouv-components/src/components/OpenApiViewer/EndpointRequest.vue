<template>
  <div class="border border-gray-default rounded">
    <div
      v-if="!tabs.length"
      class="p-3 text-xs text-gray-medium"
    >
      {{ t("Aucun paramètre de requête") }}
    </div>
    <TabGroup
      v-else
      size="sm"
      @change="onTabChange"
    >
      <div class="bg-gray-100 px-3 py-2 border-b border-gray-default flex items-center justify-between gap-2">
        <TabList>
          <Tab
            v-for="tab in tabs"
            :key="tab.key"
          >
            {{ tab.label }}
          </Tab>
        </TabList>
        <ContentTypeSelect
          v-if="activeTab === 'body' && bodyContentTypes.length"
          :content-types="bodyContentTypes"
          :model-value="selectedBodyContentType"
          @update:model-value="selectedBodyContentType = $event"
        />
      </div>
      <TabPanels>
        <TabPanel
          v-for="tab in tabs"
          :key="tab.key"
        >
          <div
            v-if="tab.key === 'query'"
            class="p-3"
          >
            <div class="space-y-0 divide-y divide-gray-100">
              <div
                v-for="param in queryParams"
                :key="param.name"
                class="py-2"
              >
                <div class="flex items-baseline gap-2">
                  <span class="font-mono text-xs text-gray-title">
                    {{ param.name }}
                    <span
                      v-if="param.required"
                      class="text-red-600"
                    >*</span>
                  </span>
                  <span class="font-mono text-xs text-gray-medium">{{ getSchemaType(endpoint.spec, param.schema) }}</span>
                </div>
                <p
                  v-if="param.description"
                  class="text-xs text-gray-medium mt-0.5 mb-0"
                >
                  {{ param.description }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="tab.key === 'path'"
            class="p-3"
          >
            <div class="space-y-0 divide-y divide-gray-100">
              <div
                v-for="param in pathParams"
                :key="param.name"
                class="py-2"
              >
                <div class="flex items-baseline gap-2">
                  <span class="font-mono text-xs text-gray-title">
                    {{ param.name }}
                    <span class="text-red-600">*</span>
                  </span>
                  <span class="font-mono text-xs text-gray-medium">{{ getSchemaType(endpoint.spec, param.schema) }}</span>
                </div>
                <p
                  v-if="param.description"
                  class="text-xs text-gray-medium mt-0.5 mb-0"
                >
                  {{ param.description }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="tab.key === 'body'"
            class="p-3"
          >
            <SchemaPanel
              v-if="currentBodyMediaType?.schema"
              :spec="endpoint.spec"
              :schema="currentBodyMediaType.schema"
            />
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TabGroup from '../Tabs/TabGroup.vue'
import TabList from '../Tabs/TabList.vue'
import Tab from '../Tabs/Tab.vue'
import TabPanels from '../Tabs/TabPanels.vue'
import TabPanel from '../Tabs/TabPanel.vue'
import ContentTypeSelect from './ContentTypeSelect.vue'
import { useTranslation } from '../../composables/useTranslation'
import SchemaPanel from './SchemaPanel.vue'
import { getSchemaType, type Endpoint } from './openapi'

const props = defineProps<{
  endpoint: Endpoint
}>()

const { t } = useTranslation()

const queryParams = computed(() => props.endpoint.parameters.filter(p => p.in === 'query'))
const pathParams = computed(() => props.endpoint.parameters.filter(p => p.in === 'path'))

const tabs = computed(() => {
  const result: { key: string, label: string }[] = []
  if (pathParams.value.length) {
    result.push({ key: 'path', label: t('Path') })
  }
  if (queryParams.value.length) {
    result.push({ key: 'query', label: t('Query') })
  }
  if (props.endpoint.requestBody) {
    result.push({ key: 'body', label: t('Body') })
  }
  return result
})

const activeTabIndex = ref(0)
const activeTab = computed(() => tabs.value[activeTabIndex.value]?.key || '')
const selectedBodyContentType = ref('')

const bodyContentTypes = computed(() => {
  if (!props.endpoint.requestBody?.content) return []
  return Object.keys(props.endpoint.requestBody.content)
})

const currentBodyMediaType = computed(() => {
  if (!props.endpoint.requestBody?.content) return null
  const ct = selectedBodyContentType.value || bodyContentTypes.value[0]
  if (!ct) return null
  return props.endpoint.requestBody.content[ct] || null
})

watch(bodyContentTypes, (types) => {
  selectedBodyContentType.value = types[0] || ''
}, { immediate: true })

function onTabChange(index: number) {
  activeTabIndex.value = index
}
</script>
