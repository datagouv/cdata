<template>
  <div
    v-if="infosRag"
    data-track-content
    data-content-name="external recommendations"
    :data-content-piece="infosRag.id"
    :data-content-target="infosRag.id"
    class="bg-blue-lightest py-12"
  >
    <div class="container border-l-4 border-primary flex flex-col sm:flex-row sm:items-end sm:justify-between gap-12">
      <div class="text-primary w-full">
        <p>
          <span class="fr-badge fr-badge--green-menthe">BETA</span><i>Ce jeu de données a été traité par un système RAG afin de permettre une interaction basée sur l’analyse sémantique. Vous pouvez le tester ci-dessous !</i>
        </p>
        <p>Pour tester ce module sur un ensemble plus large de données, <a href="/beta/searchAI">rendez-vous sur le moteur de recherche en version beta.</a></p>
        <h3 class="text-2xl">{{ infosRag.title }}</h3>

        <SearchInput
          v-model="queryString"
          placeholder="Exemple : Qui s'occupe de la météo dans l'état ?"
          @click="search"
        />

        <div v-if="error" class="mt-4 text-red-600">
          Erreur : {{ error }}
        </div>

        <div v-if="results.length" class="mt-6 space-y-4">
            <i>Nous limitons pour le moment le retour à trois résultats maximum.</i>
            <br />
            <div
                v-for="(result, index) in results"
                :key="index"
                class="p-4 bg-white rounded shadow"
            >
                <h3>{{ result.chunk?.metadata?.[infosRag.metadata_title] || 'Sans titre' }}</h3>

                <div v-for="item in infosRag.metadata_description" :key="item">
                    <p>
                    <template v-if="isLink(result.chunk?.metadata?.[item])">
                        <a :href="result.chunk.metadata[item]" target="_blank" rel="noopener">
                        {{ result.chunk.metadata[item] }}
                        </a>
                    </template>
                    <template v-else>
                        {{ result.chunk?.metadata?.[item] || '—' }}
                    </template>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { type DatasetV2WithFullObject } from '@datagouv/components-next'

const props = defineProps<{ dataset: DatasetV2WithFullObject }>()

const queryString = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<any[]>([])

const infosRag = computed(() => {
  const widgetRag = props.dataset.extras['widget-rag'] || null
  if (!widgetRag) return null
  return {
    id: widgetRag.id,
    title: widgetRag.title,
    metadata_title: widgetRag.metadata_title,
    metadata_description: widgetRag.metadata_description,
  }
})

const isLink = (value: any): boolean => {
  return typeof value === 'string' && value.startsWith('http')
}

const search = async () => {
  if (!infosRag.value) return

  loading.value = true
  error.value = null
  results.value = []

  const payload = {
    collections: [infosRag.value.id],
    rff_k: 20,
    k: 3,
    method: 'semantic',
    score_threshold: 0,
    web_search: false,
    web_search_k: 5,
    prompt: queryString.value,
    additionalProp1: {},
  }

  try {
    const response = await fetch('/nuxt-api/rag-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error(`Erreur ${response.status}`)

    const data = await response.json()

    results.value = data.data || []
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la requête'
  } finally {
    loading.value = false
  }
}
</script>
