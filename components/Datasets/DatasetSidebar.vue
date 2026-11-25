<template>
  <dl
    class="w-full min-w-0 space-y-4 pl-0"
  >
    <div>
      <DescriptionListTerm>
        <template v-if="hasContactPointsWithSpecificRole">
          {{ $t("Diffuseur") }}
        </template>
        <template v-else>
          {{ $t("Producteur") }}
        </template>
      </DescriptionListTerm>
      <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
        <OrganizationOwner
          v-if="dataset.organization"
          :organization="dataset.organization"
          as="h2"
          name-size="sm"
          name-color="text-gray-title"
        />
        <AvatarWithName
          v-if="dataset.owner"
          :size="32"
          :user="dataset.owner"
          class="space-x-2"
        />
        <SimpleBanner
          v-if="dataset.owner"
          type="warning"
          class="text-sm"
        >
          {{
            $t(
              "Ce jeu de données a été publié à l'initiative et sous la responsabilité de {author}.",
              {
                author: `${dataset.owner.first_name} ${dataset.owner.last_name}`,
              },
            )
          }}
        </SimpleBanner>
      </dd>
    </div>

    <div v-if="dataset.contact_points.length">
      <DescriptionListTerm>
        <template v-if="hasContactPointsWithSpecificRole">
          {{ $t("Attributions") }}
        </template>
        <template v-else>
          {{ $t("Contacts") }}
        </template>
      </DescriptionListTerm>
      <dd class="m-0 space-y-1 p-0 text-sm/[22px] text-gray-title">
        <ContactPoint
          v-for="contact in dataset.contact_points"
          :key="contact.id"
          :contact
        />
      </dd>
    </div>

    <div
      v-if="dataset.license && dataset.access_type === 'open'"
    >
      <DescriptionListTerm>
        {{ $t("Licence") }}
      </DescriptionListTerm>
      <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
        <TechnicalValue
          :value="dataset.license.title"
          :href="dataset.license.url"
          :copy-text="dataset.license.url || dataset.license.title"
          :label="$t('Copier la licence')"
          :copied-label="$t('Licence copiée !')"
        />
      </dd>
    </div>

    <div>
      <DescriptionListTerm>
        {{ $t("Dernière mise à jour") }}
      </DescriptionListTerm>
      <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
        <FormattedDate :date="dataset.last_update" />
      </dd>
    </div>

    <AccessTypePanel
      v-if="dataset.access_type !== 'open'"
      :object="dataset"
    />

    <div
      v-if="showMetrics && !metricsError"
      class="grid gap-4 xl:grid-cols-2"
    >
      <!-- ClientOnly: the loading skeletons of StatBox get their ids from
           `Math.random()`, which differ between the server and the client render. -->
      <ClientOnly>
        <!-- `?? null`: StatBox shows its loading skeletons on a strict `null`, and
             `data` is `undefined` until the request answers. -->
        <StatBox
          :title="$t('Vues')"
          :data="datasetMetrics?.visits ?? null"
          size="sm"
          type="line"
          :summary="datasetMetrics?.visitsTotal ?? null"
          :since="metricsSince"
        />
        <StatBox
          v-if="dataset.access_type === 'open'"
          :title="$t('Téléchargements')"
          :data="datasetMetrics?.downloads ?? null"
          size="sm"
          type="line"
          :summary="datasetMetrics?.downloadsTotal ?? null"
          :since="metricsSince"
        />
      </ClientOnly>
    </div>

    <div v-if="dataset.access_type === 'open'">
      <DatasetQuality
        :quality="dataset.quality"
        hide-warnings
      />
    </div>

    <SimpleBanner
      v-if="hideWarnings"
      type="gray"
      class="text-sm"
    >
      {{
        $t(
          "La qualité des métadonnées peut être trompeuse car les métadonnées de la source originale peuvent avoir été perdues lors de leur récupération. Nous travaillons actuellement à améliorer la situation.",
        )
      }}
    </SimpleBanner>

    <div v-if="badges.length > 0">
      <dt
        class="text-sm text-gray-plain font-bold flex items-center pb-0"
      >
        <Toggletip
          :button-props="{
            'class': '-ml-2 mt-px px-2',
            'title': $t('Label'),
            'data-testid': 'label-toggletip-button',
          }"
          no-margin
        >
          <template #toggletip="{ close }">
            <div class="flex justify-between border-b">
              <h5 class="fr-text--sm fr-my-0 fr-p-2v">
                {{ $t("Label") }}
              </h5>
              <button
                type="button"
                :title="$t('Fermer')"
                class="border-l border-gray-default w-10 text-[1.2rem] flex items-center justify-center"
                data-testid="label-toggletip-close-button"
                @click="close"
              >
                &times;
              </button>
            </div>
            <div
              class="py-2 px-4"
              data-testid="label-toggletip-content"
            >
              {{
                $t(
                  "Certains jeux de données bénéficient d’un ou plusieurs labels reconnus au niveau national, européen ou international.",
                )
              }}
              <br>
              {{
                $t(
                  "Ces labels peuvent signaler une valeur réglementaire ou une importance stratégique.",
                )
              }}
            </div>
            <div
              v-if="config.public.guidesLabelsUrl"
              class="w-full text-right py-2 px-4"
              target="_blank"
            >
              <a :href="config.public.guidesLabelsUrl">{{
                $t("Voir les labels de données")
              }}</a>
            </div>
          </template>
        </Toggletip>
        {{ $t("Label") }}
      </dt>
      <dd
        class="p-0 text-sm flex flex-wrap gap-1"
        data-testid="label-list"
      >
        <LabelTag
          v-for="badge in badges"
          :key="badge.kind"
          :badge
          :url="`/datasets/search?badge=${badge.kind}`"
        />
      </dd>
    </div>

    <SimpleBanner
      v-if="dataset.harvest && 'remote_url' in dataset.harvest"
      type="gray"
      :icon="RiExternalLinkLine"
    >
      {{ $t("Ce jeu de données provient d'un portail externe.") }}
      <CdataLink
        :to="dataset.harvest.remote_url as string"
        rel="ugc nofollow noopener"
        target="_blank"
        external
        class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
      >
        {{ $t("Voir la source originale.") }}
      </CdataLink>
    </SimpleBanner>
    <SimpleBanner
      v-if="
        'transport:url' in dataset.extras
          && dataset.extras['transport:url']
      "
      type="primary-frame"
    >
      <TranslationT
        keypath="Consulter ce jeu de données sur {link} pour bénéficier d'informations supplémentaires : validations, visualisations, etc."
        tag="p"
        class="!m-0 text-sm"
      >
        <template #link>
          <CdataLink
            :href="dataset.extras['transport:url']"
            class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
          >
            {{
              $t("le Point d'Accès National aux données de mobilités")
            }}
          </CdataLink>
        </template>
      </TranslationT>
    </SimpleBanner>
    <SimpleBanner
      v-if="ecologieUrl"
      type="primary-frame"
    >
      <TranslationT
        keypath="Consulter ce jeu de données sur {link} pour bénéficier d'informations supplémentaires : métadonnées enrichies, visualisations, etc."
        tag="p"
        class="!m-0 text-sm"
      >
        <template #link>
          <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
          <CdataLink
            :href="ecologieUrl"
            class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
          >
            ecologie.data.gouv.fr
          </CdataLink>
        </template>
      </TranslationT>
    </SimpleBanner>
  </dl>
