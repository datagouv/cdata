<template>
  <div>
    <div
      v-if="loading"
      class="flex items-center justify-center py-8"
    >
      <AnimatedLoader />
    </div>
    <div
      v-else-if="error"
      class="text-new-error text-sm py-4"
    >
      {{ t("Impossible de charger la documentation OpenAPI.") }}
    </div>
    <div
      v-else-if="spec"
      class="space-y-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-gray-medium">
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <span v-if="spec.info?.version">
            {{ t("Version") }} <span class="font-mono">{{ spec.info.version }}</span>
          </span>
          <span
            v-if="baseUrl"
            class="inline-flex items-center"
          >
            {{ t("Base URL") }} <span class="font-mono break-all ml-1">{{ baseUrl }}</span>
            <CopyButton
              :label="t('Copier le lien')"
              :copied-label="t('Lien copié !')"
              :text="baseUrl"
              class="shrink-0"
            />
          </span>
        </div>
        <a
          :href="swaggerUiUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-gray-medium hover:text-gray-title"
        >
          {{ t("Ouvrir dans Swagger UI") }}
        </a>
      </div>
      <div
        v-for="group in groupedEndpoints"
        :key="group.tag"
      >
        <Disclosure
          v-slot="{ open }"
          as="div"
          default-open
        >
          <DisclosureButton class="flex w-full items-center justify-between py-2 border-b border-gray-default text-left">
            <span class="font-bold text-gray-title">
              {{ group.tag }}
              <span class="ml-1 text-xs font-normal text-gray-medium">{{ group.endpoints.length }}</span>
            </span>
            <RiArrowDownSLine
              class="size-5 text-gray-medium transition-transform"
              :class="{ 'rotate-180': open }"
            />
          </DisclosureButton>
          <DisclosurePanel class="divide-y divide-gray-100">
            <Disclosure
              v-for="endpoint in group.endpoints"
              :key="endpoint.method + endpoint.path"
              v-slot="{ open: endpointOpen }"
              as="div"
            >
              <DisclosureButton class="flex items-baseline gap-3 py-3 px-1 w-full text-left">
                <span
                  class="shrink-0 w-16 inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-bold uppercase font-mono leading-none"
                  :class="methodColor(endpoint.method)"
                >
                  {{ endpoint.method }}
                </span>
                <div class="min-w-0 flex-1">
                  <span class="inline-flex items-center gap-2">
                    <span class="font-mono text-sm text-gray-title break-all">{{ endpoint.path }}</span>
                    <CopyButton
                      :label="t('Copier le lien')"
                      :copied-label="t('Lien copié !')"
                      :text="endpointFullUrl(endpoint)"
                      class="shrink-0"
                      @click.stop
                    />
                  </span>
                  <p
                    v-if="endpoint.summary"
                    class="text-sm text-gray-medium mt-0.5 mb-0"
                  >
                    {{ endpoint.summary }}
                  </p>
                </div>
                <RiArrowDownSLine
                  class="size-4 shrink-0 text-gray-medium transition-transform"
                  :class="{ 'rotate-180': endpointOpen }"
                />
              </DisclosureButton>
              <DisclosurePanel class="pb-4 px-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EndpointRequest
                    :endpoint="endpoint"
                  />
                  <EndpointResponses
                    :responses="endpoint.responses"
                    :spec="endpoint.spec"
                  />
                </div>
              </DisclosurePanel>
            </Disclosure>
          </DisclosurePanel>
        </Disclosure>
      </div>
      <div v-if="schemas.length">
        <Disclosure
          v-slot="{ open }"
          default-open
          as="div"
        >
          <DisclosureButton class="flex w-full items-center justify-between py-2 border-b border-gray-default text-left">
            <span class="font-bold text-gray-title">
              {{ t("Modèles") }}
              <span class="ml-1 text-xs font-normal text-gray-medium">{{ schemas.length }}</span>
            </span>
            <RiArrowDownSLine
              class="size-5 text-gray-medium transition-transform"
              :class="{ 'rotate-180': open }"
            />
          </DisclosureButton>
          <DisclosurePanel class="divide-y divide-gray-100">
            <Disclosure
              v-for="model in schemas"
              :key="model.name"
              v-slot="{ open: modelOpen }"
              as="div"
            >
              <DisclosureButton class="flex items-center gap-2 py-3 px-1 w-full text-left">
                <RiArrowDownSLine
                  class="size-4 shrink-0 text-gray-medium transition-transform"
                  :class="{ 'rotate-180': modelOpen }"
                />
                <span class="font-mono text-sm text-gray-title">{{ model.name }}</span>
                <span
                  v-if="model.schema.description"
                  class="text-xs text-gray-medium truncate"
                >{{ model.schema.description }}</span>
              </DisclosureButton>
              <DisclosurePanel class="pb-4 px-1">
                <SchemaPanel
                  :spec="spec!"
                  :schema="model.schema"
                />
              </DisclosurePanel>
            </Disclosure>
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { RiArrowDownSLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import AnimatedLoader from '../AnimatedLoader.vue'
import CopyButton from '../CopyButton.vue'
import EndpointRequest from './EndpointRequest.vue'
import EndpointResponses from './EndpointResponses.vue'
import SchemaPanel from './SchemaPanel.vue'
import { parse as parseYaml } from 'yaml'
import type { OpenAPIV3 } from 'openapi-types'
import { resolveRef, type Endpoint } from './openapi'

const props = defineProps<{
  url: string
}>()

const { t } = useTranslation()

const spec = ref<OpenAPIV3.Document | null>(null)
const loading = ref(true)
const error = ref(false)

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const

async function parseOpenApiResponse(response: Response): Promise<OpenAPIV3.Document> {
  const text = await response.text()
  try {
    return JSON.parse(text)
  }
  catch {
    return parseYaml(text) as OpenAPIV3.Document
  }
}

watchEffect(async () => {
  if (!props.url) return
  loading.value = true
  error.value = false
  try {
    const response = await fetch(props.url)
    if (!response.ok) throw new Error(response.statusText)
    spec.value = await parseOpenApiResponse(response)
  }
  catch {
    error.value = true
    spec.value = null
  }
  finally {
    loading.value = false
  }
})

const baseUrl = computed(() => {
  if (!spec.value?.servers?.length) return null
  return spec.value.servers[0]!.url
})

const swaggerUiUrl = computed(() => {
  return `https://petstore.swagger.io/?url=${encodeURIComponent(props.url)}`
})

const endpoints = computed<Endpoint[]>(() => {
  if (!spec.value?.paths) return []
  const result: Endpoint[] = []
  for (const [path, pathItem] of Object.entries(spec.value.paths)) {
    if (!pathItem) continue
    for (const method of HTTP_METHODS) {
      const operation = (pathItem as Record<string, OpenAPIV3.OperationObject>)[method]
      if (!operation) continue

      const parameters = (operation.parameters || []).map((p) => {
        return resolveRef<OpenAPIV3.ParameterObject>(spec.value!, p)
      }).filter((p): p is OpenAPIV3.ParameterObject => p !== null)

      const requestBody = operation.requestBody
        ? resolveRef<OpenAPIV3.RequestBodyObject>(spec.value!, operation.requestBody)
        : null

      const responses: Record<string, OpenAPIV3.ResponseObject> = {}
      if (operation.responses) {
        for (const [code, resp] of Object.entries(operation.responses)) {
          const resolved = resolveRef<OpenAPIV3.ResponseObject>(spec.value!, resp)
          if (resolved) responses[code] = resolved
        }
      }

      result.push({
        method,
        path,
        summary: operation.summary || operation.description || '',
        tags: operation.tags || [],
        parameters,
        requestBody: requestBody || null,
        responses,
        spec: spec.value!,
      })
    }
  }
  return result
})

const groupedEndpoints = computed(() => {
  const groups = new Map<string, Endpoint[]>()
  for (const endpoint of endpoints.value) {
    const tags = endpoint.tags.length ? endpoint.tags : [t('Sans tag')]
    for (const tag of tags) {
      if (!groups.has(tag)) {
        groups.set(tag, [])
      }
      groups.get(tag)!.push(endpoint)
    }
  }
  return Array.from(groups.entries()).map(([tag, endpoints]) => ({ tag, endpoints }))
})

const schemas = computed(() => {
  const components = spec.value?.components?.schemas
  if (!components) return []
  return Object.entries(components).map(([name, schema]) => ({
    name,
    schema: schema as OpenAPIV3.SchemaObject,
  }))
})

function endpointFullUrl(endpoint: Endpoint): string {
  return (baseUrl.value || '') + endpoint.path
}

function methodColor(method: string): string {
  switch (method) {
    case 'get': return 'bg-blue-100 text-blue-800'
    case 'post': return 'bg-green-100 text-green-800'
    case 'put': return 'bg-orange-100 text-orange-800'
    case 'patch': return 'bg-yellow-100 text-yellow-800'
    case 'delete': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>
