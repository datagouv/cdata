<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/metadata">
        {{ t('Métadonnées') }}
      </BreadcrumbItem>
    </Breadcrumb>

    <h1 class="mb-3">
      Métadonnées
    </h1>
    <p class="max-w-3xl">
      Référence des métadonnées détaillées affichées dans les fiches de jeux de données,
      de ressources, d’API et d’organisations. Les statbox, avatars et téléchargements sont hors périmètre.
    </p>

    <nav
      aria-label="Sections de la page"
      class="my-6 flex flex-wrap gap-x-6 gap-y-3"
    >
      <a href="#principes">Principes</a>
      <a href="#jeu-de-donnees">Jeu de données</a>
      <a href="#metadonnees-laterales">Métadonnées latérales</a>
      <a href="#ressource">Ressource</a>
      <a href="#organisation">Organisation</a>
      <a href="#briques">Briques transverses</a>
    </nav>

    <section
      id="principes"
      class="scroll-mt-8"
    >
      <h2 class="mb-3">
        Principes
      </h2>
      <DescriptionList class="rounded border border-gray-default bg-white p-6">
        <div>
          <DescriptionListTerm>Titre de section</DescriptionListTerm>
          <DescriptionListDetails>14 px / 20 px · graisse 500 · capitales</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>Libellé et valeur</DescriptionListTerm>
          <DescriptionListDetails>14 px · libellé gris · valeur noire régulière</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>Grille</DescriptionListTerm>
          <DescriptionListDetails>Deux colonnes maximum · une colonne dans les panneaux étroits</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>Rythme</DescriptionListTerm>
          <DescriptionListDetails>20 px entre les lignes · 24 px entre les colonnes</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>Données techniques</DescriptionListTerm>
          <DescriptionListDetails class="font-mono text-[13px]/[18px]">
            mono · chiffres tabulaires · troncature visuelle
          </DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>Actions</DescriptionListTerm>
          <DescriptionListDetails>Liens explicites · copie adjacente · focus visible</DescriptionListDetails>
        </div>
      </DescriptionList>
    </section>

    <section
      id="jeu-de-donnees"
      class="mt-12 scroll-mt-8"
    >
      <h2 class="mb-3">
        Métadonnées du jeu de données
      </h2>
      <p>Les composants ci-dessous utilisent les données du serveur configuré.</p>
      <LoadingBlock
        :status="datasetStatus"
        :data="dataset"
        class="bg-transparent"
      >
        <template #default="{ data }">
          <div class="divide-y divide-gray-default rounded border border-gray-default bg-white px-6">
            <DatasetInformationSection :dataset="data">
              <div v-if="data.doi">
                <DescriptionListTerm>DOI</DescriptionListTerm>
                <DescriptionListDetails>
                  <TechnicalValue
                    :value="data.doi"
                    :href="`https://doi.org/${data.doi}`"
                    :copy-text="`https://doi.org/${data.doi}`"
                    label="Copier le lien du DOI"
                    copied-label="Lien du DOI copié !"
                  />
                </DescriptionListDetails>
              </div>
            </DatasetInformationSection>
            <DatasetTemporalitySection :dataset="data" />
            <DatasetSpatialSection :dataset="data">
              <template #map>
                <span>Géométrie disponible</span>
              </template>
            </DatasetSpatialSection>
            <DatasetSchemaSection :dataset="data" />
            <DatasetEmbedSection :dataset="data" />
            <MetadataExtras
              class="border-b border-gray-default py-4"
              button-text="Voir les extras"
              title-text="Extras du jeu de données"
              :extra="data.extras"
              title-level="h3"
            />
          </div>
        </template>
      </LoadingBlock>
    </section>

    <section
      id="metadonnees-laterales"
      class="mt-12 scroll-mt-8"
    >
      <h2 class="mb-3">
        Métadonnées latérales des objets
      </h2>
      <p class="max-w-3xl">
        Colonnes affichées à côté de la description principale sur les fiches de jeu de données,
        d’API et de réutilisation. Ces exemples composites réunissent volontairement tous les cas
        afin de rendre visibles les sous-composants. Les statistiques sont exclues de la démonstration.
      </p>
      <div class="grid items-start gap-6 xl:grid-cols-3">
        <article class="min-w-0 rounded border border-gray-default bg-white p-6">
          <h3 class="mt-0 mb-6 border-b border-gray-default pb-4">
            Jeu de données
          </h3>
          <DatasetSidebar
            v-if="richDataset"
            :dataset="richDataset"
            :show-metrics="false"
          />
        </article>
        <article class="min-w-0 rounded border border-gray-default bg-white p-6">
          <h3 class="mt-0 mb-6 border-b border-gray-default pb-4">
            API
          </h3>
          <DataserviceSidebar
            v-if="richDataservice"
            :dataservice="richDataservice"
          />
        </article>
        <article class="min-w-0 rounded border border-gray-default bg-white p-6">
          <h3 class="mt-0 mb-6 border-b border-gray-default pb-4">
            Réutilisation
          </h3>
          <ReuseSidebar
            v-if="richReuse"
            :reuse="richReuse"
            :show-metrics="false"
          />
        </article>
      </div>
    </section>

    <section
      id="ressource"
      class="mt-12 scroll-mt-8"
    >
      <h2 class="mb-3">
        Métadonnées de la ressource
      </h2>
      <p>URLs, valeurs techniques, dates, taille, type et extras dans une grille commune.</p>
      <div class="rounded border border-gray-default bg-white p-6">
        <Metadata :resource="exampleResource" />
      </div>
    </section>

    <section
      id="organisation"
      class="mt-12 scroll-mt-8"
    >
      <h2 class="mb-3">
        Métadonnées de l’organisation
      </h2>
      <p class="max-w-3xl">
        Métadonnées présentes dans l’onglet Informations d’une organisation, hors statistiques,
        téléchargements et membres avec avatars.
      </p>
      <!-- The same sections as the organization page: closed accordions, as there. -->
      <div
        v-if="organization"
        class="border-x border-gray-default bg-white px-6"
      >
        <OrganizationTechnicalSection :organization />
        <OrganizationEmbedSection :organization />
      </div>
    </section>

    <section
      id="briques"
      class="mt-12 scroll-mt-8"
    >
      <h2 class="mb-3">
        Briques transverses
      </h2>
      <div class="grid gap-6 xl:grid-cols-2">
        <article class="rounded border border-gray-default bg-white p-6">
          <h3 class="mt-0 mb-5">
            DescriptionList
          </h3>
          <DescriptionList>
            <div>
              <DescriptionListTerm>Producteur</DescriptionListTerm>
              <DescriptionListDetails>Observatoire des territoires</DescriptionListDetails>
            </div>
            <div>
              <DescriptionListTerm>Licence</DescriptionListTerm>
              <DescriptionListDetails>Licence Ouverte 2.0</DescriptionListDetails>
            </div>
          </DescriptionList>
        </article>

        <article class="rounded border border-gray-default bg-white p-6">
          <h3 class="mt-0 mb-5">
            CopyButton
          </h3>
          <DescriptionList>
            <div>
              <DescriptionListTerm>variant="reveal" (par défaut) : libellé au survol</DescriptionListTerm>
              <DescriptionListDetails>
                <CopyButton
                  text="demo-dataset"
                  label="Copier l’identifiant"
                  copied-label="Identifiant copié !"
                />
              </DescriptionListDetails>
            </div>
            <div>
              <DescriptionListTerm>variant="label" : libellé toujours visible</DescriptionListTerm>
              <DescriptionListDetails>
                <CopyButton
                  text="demo-dataset"
                  label="Copier l’identifiant"
                  copied-label="Identifiant copié !"
                  variant="label"
                />
              </DescriptionListDetails>
            </div>
            <div>
              <DescriptionListTerm>variant="icon"</DescriptionListTerm>
              <DescriptionListDetails>
                <CopyButton
                  text="demo-dataset"
                  label="Copier l’identifiant"
                  copied-label="Identifiant copié !"
                  variant="icon"
                />
              </DescriptionListDetails>
            </div>
            <div>
              <DescriptionListTerm>variant="inline"</DescriptionListTerm>
              <DescriptionListDetails>
                <CopyButton
                  text="5c4ae55a634f4117716d5656"
                  label="Copier l’identifiant"
                  copied-label="Identifiant copié !"
                  variant="inline"
                >
                  5c4ae55a634f4117716d5656
                </CopyButton>
              </DescriptionListDetails>
            </div>
          </DescriptionList>
        </article>

        <article
          v-if="dataset?.quality"
          class="rounded border border-gray-default bg-white p-6"
        >
          <h3 class="mt-0 mb-5">
            DatasetQuality
          </h3>
          <DatasetQuality :quality="dataset.quality" />
        </article>

        <article
          v-if="dataservice?.quality"
          class="rounded border border-gray-default bg-white p-6"
        >
          <h3 class="mt-0 mb-5">
            DataserviceQuality
          </h3>
          <DataserviceQuality :quality="dataservice.quality" />
        </article>

        <article class="rounded border border-gray-default bg-white p-6">
          <h3 class="mt-0 mb-5">
            ContactPoint
          </h3>
          <ContactPoint :contact="exampleContact" />
        </article>

        <article
          v-if="dataset?.organization"
          class="rounded border border-gray-default bg-white p-6"
        >
          <h3 class="mt-0 mb-5">
            OrganizationOwner
          </h3>
          <OrganizationOwner :organization="dataset.organization" />
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  CopyButton,
  DataserviceQuality,
  DatasetEmbedSection,
  DatasetInformationSection,
  DatasetQuality,
  DatasetSchemaSection,
  DatasetSpatialSection,
  DatasetTemporalitySection,
  DescriptionListDetails,
  DescriptionListTerm,
  MetadataExtras,
  LoadingBlock,
  Metadata,
  TechnicalValue,
  type ContactPoint as ContactPointType,
  type Dataservice,
  type DatasetV2WithFullObject,
  type Organization,
  type Resource,
  type Reuse,
} from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import DataserviceSidebar from '~/components/Dataservices/DataserviceSidebar.vue'
import DatasetSidebar from '~/components/Datasets/DatasetSidebar.vue'
import OrganizationEmbedSection from '~/components/Organization/OrganizationEmbedSection.vue'
import OrganizationTechnicalSection from '~/components/Organization/OrganizationTechnicalSection.vue'
import ReuseSidebar from '~/components/Reuses/ReuseSidebar.vue'
import DescriptionList from '~/components/DescriptionList/DescriptionList.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'

