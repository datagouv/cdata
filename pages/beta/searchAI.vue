<template>
  <div class="container mb-16">
    <Breadcrumb>
      <BreadcrumbItem to="/" :external="true">
        {{ $t('Home') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="!mb-2">
      Moteur de recherche basé sur une intelligence artificielle souveraine
    </h1>

    <p>Nouveau ! La plateforme data.gouv.fr expérimente un nouveau mode de recherche ! Basé sur une question en langage naturel, vous pouvez chercher des informations contenues à l'intérieur de jeux de données ayant été au préalable vectorisés.</p>
    <SearchInput
      v-model="queryString"
      placeholder="Exemple : Qui s'occupe de la météo dans l'état ?"
      @click="search"
    />

    <div class="mt-4 flex gap-4">
      <button
        class="px-4 py-2 rounded border"
        :class="selectionMode === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border-gray-400'"
        @click="setSelectionMode('all')"
      >
        Tous les jeux de données vectorisés
      </button>
      <button
        class="px-4 py-2 rounded border"
        :class="selectionMode === 'custom' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border-gray-400'"
        @click="setSelectionMode('custom')"
      >
        Sélectionner parmi les jeux de données vectorisées
      </button>
    </div>

    <div v-if="selectionMode === 'custom'" class="mt-4">
      <p class="mb-2 font-medium">Jeux de données vectorisés disponibles :</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in infosRagList"
          :key="item.id"
          class="fr-tag"
          :ariaPressed="selectedCollections.has(item.id)"
          @click="toggleCollection(item.id)"
        >
          {{ item.title }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mt-4 text-red-600">
      Erreur : {{ error }}
    </div>

    <div v-if="results.length" class="mt-6 space-y-4">
      <i>Nous limitons pour le moment le retour à dix résultats maximum.</i>
      <br />

      <div
        v-for="(result, index) in results"
        :key="index"
        class="p-4 bg-white rounded shadow"
      >
        <template v-if="getMetadataFields(result.chunk?.metadata?.collection_id)">
          <h3>
            {{
              result.chunk?.metadata?.[
                getMetadataFields(result.chunk?.metadata?.collection_id).title
              ] || 'Sans titre'
            }}
          </h3>

          <div
            v-for="item in getMetadataFields(result.chunk?.metadata?.collection_id).description"
            :key="item"
          >
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

          <button
            class="inline-flex items-center justify-center rounded-full font-medium border !bg-none !no-underline after:content-none text-gray-plain bg-white !border-gray-plain [&&]:hover:!bg-gray-some text-sm h-10 leading-none px-4 space-x-1"
            @click="toggleDetails(index, result.chunk?.metadata?.collection_id)"
          >
            {{ expandedIndices.has(index) ? 'Masquer' : 'Voir le jeu de données source' }}
          </button>

          <div
            v-if="expandedIndices.has(index) && datasetsById[getDatasetId(result.chunk?.metadata?.collection_id)]"
            class="mt-4"
          >
            <DatasetCardLg
              :dataset="datasetsById[getDatasetId(result.chunk?.metadata?.collection_id)]"
              class="m-0"
            />
          </div>
        </template>
        <template v-else>
          <p class="text-red-500">Collection inconnue pour ce résultat</p>
        </template>
      </div>
    </div>
    <br /><br />
    <h3>Des données vectorisées ? Kesako ?</h3>
    <p>La vectorisation de données est une étape clé en science des données. Vectoriser des données signifie transformer des informations (souvent du texte, des images ou des catégories) en nombres que les algorithmes peuvent comprendre et traiter.</p>
    <h3>Pourquoi vectoriser ?</h3>
    <p>Les ordinateurs ne comprennent pas les mots, les images ou les concepts comme nous. Ils ne comprennent que des nombres. La vectorisation permet donc de convertir des données complexes en vecteurs numériques (des listes de nombres) que les algorithmes peuvent analyser, comparer ou classer.</p>
    <h3>A quoi ça sert ?</h3>
    <p>Ici par exemple, nous pouvons chercher à l'intérieur de base de données publiées sur data.gouv.fr. La vectorisation des données permet d'interroger en langage naturel simplement ces données, le moteur de recherche nous retourne alors les éléments des bases de données interrogées qui lui semble le plus pertinent.</p>
    <h3>Qu'est-ce qu'il y a sous le capot ?</h3>
    <p>Nous nous basons sur les outils de <a href="https://alliance.numerique.gouv.fr/albert/">l'équipe Albert de la DINUM</a>. Ces outils sont servies de façon souveraine, sécurisée, le tout dans une démarche open source et portée par l'administration.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import { type DatasetV2 } from '@datagouv/components-next'

const { t } = useI18n()
useSeoMeta({ title: 'Recherche IA' })

const queryString = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<any[]>([])

const infosRagList = ref<any[]>([])
const metadataByCollectionId = ref<Record<number, { title: string; description: string[] }>>({})
const collectionToDatasetId = ref<Record<number, string>>({})
const datasetsById = ref<Record<string, DatasetV2>>({})
const expandedIndices = ref<Set<number>>(new Set())

const selectionMode = ref<'all' | 'custom'>('all')
const selectedCollections = ref<Set<number>>(new Set())

const setSelectionMode = (mode: 'all' | 'custom') => {
  selectionMode.value = mode
  if (mode === 'all') {
    selectedCollections.value.clear()
  }
}

const toggleCollection = (id: number) => {
  if (selectedCollections.value.has(id)) {
    selectedCollections.value.delete(id)
  } else {
    selectedCollections.value.add(id)
  }
}

const isLink = (value: any): boolean => {
  return typeof value === 'string' && value.startsWith('http')
}

const getMetadataFields = (collectionId: number) => {
  return metadataByCollectionId.value[collectionId]
}

const getDatasetId = (collectionId: number): string => {
  return collectionToDatasetId.value[collectionId]
}

const toggleDetails = async (index: number, collectionId: number) => {
  if (expandedIndices.value.has(index)) {
    expandedIndices.value.delete(index)
    return
  }

  const datasetId = getDatasetId(collectionId)
  if (!datasetId) {
    error.value = `Aucun dataset_id trouvé pour la collection ${collectionId}`
    return
  }

  if (!datasetsById.value[datasetId]) {
    try {
      const { data } = await useAPI<DatasetV2>(`/api/2/datasets/${datasetId}/`)
      datasetsById.value[datasetId] = data
    } catch (err) {
      error.value = `Erreur lors du chargement du dataset ${datasetId}`
      return
    }
  }

  expandedIndices.value.add(index)
}

onMounted(async () => {
  try {
    const res = await fetch('https://demo.data.gouv.fr/fr/datasets/r/555740ac-fbf9-4c86-bb31-5356cac26435')
    const data = await res.json()
    infosRagList.value = data

    metadataByCollectionId.value = data.reduce((acc: any, item: any) => {
      acc[item.id] = {
        title: item.metadata_title,
        description: item.metadata_description,
      }
      return acc
    }, {})

    collectionToDatasetId.value = data.reduce((acc: any, item: any) => {
      acc[item.id] = item.dataset_id
      return acc
    }, {})
  } catch (err: any) {
    error.value = 'Impossible de charger les métadonnées RAG'
  }
})

const search = async () => {
  const collectionsToUse =
    selectionMode.value === 'all'
      ? infosRagList.value.map((item: any) => item.id)
      : Array.from(selectedCollections.value)

  if (!collectionsToUse.length) {
    error.value = 'Veuillez sélectionner au moins une collection.'
    return
  }

  loading.value = true
  error.value = null
  results.value = []
  expandedIndices.value.clear()

  const payload = {
    collections: collectionsToUse,
    rff_k: 20,
    k: 10,
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