</template>

<script setup lang="ts">
import { AvatarWithName, DatasetQuality, FormattedDate, LabelTag, SimpleBanner, StatBox, TechnicalValue, Toggletip, TranslationT, useMetrics, type DatasetV2WithFullObject, type TranslatedBadge } from '@datagouv/components-next'
import { RiExternalLinkLine } from '@remixicon/vue'
import AccessTypePanel from '~/components/AccessTypes/AccessTypePanel.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'

// Side metadata of a dataset page. Also shown on /design/metadata: the design page and
// the dataset pages render this same component, so they cannot drift apart.
const props = withDefaults(defineProps<{
  dataset: DatasetV2WithFullObject
  // The design page leaves the statistics out of its demonstration.
  showMetrics?: boolean
}>(), {
  showMetrics: true,
})

const config = useRuntimeConfig()
const siteConfig = useSiteConfig()

const hideWarnings = computed(() => {
  if (!props.dataset.harvest) return false
  if (!props.dataset.harvest.backend) return false

  return config.public.harvestBackendsForHidingQuality.includes(
    props.dataset.harvest.backend,
  )
})

const hasContactPointsWithSpecificRole = computed(() => {
  return props.dataset.contact_points.some(
    contactPoint => contactPoint.role !== 'contact',
  )
})

// ecologie.data.gouv.fr shows indicators and the datasets of its universe, both
// flagged by an extra. Indicators win.
const ecologieUrl = computed(() => {
  const base = `https://${siteConfig.url.includes('demo') ? 'demo.' : ''}ecologie.data.gouv.fr`
  if ('ecospheres-indicateurs' in props.dataset.extras) return `${base}/indicators/${props.dataset.slug}`
  if (props.dataset.extras['ecologie:universe']) return `${base}/datasets/${props.dataset.slug}`
  return null
})

// The badge labels are a reference list needed only to name the badges this
// dataset carries: most datasets carry none, and fetching it for them would be
// one request per page view for nothing.
const { data: badgeTranslations } = await useFetch('/nuxt-api/dataset-badges', {
  immediate: Boolean(props.dataset.badges?.length),
})

const badges = computed(() =>
  (props.dataset.badges ?? []).map<TranslatedBadge>(b => ({
    ...b,
    label: badgeTranslations.value?.[b.kind] ?? '',
  })),
)

const metricsSince = computed(() => {
  // max of the start of metrics computing and the creation of the dataset on the platform
  return [props.dataset.internal.created_at_internal, config.public.metricsSince].reduce((max, c) => c > max ? c : max)
})

const { getDatasetMetrics } = useMetrics()

// `server: false` keeps the call out of the render: the metrics API is a third-party service
// and its numbers are secondary to the page, so waiting for it would delay the whole page.
// The boxes disappear on `error` rather than presenting a zero the API never returned.
const { data: datasetMetrics, error: metricsError } = useAsyncData(
  'dataset-metrics',
  () => props.dataset.id ? getDatasetMetrics(props.dataset.id) : Promise.resolve(null),
  { lazy: true, server: false, immediate: props.showMetrics, watch: [() => props.dataset.id] },
)
</script>