const { t } = useTranslation()

const { data: dataset, status: datasetStatus } = await useAPI<DatasetV2WithFullObject>('/api/2/datasets/repertoire-national-des-elus-1/', {
  headers: { 'X-Get-Datasets-Full-Objects': 'True' },
  lazy: true,
})
const { data: dataservice } = await useAPI<Dataservice>('/api/1/dataservices/api-tabulaire-data-gouv-fr-beta/', { lazy: true })
const { data: reuse } = await useAPI<Reuse>('/api/1/reuses/itineriz-deplacements-professionnels-jop-paris-2024/', { lazy: true })
const { data: organization } = await useAPI<Organization>('/api/1/organizations/sante-publique-france/', { lazy: true })

const richContacts: Array<ContactPointType> = [
  {
    id: 'demo-contact',
    name: 'Équipe des données territoriales',
    email: 'contact@example.org',
    role: 'contact',
  },
  {
    id: 'demo-publisher',
    name: 'Direction de la publication et de la diffusion',
    contact_form: 'https://support.data.gouv.fr/',
    role: 'publisher',
  },
  {
    id: 'demo-rights-holder',
    name: 'Service juridique et droits de réutilisation',
    email: 'droits@example.org',
    role: 'rightsHolder',
  },
]

const richDataset = computed<DatasetV2WithFullObject | null>(() => dataset.value
  ? ({
      ...dataset.value,
      contact_points: richContacts,
      access_type: 'restricted',
      access_audiences: [
        { role: 'local_authority_and_administration', condition: 'yes' },
        { role: 'company_and_association', condition: 'under_condition' },
        { role: 'private', condition: 'no' },
      ],
      access_type_reason_category: null,
      access_type_reason: 'Accès encadré pour protéger les données à caractère personnel.',
      authorization_request_url: 'https://support.data.gouv.fr/',
      harvest: {
        ...(dataset.value.harvest ?? {}),
        remote_url: 'https://data.example.org/datasets/repertoire-national-des-elus',
      },
      quality: {
        all_resources_available: true,
        dataset_description_quality: true,
        has_open_format: true,
        has_resources: true,
        license: true,
        resources_documentation: false,
        score: 0.78,
        spatial: true,
        temporal_coverage: false,
        update_frequency: true,
        update_fulfilled_in_time: false,
      },
    }) as DatasetV2WithFullObject
  : null)

const richDataservice = computed<Dataservice | null>(() => dataservice.value
  ? ({
      ...dataservice.value,
      contact_points: richContacts.slice(0, 2),
      access_type: 'restricted',
      access_audiences: [
        { role: 'local_authority_and_administration', condition: 'yes' },
        { role: 'company_and_association', condition: 'under_condition' },
        { role: 'private', condition: 'no' },
      ],
      access_type_reason_category: null,
      access_type_reason: 'Une habilitation est nécessaire pour utiliser les données détaillées.',
      authorization_request_url: 'https://support.data.gouv.fr/',
      base_api_url: dataservice.value.base_api_url || 'https://tabular-api.data.gouv.fr/api/resources/',
      rate_limiting: '100 requêtes par seconde et par adresse IP',
      rate_limiting_url: 'https://guides.data.gouv.fr/api-de-data.gouv.fr/',
      availability: 99.95,
      business_documentation_url: 'https://guides.data.gouv.fr/',
      technical_documentation_url: 'https://tabular-api.data.gouv.fr/api/doc',
      machine_documentation_url: dataservice.value.machine_documentation_url || 'https://tabular-api.data.gouv.fr/api/openapi.json',
      quality: {
        has_description: true,
        has_machine_documentation: true,
        has_technical_documentation: true,
        has_business_documentation: true,
        has_contact_point: true,
        has_base_api_url: true,
        availability_documented: true,
        rate_limiting_documented: false,
        access_conditions_clear: false,
        score: 0.82,
      },
    }) as Dataservice
  : null)

const richReuse = computed<Reuse | null>(() => reuse.value
  ? ({
      ...reuse.value,
      tags: ['mobilité professionnelle', 'JOP 2024', 'itinéraires', 'livraison', 'Paris'],
    }) as Reuse
  : null)

const exampleContact: ContactPointType = {
  id: 'demo-contact',
  name: 'Équipe des données territoriales',
  email: 'contact@example.org',
  role: 'contact',
}

const exampleResource: Resource = {
  id: 'demo-resource',
  title: 'Population par commune 2025',
  type: 'main',
  checksum: { type: 'sha256', value: 'a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4' },
  created_at: '2026-01-12T12:00:00+00:00',
  description: null,
  extras: { 'harvest:source_id': 'population-communes-2025' },
  metrics: { views: 0 },
  harvest: null,
  geopf: null,
  filesize: 12384,
  filetype: 'file',
  format: 'csv',
  mime: 'text/csv',
  internal: {},
  last_modified: '2026-10-01T12:00:00+00:00',
  latest: 'https://www.data.gouv.fr/fr/datasets/r/demo-resource',
  preview_url: '',
  schema: null,
  url: 'https://files.example.org/territoires/population-par-commune-2025.csv',
}
</script>
