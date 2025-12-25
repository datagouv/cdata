<template>
  <div class="container mb-16">
    <br>
    <div class="flex flex-row gap-8">
      <!-- Left sidebar - Filters -->
      <aside class="flex flex-col gap-4 w-[320px] flex-shrink-0">
        <!-- Type Section -->
        <section>
          <h2 class="font-bold text-sm leading-6 text-gray-900 mb-2 uppercase">
            Types
          </h2>
          <div class="flex flex-col gap-2">
            <button
              v-for="objType in objectTypes"
              :key="objType.class"
              class="flex items-center gap-2 p-1 rounded hover:bg-gray-100 transition"
              :class="{ 'bg-gray-200': selectedType === objType.class }"
              @click="selectType(objType.class)"
            >
              <div class="flex items-center gap-2 flex-1">
                <span class="w-4 h-4">
                  <!-- Icon SVGs - you can customize based on objType.class -->
                  <svg
                    v-if="objType.class === 'datasets'"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33333 8.33333C3.33333 8.542 3.64067 8.90533 4.35333 9.262C5.276 9.72333 6.58467 10 8 10C9.41533 10 10.724 9.72333 11.6467 9.262C12.3593 8.90533 12.6667 8.542 12.6667 8.33333V6.886C11.5667 7.566 9.88467 8 8 8C6.11533 8 4.43333 7.56533 3.33333 6.886V8.33333ZM12.6667 10.2193C11.5667 10.8993 9.88467 11.3333 8 11.3333C6.11533 11.3333 4.43333 10.8987 3.33333 10.2193V11.6667C3.33333 11.8753 3.64067 12.2387 4.35333 12.5953C5.276 13.0567 6.58467 13.3333 8 13.3333C9.41533 13.3333 10.724 13.0567 11.6467 12.5953C12.3593 12.2387 12.6667 11.8753 12.6667 11.6667V10.2193ZM2 11.6667V5C2 3.34333 4.68667 2 8 2C11.3133 2 14 3.34333 14 5V11.6667C14 13.3233 11.3133 14.6667 8 14.6667C4.68667 14.6667 2 13.3233 2 11.6667ZM8 6.66667C9.41533 6.66667 10.724 6.39 11.6467 5.92867C12.3593 5.572 12.6667 5.20867 12.6667 5C12.6667 4.79133 12.3593 4.428 11.6467 4.07133C10.724 3.61 9.41533 3.33333 8 3.33333C6.58467 3.33333 5.276 3.61 4.35333 4.07133C3.64067 4.428 3.33333 4.79133 3.33333 5C3.33333 5.20867 3.64067 5.572 4.35333 5.92867C5.276 6.39 6.58467 6.66667 8 6.66667Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                  <svg
                    v-else-if="objType.class === 'dataservices'"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M7.33342 8.00044L2.61942 12.7144L1.67676 11.7718L5.44809 8.00044L1.67676 4.22911L2.61942 3.28711L7.33342 8.00044ZM7.33342 12.6671H14.0001V14.0004H7.33342V12.6671Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                  <svg
                    v-else-if="objType.class === 'reuses'"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.33333 2V12.6667H14V14H2V2H3.33333ZM13.5287 4.19533L14.4713 5.138L10.6667 8.94267L8.66667 6.94333L5.80467 9.80467L4.862 8.862L8.66667 5.05733L10.6667 7.05667L13.5287 4.19533Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                  <svg
                    v-else-if="objType.class === 'organizations'"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_3_3897)">
                      <path
                        d="M13.3337 4H15.3337V5.33333H14.667V12.6667H15.3337V14H0.666992V12.6667H1.33366V5.33333H0.666992V4H2.66699V2.66667C2.66699 2.48986 2.73723 2.32029 2.86225 2.19526C2.98728 2.07024 3.15685 2 3.33366 2H12.667C12.8438 2 13.0134 2.07024 13.1384 2.19526C13.2634 2.32029 13.3337 2.48986 13.3337 2.66667V4ZM13.3337 5.33333H2.66699V12.6667H4.66699V8H6.00033V12.6667H7.33366V8H8.66699V12.6667H10.0003V8H11.3337V12.6667H13.3337V5.33333ZM4.00033 3.33333V4H12.0003V3.33333H4.00033Z"
                        fill="#3A3A3A"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_3_3897">
                        <rect
                          width="16"
                          height="16"
                          fill="white"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                  <svg
                    v-else-if="objType.class === 'discussions'"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M14.6666 4.06871C15.0348 4.06871 15.3333 4.36718 15.3333 4.73537V12C15.3333 12.3682 15.0348 12.6667 14.6666 12.6667H11.2L9.33329 15L7.46663 12.6667H3.99996C3.63177 12.6667 3.33329 12.3682 3.33329 12V4.73537C3.33329 4.36718 3.63177 4.06871 3.99996 4.06871H14.6666ZM14 5.40204H4.66663V11.3334H8.10729L9.33329 12.8654L10.5593 11.3334H14V5.40204ZM12.6666 1.33337V2.66671H1.99996V10H0.666626V2.00004C0.666626 1.63185 0.965103 1.33337 1.33329 1.33337H12.6666Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                  <svg
                    v-else-if="objType.class === 'posts'"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M13.3333 1.33331C13.7015 1.33331 14 1.63179 14 1.99998V14C14 14.3682 13.7015 14.6666 13.3333 14.6666H2.66667C2.29848 14.6666 2 14.3682 2 14V1.99998C2 1.63179 2.29848 1.33331 2.66667 1.33331H13.3333ZM12.6667 2.66665H3.33333V13.3333H12.6667V2.66665ZM11.3333 10.6666V12H4.66667V10.6666H11.3333ZM11.3333 7.99998V9.33331H4.66667V7.99998H11.3333ZM7.33333 3.99998V6.66665H4.66667V3.99998H7.33333ZM11.3333 4.66665V5.99998H8.66667V4.66665H11.3333Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                  <svg
                    v-else-if="objType.class === 'topics'"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 2H8V8H2V2ZM3.33333 3.33333V6.66667H6.66667V3.33333H3.33333ZM9.33333 2H14V4.66667H9.33333V2ZM10.6667 3.33333V3.33333H12.6667V3.33333H10.6667ZM2 9.33333H8V14H2V9.33333ZM3.33333 10.6667V12.6667H6.66667V10.6667H3.33333ZM9.33333 6H14V8.66667H9.33333V6ZM10.6667 7.33333V8H12.6667V7.33333H10.6667ZM9.33333 10H14V14H9.33333V10ZM10.6667 11.3333V12.6667H12.6667V11.3333H10.6667Z"
                      fill="#3A3A3A"
                    />
                  </svg>
                </span>
                <span
                  class="text-sm"
                  :class="{ 'font-bold': objType.class === 'datasets' }"
                >{{ objType.className }}</span>
              </div>
              <span class="bg-gray-200 text-gray-600 text-xs font-bold px-1 py-0.5 rounded">
                {{ formatCount(counts[objType.class]) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Format de données Section -->
        <section v-if="hasBasicFilter('format_family')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Format de données
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.formatFamily === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('formatFamily', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Tous</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('format_family', 'all')) }}
              </span>
            </button>

            <button
              :class="filters.formatFamily === 'tabular' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-1 py-1 px-1.5 rounded"
              @click="selectFilter('formatFamily', 'tabular')"
            >
              <span class="text-xs font-medium text-left">Tabulaires</span>
              <span
                class="text-xs"
                :class="filters.formatFamily === 'tabular' ? 'text-white/70' : 'text-gray-400'"
              >(csv, xls, xlsx, ods, parquet...)</span>
              <span class="flex-1" />
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('format_family', 'tabular')) }}
              </span>
            </button>

            <button
              :class="filters.formatFamily === 'machine_readable' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-1 py-1 px-1.5 rounded"
              @click="selectFilter('formatFamily', 'machine_readable')"
            >
              <span class="text-xs font-medium text-left">Structurées</span>
              <span
                class="text-xs"
                :class="filters.formatFamily === 'machine_readable' ? 'text-white/70' : 'text-gray-400'"
              >(json, rdf, xml, sql...)</span>
              <span class="flex-1" />
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('format_family', 'machine_readable')) }}
              </span>
            </button>

            <button
              :class="filters.formatFamily === 'geographical' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('formatFamily', 'geographical')"
            >
              <span class="text-xs font-medium text-left">Géographiques</span>
              <span
                class="text-xs"
                :class="filters.formatFamily === 'geographical' ? 'text-white/70' : 'text-gray-400'"
              >(geojson, shp, kml...)</span>
              <span class="flex-1" />
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('format_family', 'geographical')) }}
              </span>
            </button>

            <button
              :class="filters.formatFamily === 'documents' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('formatFamily', 'documents')"
            >
              <span class="text-xs font-medium text-left">Documents</span>
              <span
                class="text-xs"
                :class="filters.formatFamily === 'documents' ? 'text-white/70' : 'text-gray-400'"
              >(pdf, doc, docx, md, txt, html...)</span>
              <span class="flex-1" />
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('format_family', 'documents')) }}
              </span>
            </button>

            <button
              :class="filters.formatFamily === 'other' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('formatFamily', 'other')"
            >
              <span class="text-xs font-medium flex-1 text-left">Autre</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('format_family', 'other')) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Modalités d'accès Section -->
        <section v-if="hasBasicFilter('access_type')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Modalités d'accès
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.accessType === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('accessType', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Toutes</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('access_type', 'all')) }}
              </span>
            </button>

            <button
              :class="filters.accessType === 'open' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-1 py-1 px-1.5 rounded"
              @click="selectFilter('accessType', 'open')"
            >
              <span class="text-xs font-medium flex-1 text-left">Téléchargement libre</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('access_type', 'open')) }}
              </span>
            </button>

            <button
              :class="filters.accessType === 'open_with_constraint' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('accessType', 'open_with_constraint')"
            >
              <span class="text-xs font-medium flex-1 text-left">Ouvert sous condition</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('access_type', 'open_with_constraint')) }}
              </span>
            </button>

            <button
              :class="filters.accessType === 'restricted' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('accessType', 'restricted')"
            >
              <span class="text-xs font-medium flex-1 text-left">Accessible sous habilitation</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('access_type', 'restricted')) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Date de mise à jour Section -->
        <section v-if="hasBasicFilter('last_update_range')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Date de mise à jour
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.lastUpdate === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('lastUpdate', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Toutes</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('last_update', 'all')) }}
              </span>
            </button>

            <button
              :class="filters.lastUpdate === 'last_30_days' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-1 py-1 px-1.5 rounded"
              @click="selectFilter('lastUpdate', 'last_30_days')"
            >
              <span class="text-xs font-medium flex-1 text-left">Les 30 derniers jours</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('last_update', 'last_30_days')) }}
              </span>
            </button>

            <button
              :class="filters.lastUpdate === 'last_12_months' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('lastUpdate', 'last_12_months')"
            >
              <span class="text-xs font-medium flex-1 text-left">Les 12 derniers mois</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('last_update', 'last_12_months')) }}
              </span>
            </button>

            <button
              :class="filters.lastUpdate === 'last_3_years' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('lastUpdate', 'last_3_years')"
            >
              <span class="text-xs font-medium flex-1 text-left">Les 3 dernières années</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('last_update', 'last_3_years')) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Organisation Section -->
        <section v-if="hasBasicFilter('producer_type')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Type d'organisation
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.producerType === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('producerType', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Toutes</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('producer_type', 'all')) }}
              </span>
            </button>

            <button
              :class="filters.producerType === 'public-service' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('producerType', 'public-service')"
            >
              <span class="text-xs font-medium flex-1 text-left">Service public</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('producer_type', 'public-service')) }}
              </span>
            </button>

            <button
              :class="filters.producerType === 'local-authority' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('producerType', 'local-authority')"
            >
              <span class="text-xs font-medium flex-1 text-left">Collectivité territoriale</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('producer_type', 'local-authority')) }}
              </span>
            </button>

            <button
              :class="filters.producerType === 'company' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('producerType', 'company')"
            >
              <span class="text-xs font-medium flex-1 text-left">Entreprise</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('producer_type', 'company')) }}
              </span>
            </button>

            <button
              :class="filters.producerType === 'association' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('producerType', 'association')"
            >
              <span class="text-xs font-medium flex-1 text-left">Association</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('producer_type', 'association')) }}
              </span>
            </button>

            <button
              :class="filters.producerType === 'user' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('producerType', 'user')"
            >
              <span class="text-xs font-medium flex-1 text-left">Utilisateur</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('producer_type', 'user')) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Label de donnée Section -->
        <section v-if="hasBasicFilter('data_label')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Label de donnée
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.dataLabel === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('dataLabel', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Tous</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('badge', 'all')) }}
              </span>
            </button>

            <button
              :class="filters.dataLabel === 'hvd' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('dataLabel', 'hvd')"
            >
              <span class="text-xs font-medium flex-1 text-left">Données de forte valeur</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getBadgeFacetCount('hvd')) }}
              </span>
            </button>

            <button
              :class="filters.dataLabel === 'inspire' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('dataLabel', 'inspire')"
            >
              <span class="text-xs font-medium flex-1 text-left">INSPIRE</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getBadgeFacetCount('inspire')) }}
              </span>
            </button>

            <button
              :class="filters.dataLabel === 'spd' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('dataLabel', 'spd')"
            >
              <span class="text-xs font-medium flex-1 text-left">Service public de la donnée de référence</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getBadgeFacetCount('spd')) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Type de réutilisation Section -->
        <section v-if="hasBasicFilter('type')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Type de réutilisation
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.reuseType === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('reuseType', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Tous</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('type', 'all')) }}
              </span>
            </button>

            <button
              v-for="reuseType in getReuseTypeFacets()"
              :key="reuseType.name"
              :class="filters.reuseType === reuseType.name ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('reuseType', reuseType.name)"
            >
              <span class="text-xs font-medium flex-1 text-left">{{ getReuseTypeLabel(reuseType.name) }}</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(reuseType.count) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Thématiques Section -->
        <section v-if="hasBasicFilter('topic')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Thématiques
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.reuseTopic === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('reuseTopic', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Toutes</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('topic', 'all')) }}
              </span>
            </button>

            <button
              v-for="topic in displayedTopics"
              :key="topic.name"
              :class="filters.reuseTopic === topic.name ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('reuseTopic', topic.name)"
            >
              <span class="text-xs font-medium flex-1 text-left">{{ getTopicLabel(topic.name) }}</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(topic.count) }}
              </span>
            </button>

            <button
              v-if="getTopicFacets().length > 5"
              class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
              @click="showAllTopics = !showAllTopics"
            >
              {{ showAllTopics ? 'Voir moins' : `Voir plus (${getTopicFacets().length - 5})` }}
            </button>
          </div>
        </section>

        <!-- Type de discussions Section -->
        <section v-if="hasBasicFilter('object_type')">
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            Type de discussions
          </h2>
          <div class="flex flex-col gap-0">
            <button
              :class="filters.discussionObjectType === 'all' ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('discussionObjectType', 'all')"
            >
              <span class="text-xs font-bold flex-1 text-left">Tous</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(getFacetCount('object_type', 'all')) }}
              </span>
            </button>

            <button
              v-for="objTypeFilter in getObjectTypeFacets()"
              :key="objTypeFilter.name"
              :class="filters.discussionObjectType === objTypeFilter.name ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-1 px-1.5 rounded"
              @click="selectFilter('discussionObjectType', objTypeFilter.name)"
            >
              <span class="text-xs font-medium flex-1 text-left">{{ getObjectTypeLabel(objTypeFilter.name) }}</span>
              <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                {{ formatCount(objTypeFilter.count) }}
              </span>
            </button>
          </div>
        </section>

        <!-- Custom Tag Filters from config -->
        <section
          v-for="tagFilter in activeTagFilters"
          :key="tagFilter.name"
          class="mt-4"
        >
          <h2 class="font-bold text-sm text-gray-900 mb-2">
            {{ tagFilter.name }}
          </h2>
          <!-- Select type (dropdown) -->
          <div
            v-if="tagFilter.type === 'select'"
            class="fr-select-group mb-2"
          >
            <select
              v-model="selectedTagFilters[tagFilter.name]"
              class="fr-select !shadow-input-blue"
              @change="applyFilters()"
            >
              <option value="">
                Tous
              </option>
              <option
                v-for="value in tagFilter.values"
                :key="value.id"
                :value="value.id"
              >
                {{ value.name }}
              </option>
            </select>
          </div>
          <!-- List type (multiple selection buttons) -->
          <div
            v-else-if="tagFilter.type === 'list'"
            class="flex flex-col gap-1"
          >
            <button
              v-for="value in tagFilter.values"
              :key="value.id"
              :class="isTagFilterSelected(tagFilter.name, value.id) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
              class="flex items-center gap-2 py-3 px-1.5 rounded"
              @click="toggleTagFilterValue(tagFilter.name, value.id)"
            >
              <span class="text-xs font-medium flex-1 text-left">{{ value.name }}</span>
            </button>
          </div>
        </section>

        <!-- Filtres avancés Section (Accordion) -->
        <section
          v-if="availableAdvancedFilters.length > 0"
          class="fr-accordion border-t border-gray-300 pt-4"
        >
          <h3 class="fr-accordion__title !mb-0">
            <button
              class="fr-accordion__btn !text-neutral-900 !text-sm !font-bold !pl-0 !bg-transparent hover:!bg-transparent focus:!bg-transparent active:!bg-transparent"
              :aria-expanded="showAdvancedFilters"
              @click="showAdvancedFilters = !showAdvancedFilters"
            >
              Filtres avancés
            </button>
          </h3>

          <div
            v-if="showAdvancedFilters"
            class="flex flex-col pt-4 pb-2"
          >
            <!-- Organisation -->
            <template v-if="hasAdvancedFilter('organization')">
              <h2 class="font-bold text-sm text-gray-900 mb-2">
                Organisation
              </h2>
              <div class="mb-2">
                <SearchableSelect
                  v-model="advancedFacets.organization"
                  :placeholder="'Toutes les organisations'"
                  :suggest="suggestOrganizations"
                  :get-option-id="(org: Organization) => org.id"
                  :display-value="(org: Organization) => org.name"
                  :multiple="false"
                >
                  <template #option="{ option }">
                    {{ option.name }}
                  </template>
                </SearchableSelect>
              </div>

              <!-- Top Organisations Section -->
              <div
                v-if="organizationFacets.length > 0"
                class="mb-6"
              >
                <div class="flex flex-col gap-1">
                  <button
                    v-for="org in displayedOrganizations"
                    :key="org.id"
                    :class="selectedOrganizationIds.includes(org.id) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
                    class="flex items-center gap-2 py-1 px-1.5 rounded"
                    @click="toggleOrganizationFilter(org.id)"
                  >
                    <span class="text-xs font-medium flex-1 text-left truncate">{{ org.name }}</span>
                    <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                      {{ formatCount(org.count) }}
                    </span>
                  </button>

                  <button
                    v-if="organizationFacets.length > 5"
                    class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
                    @click="showAllOrganizations = !showAllOrganizations"
                  >
                    {{ showAllOrganizations ? 'Voir moins' : `Voir plus (${organizationFacets.length - 5})` }}
                  </button>
                </div>
              </div>
              <div
                v-else
                class="mb-6"
              >
                <p class="text-xs text-gray-600 italic">
                  Aucune valeur remontée
                </p>
              </div>
            </template>

            <!-- Mots-clés (Tags) -->
            <template v-if="hasAdvancedFilter('tags')">
              <h2 class="font-bold text-sm text-gray-900 mb-2">
                Mots-clés
              </h2>
              <div class="mb-2">
                <SearchableSelect
                  v-model="advancedFacets.tag"
                  :placeholder="'Tous les mots clés'"
                  :suggest="suggestTags"
                  :allow-new-option="(query: string) => query.toLocaleLowerCase().replace(/ /g, '-')"
                  :get-option-id="(tag: string) => tag"
                  :display-value="(tag: string) => tag"
                  :multiple="false"
                >
                  <template #option="{ option }">
                    {{ option }}
                  </template>
                </SearchableSelect>
              </div>

              <!-- Top Tags Section -->
              <div
                v-if="tagFacets.length > 0"
                class="mb-6"
              >
                <div class="flex flex-col gap-1">
                  <button
                    v-for="tag in displayedTags"
                    :key="tag.name"
                    :class="selectedTags.includes(tag.name) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
                    class="flex items-center gap-2 py-1 px-1.5 rounded"
                    @click="toggleTagFilter(tag.name)"
                  >
                    <span class="text-xs font-medium flex-1 text-left truncate">{{ tag.name }}</span>
                    <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                      {{ formatCount(tag.count) }}
                    </span>
                  </button>

                  <button
                    v-if="tagFacets.length > 5"
                    class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
                    @click="showAllTags = !showAllTags"
                  >
                    {{ showAllTags ? 'Voir moins' : `Voir plus (${tagFacets.length - 5})` }}
                  </button>
                </div>
              </div>
              <div
                v-else
                class="mb-6"
              >
                <p class="text-xs text-gray-600 italic">
                  Aucune valeur remontée
                </p>
              </div>
            </template>

            <!-- Formats (Only for Datasets) -->
            <template v-if="hasAdvancedFilter('format')">
              <h2 class="font-bold text-sm text-gray-900 mb-2">
                Formats
              </h2>
              <div class="mb-2">
                <SearchableSelect
                  v-model="advancedFacets.format"
                  :placeholder="'Tous les formats'"
                  :options="allowedFormats ?? []"
                  :loading="loadingFormats"
                  :get-option-id="(format: string) => format"
                  :display-value="(format: string) => format"
                  :multiple="false"
                >
                  <template #option="{ option }">
                    {{ option }}
                  </template>
                </SearchableSelect>
              </div>

              <!-- Top Formats Section -->
              <div
                v-if="formatFacets.length > 0"
                class="mb-6"
              >
                <div class="flex flex-col gap-1">
                  <button
                    v-for="format in displayedFormats"
                    :key="format.name"
                    :class="selectedFormats.includes(format.name) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
                    class="flex items-center gap-2 py-1 px-1.5 rounded"
                    @click="toggleFormatFilter(format.name)"
                  >
                    <span class="text-xs font-medium flex-1 text-left truncate">{{ format.name }}</span>
                    <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                      {{ formatCount(format.count) }}
                    </span>
                  </button>

                  <button
                    v-if="formatFacets.length > 5"
                    class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
                    @click="showAllFormats = !showAllFormats"
                  >
                    {{ showAllFormats ? 'Voir moins' : `Voir plus (${formatFacets.length - 5})` }}
                  </button>
                </div>
              </div>
              <div
                v-else
                class="mb-6"
              >
                <p class="text-xs text-gray-600 italic">
                  Aucune valeur remontée
                </p>
              </div>
            </template>

            <!-- Licences (Only for Datasets) -->
            <template v-if="hasAdvancedFilter('license')">
              <h2 class="font-bold text-sm text-gray-900 mb-2">
                Licences
              </h2>
              <div class="mb-2">
                <SearchableSelect
                  v-model="advancedFacets.license"
                  :placeholder="'Toutes les licences'"
                  :options="licenses ?? []"
                  :loading="loadingLicenses"
                  :get-option-id="(license: License) => license.id"
                  :display-value="(license: License) => license.title"
                  :multiple="false"
                >
                  <template #option="{ option }">
                    {{ option.title }}
                  </template>
                </SearchableSelect>
              </div>

              <!-- Top Licenses Section -->
              <div
                v-if="licenseFacets.length > 0"
                class="mb-6"
              >
                <div class="flex flex-col gap-1">
                  <button
                    v-for="license in displayedLicenses"
                    :key="license.id"
                    :class="selectedLicenses.includes(license.id) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
                    class="flex items-center gap-2 py-1 px-1.5 rounded"
                    @click="toggleLicenseFilter(license.id)"
                  >
                    <span class="text-xs font-medium flex-1 text-left truncate">{{ license.name }}</span>
                    <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                      {{ formatCount(license.count) }}
                    </span>
                  </button>

                  <button
                    v-if="licenseFacets.length > 5"
                    class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
                    @click="showAllLicenses = !showAllLicenses"
                  >
                    {{ showAllLicenses ? 'Voir moins' : `Voir plus (${licenseFacets.length - 5})` }}
                  </button>
                </div>
              </div>
              <div
                v-else
                class="mb-6"
              >
                <p class="text-xs text-gray-600 italic">
                  Aucune valeur remontée
                </p>
              </div>
            </template>

            <!-- Schéma (Only for Datasets) -->
            <template v-if="hasAdvancedFilter('schema')">
              <h2 class="font-bold text-sm text-gray-900 mb-2">
                Schéma
              </h2>
              <div class="mb-2">
                <SearchableSelect
                  v-model="advancedFacets.schema"
                  :placeholder="'Tous les schémas'"
                  :options="schemas ?? []"
                  :loading="loadingSchemas"
                  :get-option-id="(schema: RegisteredSchema) => schema.name"
                  :display-value="(schema: RegisteredSchema) => schema.name"
                  :multiple="false"
                >
                  <template #option="{ option }">
                    {{ option.name }}
                  </template>
                </SearchableSelect>
              </div>

              <!-- Top Schemas Section -->
              <div
                v-if="schemaFacets.length > 0"
                class="mb-6"
              >
                <div class="flex flex-col gap-1">
                  <button
                    v-for="schema in displayedSchemas"
                    :key="schema.name"
                    :class="selectedSchemas.includes(schema.name) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
                    class="flex items-center gap-2 py-1 px-1.5 rounded"
                    @click="toggleSchemaFilter(schema.name)"
                  >
                    <span class="text-xs font-medium flex-1 text-left truncate">{{ schema.name }}</span>
                    <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                      {{ formatCount(schema.count) }}
                    </span>
                  </button>

                  <button
                    v-if="schemaFacets.length > 5"
                    class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
                    @click="showAllSchemas = !showAllSchemas"
                  >
                    {{ showAllSchemas ? 'Voir moins' : `Voir plus (${schemaFacets.length - 5})` }}
                  </button>
                </div>
              </div>
              <div
                v-else
                class="mb-6"
              >
                <p class="text-xs text-gray-600 italic">
                  Aucune valeur remontée
                </p>
              </div>
            </template>

            <!-- Couverture spatiale (Only for Datasets) -->
            <template v-if="hasAdvancedFilter('geozone')">
              <h2 class="font-bold text-sm text-gray-900 mb-2">
                Couverture spatiale
              </h2>
              <div class="mb-2">
                <SearchableSelect
                  v-model="advancedFacets.geozone"
                  :placeholder="'Toutes les couvertures'"
                  :suggest="suggestSpatialCoverages"
                  :get-option-id="(zone: SpatialZone) => zone.id"
                  :display-value="(zone: SpatialZone) => zone.name"
                  :multiple="false"
                >
                  <template #option="{ option }">
                    <div class="flex items-center justify-between flex-1">
                      <span>{{ option.name }}</span>
                      <code class="bg-gray-200 text-gray-600 px-1 py-0.5 text-xs ml-2">{{ option.code }}</code>
                    </div>
                  </template>
                </SearchableSelect>
              </div>

              <!-- Top Geozones Section -->
              <div
                v-if="geozoneFacets.length > 0"
                class="mb-6"
              >
                <div class="flex flex-col gap-1">
                  <button
                    v-for="geozone in displayedGeozones"
                    :key="geozone.id"
                    :class="selectedGeozones.includes(geozone.id) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
                    class="flex items-center gap-2 py-1 px-1.5 rounded"
                    @click="toggleGeozoneFilter(geozone.id)"
                  >
                    <span class="text-xs font-medium flex-1 text-left truncate">{{ geozone.name }}</span>
                    <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                      {{ formatCount(geozone.count) }}
                    </span>
                  </button>

                  <button
                    v-if="geozoneFacets.length > 5"
                    class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
                    @click="showAllGeozones = !showAllGeozones"
                  >
                    {{ showAllGeozones ? 'Voir moins' : `Voir plus (${geozoneFacets.length - 5})` }}
                  </button>
                </div>
              </div>
              <div
                v-else
                class="mb-6"
              >
                <p class="text-xs text-gray-600 italic">
                  Aucune valeur remontée
                </p>
              </div>
            </template>

            <!-- Granularité spatiale (Only for Datasets) -->
            <template v-if="hasAdvancedFilter('granularity')">
              <h2 class="font-bold text-sm text-gray-900 mb-2">
                Granularité spatiale
              </h2>
              <div class="mb-2">
                <SearchableSelect
                  v-model="advancedFacets.granularity"
                  :placeholder="'Toutes les granularités'"
                  :options="spatialGranularities ?? []"
                  :loading="loadingGranularities"
                  :get-option-id="(granularity: SpatialGranularity) => granularity.id"
                  :display-value="(granularity: SpatialGranularity) => granularity.name"
                  :multiple="false"
                >
                  <template #option="{ option }">
                    {{ option.name }}
                  </template>
                </SearchableSelect>
              </div>

              <!-- Top Granularities Section -->
              <div
                v-if="granularityFacets.length > 0"
                class="mb-6"
              >
                <div class="flex flex-col gap-1">
                  <button
                    v-for="granularity in displayedGranularities"
                    :key="granularity.id"
                    :class="selectedGranularities.includes(granularity.id) ? 'bg-[#000091] text-white' : 'hover:bg-gray-100'"
                    class="flex items-center gap-2 py-1 px-1.5 rounded"
                    @click="toggleGranularityFilter(granularity.id)"
                  >
                    <span class="text-xs font-medium flex-1 text-left truncate">{{ granularity.name }}</span>
                    <span class="bg-gray-200 text-gray-900 text-[10px] font-bold px-1 py-0.5 rounded">
                      {{ formatCount(granularity.count) }}
                    </span>
                  </button>

                  <button
                    v-if="granularityFacets.length > 5"
                    class="text-xs text-[#000091] hover:underline py-1 px-1.5 text-left font-medium"
                    @click="showAllGranularities = !showAllGranularities"
                  >
                    {{ showAllGranularities ? 'Voir moins' : `Voir plus (${granularityFacets.length - 5})` }}
                  </button>
                </div>
              </div>
              <div
                v-else
                class="mb-6"
              >
                <p class="text-xs text-gray-600 italic">
                  Aucune valeur remontée
                </p>
              </div>
            </template>
          </div>
        </section>
      </aside>

      <!-- Right side - Results -->
      <main class="flex flex-col gap-4 flex-1 min-w-0">
        <!-- Results header -->
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm text-gray-900 m-0">
            {{ totalResults }} résultats
          </p>

          <div class="flex items-center gap-2 flex-shrink-0">
            <label
              for="sort-search"
              class="text-sm m-0 whitespace-nowrap"
            >
              Trier par :
            </label>
            <select
              id="sort-search"
              v-model="sortBy"
              class="fr-select !shadow-input-blue min-w-[200px]"
              name="sort"
            >
              <option value="">
                Pertinence
              </option>
              <option value="-created">
                Date de création
              </option>
              <option
                v-if="selectedType === 'datasets' || selectedType === 'dataservices' || selectedType === 'topics'"
                value="-last_update"
              >
                Dernière mise à jour
              </option>
              <option
                v-if="selectedType !== 'discussions' && selectedType !== 'posts' && selectedType !== 'topics'"
                value="-followers"
              >
                Nombre d'abonnés
              </option>
              <option
                v-if="selectedType === 'datasets'"
                value="-reuses"
              >
                Nombre de réutilisations
              </option>
            </select>
          </div>
        </div>

        <!-- Results list -->
        <div class="flex flex-col gap-4">
          <div
            v-if="loading"
            class="text-center py-8"
          >
            <p class="text-gray-600">
              Chargement...
            </p>
          </div>

          <div
            v-else-if="currentResults.data && currentResults.data.length === 0"
            class="text-center py-8"
          >
            <p class="text-gray-600">
              Aucun résultat trouvé
            </p>
          </div>

          <template v-else>
            <template v-if="selectedType === 'datasets'">
              <DatasetCard
                v-for="dataset in currentResults.data"
                :key="dataset.id"
                :dataset="dataset"
                :dataset-url="`/datasets/${dataset.id}/`"
                :tag-into-badge="activeConfig?.cardConfig?.tagIntoBadge"
              />
            </template>

            <template v-else-if="selectedType === 'reuses'">
              <ReuseCard
                v-for="reuse in currentResults.data"
                :key="reuse.id"
                :reuse="reuse"
                :reuse-url="`/reuses/${reuse.id}/`"
                :search="true"
                :tag-into-badge="activeConfig?.cardConfig?.tagIntoBadge"
              />
            </template>

            <template v-else-if="selectedType === 'dataservices'">
              <DataserviceCard
                v-for="dataservice in currentResults.data"
                :key="dataservice.id"
                :dataservice="dataservice"
                :dataservice-url="`/dataservices/${dataservice.id}/`"
                :tag-into-badge="activeConfig?.cardConfig?.tagIntoBadge"
              />
            </template>

            <template v-else-if="selectedType === 'organizations'">
              <OrganizationCard
                v-for="organization in currentResults.data"
                :key="organization.id"
                :organization="organization"
                :organization-url="`/organizations/${organization.id}/`"
              />
            </template>

            <template v-else-if="selectedType === 'discussions'">
              <DiscussionCard
                v-for="discussion in currentResults.data"
                :key="discussion.id"
                :discussion="discussion"
                :discussion-url="getDiscussionUrl(discussion)"
              />
            </template>

            <template v-else-if="selectedType === 'posts'">
              <PostCard
                v-for="post in currentResults.data"
                :key="post.id"
                :post="post"
                :post-url="`http://dev.local:3000/posts/${post.id}/`"
                :search="true"
              />
            </template>

            <template v-else-if="selectedType === 'topics'">
              <TopicCard
                v-for="topic in currentResults.data"
                :key="topic.id"
                :topic="topic"
                :topic-url="`#`"
                :show-logo="true"
                :show-stats="activeConfig?.cardConfig?.showStats ?? true"
                :tag-into-badge="activeConfig?.cardConfig?.tagIntoBadge"
              />
            </template>
          </template>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="!loading && currentResults.data && currentResults.data.length > 0"
          :page="currentPage"
          :page-size="pageSize"
          :total-results="totalResults"
          @change="handlePageChange"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DatasetCard from './DatasetCard.vue'
import ReuseCard from './ReuseCard.vue'
import DataserviceCard from './DataserviceCard.vue'
import OrganizationCard from './OrganizationCard.vue'
import DiscussionCard from './DiscussionCard.vue'
import PostCard from './PostCard.vue'
import TopicCard from './TopicCard.vue'
import SearchableSelect from './SearchableSelect.vue'
import Pagination from './Pagination.vue'

const route = useRoute()
const router = useRouter()

/**
 * Configuration System for SearchGlobal Component
 *
 * The component can be configured via the `config` prop to customize:
 * - Available object types (datasets, reuses, etc.)
 * - Basic filters displayed in the main sidebar
 * - Advanced filters in the accordion section
 * - Custom tag filters with specific values
 * - Hidden filters applied to all queries (not visible in URL)
 * - Custom tag filters with specific values
 * - Card configuration for displaying tags as badges
 *
 * Example configuration:
 *
 * const config = [
 *   {
 *     className: "Jeux de données",
 *     class: "datasets",
 *     display: true,
 *     hiddenFilters: [
 *       { type: "topic", id: "health" },
 *       { type: "organization", id: "123abc" }
 *     ],
 *     basicFilters: ["format_family", "access_type", "last_update_range", "data_label"],
 *     advancedFilters: ["organization", "tags", "format", "license", "schema", "geozone", "granularity"],
 *     cardConfig: {
 *       tagIntoBadge: [
 *         {
 *           "name": "Le beau tag",
 *           "value": "association",
 *           "color": "#FF0000"
 *         },
 *       ]
 *     },
 *     tagFilters: [
 *       {
 *         name: "Métadonnée custom",
 *         values: [
 *           { id: "association", name: "Asso" },
 *           { id: "adresses", name: "Adressage" },
 *           { id: "hard", name: "Difficile" }
 *         ],
 *         type: "select"  // Display as dropdown selector, single selection
 *       },
 *       {
 *         name: "Thématique",
 *         values: [
 *           { id: "health", name: "Santé" },
 *           { id: "transport", name: "Transport" },
 *           { id: "environment", name: "Environnement" }
 *         ],
 *         type: "list"  // Display as vertical button list, multiple selection
 *       }
 *     ]
 *   },
 *   {
 *     className: "Cas d'usage",
 *     class: "topics",
 *     display: true,
 *     hiddenFilters: [
 *       { type: "organization", id: "456def" }
 *     ],
 *     basicFilters: ["last_update_range", "producer_type"],
 *     advancedFilters: ["organization", "tags"],
 *     tagFilters: [
 *       {
 *         name: "Facilité d'utilisation",
 *         values: [
 *           { id: "easy", name: "Facile" },
 *           { id: "medium", name: "Moyen" },
 *           { id: "hard", name: "Difficile" }
 *         ],
 *         type: "select"  // Display as dropdown selector, single selection
 *       },
 *       {
 *         name: "Thématique",
 *         values: [
 *           { id: "health", name: "Santé" },
 *           { id: "transport", name: "Transport" },
 *           { id: "environment", name: "Environnement" }
 *         ],
 *         type: "list"  // Display as vertical button list, multiple selection
 *       }
 *     ]
 *   }
 * ]
 *
 */

type Organization = {
  id: string
  name: string
  slug?: string
}

type License = {
  id: string
  title: string
}

type RegisteredSchema = {
  name: string
  label?: string
}

type SpatialZone = {
  id: string
  name: string
  code: string
}

type SpatialGranularity = {
  id: string
  name: string
}

type Tag = {
  text: string
}

type Facet = {
  name: string
  count: number
}

type Discussion = {
  id: string
  subject_class?: string
  subject_id?: string
  subject?: {
    class?: string
    id?: string
  }
}

type HiddenFilter = {
  type: string
  id: string
}

type TagFilterValue = {
  id: string
  name: string
}

type TagFilter = {
  name: string
  values: TagFilterValue[]
  type: 'select' | 'list'
}

type TagIntoBadge = {
  name: string
  value: string
  color: string
}

type CardConfig = {
  showStats?: boolean
  tagIntoBadge?: TagIntoBadge[]
}

type ObjectTypeConfig = {
  className: string
  class: 'datasets' | 'reuses' | 'organizations' | 'dataservices' | 'discussions' | 'posts' | 'topics'
  display: boolean
  hiddenFilters?: HiddenFilter[]
  basicFilters?: string[]
  advancedFilters?: string[]
  tagFilters?: TagFilter[]
  cardConfig?: CardConfig
}

const props = withDefaults(defineProps<{
  objectType?: 'datasets' | 'reuses' | 'organizations' | 'dataservices' | 'discussions' | 'posts' | 'topics'
  displayTopics?: boolean
  topicsLabel?: string
  displayDiscussions?: boolean
  discussionsLabel?: string
  displayPosts?: boolean
  postsLabel?: string
  config?: ObjectTypeConfig[]
}>(), {
  objectType: 'datasets',
  displayTopics: false,
  topicsLabel: 'Thématiques',
  displayDiscussions: false,
  discussionsLabel: 'Discussions',
  displayPosts: false,
  postsLabel: 'Articles',
  config: undefined,
})

const selectedType = ref<'datasets' | 'reuses' | 'organizations' | 'dataservices' | 'discussions' | 'posts' | 'topics'>(props.objectType)
const showAdvancedFilters = ref(false)
const showAllOrganizations = ref(false)
const selectedOrganizationIds = ref<string[]>([])
const showAllTags = ref(false)
const selectedTags = ref<string[]>([])
const showAllFormats = ref(false)
const selectedFormats = ref<string[]>([])
const showAllLicenses = ref(false)
const selectedLicenses = ref<string[]>([])
const showAllSchemas = ref(false)
const selectedSchemas = ref<string[]>([])
const showAllGeozones = ref(false)
const selectedGeozones = ref<string[]>([])
const showAllGranularities = ref(false)
const selectedGranularities = ref<string[]>([])
const showAllTopics = ref(false)
const sortBy = ref('')
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

const filters = ref({
  formatFamily: 'all' as string,
  accessType: 'all' as string,
  lastUpdate: 'all' as string,
  producerType: 'all' as string,
  reuseType: 'all' as string,
  reuseTopic: 'all' as string,
  dataLabel: 'all' as string,
  discussionObjectType: 'all' as string,
})

const advancedFacets = ref<{
  organization: Organization | null
  tag: string | null
  format: string | null
  license: License | null
  schema: RegisteredSchema | null
  geozone: SpatialZone | null
  granularity: SpatialGranularity | null
}>({
  organization: null,
  tag: null,
  format: null,
  license: null,
  schema: null,
  geozone: null,
  granularity: null,
})

const allowedFormats = ref<string[]>([])
const loadingFormats = ref(false)

const licenses = ref<License[]>([])
const loadingLicenses = ref(false)

const schemas = ref<RegisteredSchema[]>([])
const loadingSchemas = ref(false)

const spatialGranularities = ref<SpatialGranularity[]>([])
const loadingGranularities = ref(false)

type SearchResultItem = {
  data: unknown[]
  total: number
  facets: Record<string, Facet[]>
}

const searchResults = ref<Record<string, SearchResultItem>>({
  datasets: { data: [], total: 0, facets: {} },
  reuses: { data: [], total: 0, facets: {} },
  dataservices: { data: [], total: 0, facets: {} },
  organizations: { data: [], total: 0, facets: {} },
  discussions: { data: [], total: 0, facets: {} },
  posts: { data: [], total: 0, facets: {} },
  topics: { data: [], total: 0, facets: {} },
})

const selectedTagFilters = ref<Record<string, string | string[]>>({})

const objectTypes = computed(() => {
  if (props.config && props.config.length > 0) {
    return props.config.filter(c => c.display)
  }
  const defaults: ObjectTypeConfig[] = [
    { className: 'Jeux de données', class: 'datasets', display: true },
    { className: 'Services de données', class: 'dataservices', display: true },
    { className: 'Réutilisations', class: 'reuses', display: true },
    { className: 'Organisations', class: 'organizations', display: true },
  ]
  if (props.displayDiscussions) {
    defaults.push({ className: props.discussionsLabel, class: 'discussions', display: true })
  }
  if (props.displayPosts) {
    defaults.push({ className: props.postsLabel, class: 'posts', display: true })
  }
  if (props.displayTopics) {
    defaults.push({ className: props.topicsLabel, class: 'topics', display: true })
  }
  return defaults
})

const activeConfig = computed(() => {
  return objectTypes.value.find(t => t.class === selectedType.value)
})

const availableBasicFilters = computed(() => {
  if (!activeConfig.value || !activeConfig.value.basicFilters) {
    if (selectedType.value === 'datasets' || selectedType.value === 'dataservices') {
      return ['format_family', 'access_type', 'last_update_range', 'data_label']
    }
    else if (selectedType.value === 'reuses') {
      return ['type', 'topic']
    }
    else if (selectedType.value === 'organizations' || selectedType.value === 'topics') {
      return ['producer_type']
    }
    else if (selectedType.value === 'discussions') {
      return ['object_type', 'last_update_range']
    }
    else if (selectedType.value === 'posts') {
      return ['last_update_range']
    }
    return []
  }
  return activeConfig.value.basicFilters
})

const availableAdvancedFilters = computed(() => {
  if (!activeConfig.value || !activeConfig.value.advancedFilters) {
    if (selectedType.value === 'datasets' || selectedType.value === 'dataservices') {
      return ['organization', 'tags', 'format', 'license', 'schema', 'geozone', 'granularity']
    }
    else if (selectedType.value === 'reuses') {
      return ['organization', 'tags']
    }
    else if (selectedType.value === 'topics') {
      return ['organization', 'tags']
    }
    return []
  }
  return activeConfig.value.advancedFilters
})

const activeTagFilters = computed(() => {
  return activeConfig.value?.tagFilters || []
})

const hiddenFilters = computed(() => {
  return activeConfig.value?.hiddenFilters || []
})

function hasBasicFilter(filterName: string): boolean {
  return availableBasicFilters.value.includes(filterName)
}

function hasAdvancedFilter(filterName: string): boolean {
  return availableAdvancedFilters.value.includes(filterName)
}

const counts = computed(() => ({
  datasets: searchResults.value.datasets.total || 0,
  dataservices: searchResults.value.dataservices.total || 0,
  reuses: searchResults.value.reuses.total || 0,
  organizations: searchResults.value.organizations.total || 0,
  discussions: searchResults.value.discussions.total || 0,
  posts: searchResults.value.posts.total || 0,
  topics: searchResults.value.topics.total || 0,
}))

const currentResults = computed(() => {
  return searchResults.value[selectedType.value]
})

const totalResults = computed(() => {
  return counts.value[selectedType.value]
})

const currentFacets = computed(() => {
  return currentResults.value.facets || {}
})

const organizationFacets = computed(() => {
  const facets = currentFacets.value.organization_id_with_name
  if (!facets || !Array.isArray(facets)) return []

  return facets
    .filter((f: Facet) => f.name !== 'all' && f.name.includes('|'))
    .map((f: Facet) => {
      const [id, name] = f.name.split('|')
      return {
        id,
        name,
        count: f.count,
      }
    })
})

const displayedOrganizations = computed(() => {
  const allOrganizations = [...organizationFacets.value]
  const facetIds = organizationFacets.value.map(f => f.id)

  selectedOrganizationIds.value.forEach((orgId) => {
    if (!facetIds.includes(orgId)) {
      allOrganizations.push({ id: orgId, name: orgId, count: 0 })
    }
  })

  const sorted = allOrganizations.sort((a, b) => {
    const aSelected = selectedOrganizationIds.value.includes(a.id)
    const bSelected = selectedOrganizationIds.value.includes(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  if (showAllOrganizations.value) {
    return sorted
  }
  return sorted.slice(0, 5)
})

const tagFacets = computed(() => {
  const facets = currentFacets.value.tag
  if (!facets || !Array.isArray(facets)) return []

  return facets
    .filter((f: Facet) => f.name !== 'all')
    .map((f: Facet) => ({
      name: f.name,
      count: f.count,
    }))
})

const displayedTags = computed(() => {
  const allTags = [...tagFacets.value]
  const facetNames = tagFacets.value.map(f => f.name)

  selectedTags.value.forEach((tagName) => {
    if (!facetNames.includes(tagName)) {
      allTags.push({ name: tagName, count: 0 })
    }
  })

  const sorted = allTags.sort((a, b) => {
    const aSelected = selectedTags.value.includes(a.name)
    const bSelected = selectedTags.value.includes(b.name)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  if (showAllTags.value) {
    return sorted
  }
  return sorted.slice(0, 5)
})

const formatFacets = computed(() => {
  const facets = currentFacets.value.format
  if (!facets || !Array.isArray(facets)) return []

  return facets
    .filter((f: Facet) => f.name !== 'all')
    .map((f: Facet) => ({
      name: f.name,
      count: f.count,
    }))
})

const displayedFormats = computed(() => {
  const allFormats = [...formatFacets.value]
  const facetNames = formatFacets.value.map(f => f.name)

  selectedFormats.value.forEach((formatName) => {
    if (!facetNames.includes(formatName)) {
      allFormats.push({ name: formatName, count: 0 })
    }
  })

  const sorted = allFormats.sort((a, b) => {
    const aSelected = selectedFormats.value.includes(a.name)
    const bSelected = selectedFormats.value.includes(b.name)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  if (showAllFormats.value) {
    return sorted
  }
  return sorted.slice(0, 5)
})

const licenseFacets = computed(() => {
  const facets = currentFacets.value.license
  if (!facets || !Array.isArray(facets)) return []

  return facets
    .filter((f: Facet) => f.name !== 'all')
    .map((f: Facet) => ({
      id: f.name,
      name: f.name,
      count: f.count,
    }))
})

const displayedLicenses = computed(() => {
  const allLicenses = [...licenseFacets.value]
  const facetIds = licenseFacets.value.map(f => f.id)

  selectedLicenses.value.forEach((licenseId) => {
    if (!facetIds.includes(licenseId)) {
      allLicenses.push({ id: licenseId, name: licenseId, count: 0 })
    }
  })

  const sorted = allLicenses.sort((a, b) => {
    const aSelected = selectedLicenses.value.includes(a.id)
    const bSelected = selectedLicenses.value.includes(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  if (showAllLicenses.value) {
    return sorted
  }
  return sorted.slice(0, 5)
})

const schemaFacets = computed(() => {
  const facets = currentFacets.value.schema
  if (!facets || !Array.isArray(facets)) return []

  return facets
    .filter((f: Facet) => f.name !== 'all')
    .map((f: Facet) => ({
      name: f.name,
      count: f.count,
    }))
})

const displayedSchemas = computed(() => {
  const allSchemas = [...schemaFacets.value]
  const facetNames = schemaFacets.value.map(f => f.name)

  selectedSchemas.value.forEach((schemaName) => {
    if (!facetNames.includes(schemaName)) {
      allSchemas.push({ name: schemaName, count: 0 })
    }
  })

  const sorted = allSchemas.sort((a, b) => {
    const aSelected = selectedSchemas.value.includes(a.name)
    const bSelected = selectedSchemas.value.includes(b.name)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  if (showAllSchemas.value) {
    return sorted
  }
  return sorted.slice(0, 5)
})

const geozoneFacets = computed(() => {
  const facets = currentFacets.value.geozone
  if (!facets || !Array.isArray(facets)) return []

  return facets
    .filter((f: Facet) => f.name !== 'all')
    .map((f: Facet) => ({
      id: f.name,
      name: f.name,
      count: f.count,
    }))
})

const displayedGeozones = computed(() => {
  const allGeozones = [...geozoneFacets.value]
  const facetIds = geozoneFacets.value.map(f => f.id)

  selectedGeozones.value.forEach((geozoneId) => {
    if (!facetIds.includes(geozoneId)) {
      allGeozones.push({ id: geozoneId, name: geozoneId, count: 0 })
    }
  })

  const sorted = allGeozones.sort((a, b) => {
    const aSelected = selectedGeozones.value.includes(a.id)
    const bSelected = selectedGeozones.value.includes(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  if (showAllGeozones.value) {
    return sorted
  }
  return sorted.slice(0, 5)
})

const granularityFacets = computed(() => {
  const facets = currentFacets.value.granularity
  if (!facets || !Array.isArray(facets)) return []

  return facets
    .filter((f: Facet) => f.name !== 'all')
    .map((f: Facet) => ({
      id: f.name,
      name: f.name,
      count: f.count,
    }))
})

const displayedGranularities = computed(() => {
  const allGranularities = [...granularityFacets.value]
  const facetIds = granularityFacets.value.map(f => f.id)

  selectedGranularities.value.forEach((granularityId) => {
    if (!facetIds.includes(granularityId)) {
      allGranularities.push({ id: granularityId, name: granularityId, count: 0 })
    }
  })

  const sorted = allGranularities.sort((a, b) => {
    const aSelected = selectedGranularities.value.includes(a.id)
    const bSelected = selectedGranularities.value.includes(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })

  if (showAllGranularities.value) {
    return sorted
  }
  return sorted.slice(0, 5)
})

function formatCount(count: number): string {
  if (count >= 1000) {
    return `${Math.round(count / 1000)}k`
  }
  return count.toString()
}

function isTagFilterSelected(filterName: string, value: string): boolean {
  const filterValue = selectedTagFilters.value[filterName]
  if (Array.isArray(filterValue)) {
    return filterValue.includes(value)
  }
  return false
}

function toggleTagFilterValue(filterName: string, value: string) {
  const currentValue = selectedTagFilters.value[filterName]

  if (!currentValue || !Array.isArray(currentValue)) {
    selectedTagFilters.value[filterName] = [value]
  }
  else if (currentValue.includes(value)) {
    const index = currentValue.indexOf(value)
    currentValue.splice(index, 1)
  }
  else {
    currentValue.push(value)
  }

  applyFilters()
}

const reuseTypeLabels: Record<string, string> = {
  application: 'Application',
  visualization: 'Visualisation',
  news_article: 'Article de presse',
  paper: 'Article scientifique',
  api: 'API',
  post: 'Article de blog',
  hardware: 'Objet connecté',
  idea: 'Idée',
}

const topicLabels: Record<string, string> = {
  health: 'Santé',
  transport_and_mobility: 'Transport et mobilité',
  housing_and_development: 'Logement et développement',
  food_and_agriculture: 'Alimentation et agriculture',
  culture_and_recreation: 'Culture et loisirs',
  economy_and_business: 'Économie et entreprises',
  environment_and_energy: 'Environnement et énergie',
  work_and_training: 'Travail et formation',
  politics_and_public_life: 'Politique et vie publique',
  safety_and_security: 'Sûreté et sécurité',
  education_and_research: 'Éducation et recherche',
  society_and_demography: 'Société et démographie',
  law_and_justice: 'Droit et justice',
  open_data_tools: 'Outils open data',
  others: 'Autres',
}

function getReuseTypeLabel(type: string): string {
  return reuseTypeLabels[type] || type
}

function getTopicLabel(topic: string): string {
  return topicLabels[topic] || topic
}

function getFacetCount(facetName: string, value: string): number {
  let actualFacetName = facetName
  if (facetName === 'topic' && selectedType.value === 'reuses') {
    actualFacetName = 'topic_object'
  }

  const facets = currentFacets.value[actualFacetName]
  if (!facets) return 0
  const item = facets.find((f: Facet) => f.name === value)
  return item ? item.count : 0
}

function getBadgeFacetCount(badgeName: string): number {
  const facets = currentFacets.value.badge
  if (!facets || !Array.isArray(facets)) return 0
  const item = facets.find((f: Facet) => f.name === badgeName)
  return item ? item.count : 0
}

function getReuseTypeFacets(): Array<{ name: string, count: number }> {
  const facets = currentFacets.value.type
  if (!facets || !Array.isArray(facets)) return []
  return facets.filter((f: Facet) => f.name !== 'all')
}

function getTopicFacets(): Array<{ name: string, count: number }> {
  const facetKey = selectedType.value === 'reuses' ? 'topic_object' : 'topic'
  const facets = currentFacets.value[facetKey]
  if (!facets || !Array.isArray(facets)) return []
  return facets.filter((f: Facet) => f.name !== 'all')
}

function getObjectTypeFacets(): Array<{ name: string, count: number }> {
  const facets = currentFacets.value.object_type
  if (!facets || !Array.isArray(facets)) return []
  return facets.filter((f: Facet) => f.name !== 'all')
}

const objectTypeLabels: Record<string, string> = {
  Dataset: 'Jeux de données',
  Reuse: 'Réutilisations',
  Dataservice: 'API',
  Organization: 'Organisations',
}

function getObjectTypeLabel(objectType: string): string {
  return objectTypeLabels[objectType] || objectType
}

const displayedTopics = computed(() => {
  const topics = getTopicFacets()
  if (showAllTopics.value) {
    return topics
  }
  return topics.slice(0, 5)
})

async function fetchSearchResults(type: string, params: Record<string, string | string[]> = {}, page: number = 1, includeHiddenFilters: boolean = true) {
  try {
    const queryParams = new URLSearchParams()

    if (searchQuery.value) {
      queryParams.append('q', searchQuery.value)
    }

    queryParams.append('page', page.toString())
    queryParams.append('page_size', pageSize.value.toString())

    if (includeHiddenFilters) {
      hiddenFilters.value.forEach((filter) => {
        if (filter.type && filter.id) {
          let paramName = filter.type
          if (filter.type === 'tag') {
            paramName = 'tag'
          }
          else if (filter.type === 'organization') {
            paramName = 'organization'
          }
          else if (filter.type === 'topic' && type === 'reuses') {
            paramName = 'topic_object'
          }
          queryParams.append(paramName, filter.id)
        }
      })
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v))
        }
        else {
          queryParams.append(key, value)
        }
      }
    })

    const url = `http://dev.local:7000/api/2/${type}/search/?${queryParams.toString()}`
    const response = await fetch(url)
    const data = await response.json()
    return data
  }
  catch (error) {
    console.error(`Error fetching ${type}:`, error)
    return { data: [], total: 0, facets: {} }
  }
}

async function loadAllResults() {
  loading.value = true
  try {
    const promises = [
      fetchSearchResults('datasets'),
      fetchSearchResults('reuses'),
      fetchSearchResults('dataservices'),
      fetchSearchResults('organizations'),
    ]

    let discussionsIndex = -1
    let postsIndex = -1
    let topicsIndex = -1

    if (props.displayDiscussions) {
      discussionsIndex = promises.length
      promises.push(fetchSearchResults('discussions'))
    }

    if (props.displayPosts) {
      postsIndex = promises.length
      promises.push(fetchSearchResults('posts'))
    }

    if (props.displayTopics) {
      topicsIndex = promises.length
      promises.push(fetchSearchResults('topics'))
    }

    const results = await Promise.all(promises)

    searchResults.value = {
      datasets: results[0],
      reuses: results[1],
      dataservices: results[2],
      organizations: results[3],
      discussions: discussionsIndex >= 0 ? results[discussionsIndex] : { data: [], total: 0, facets: {} },
      posts: postsIndex >= 0 ? results[postsIndex] : { data: [], total: 0, facets: {} },
      topics: topicsIndex >= 0 ? results[topicsIndex] : { data: [], total: 0, facets: {} },
    }
  }
  finally {
    loading.value = false
  }
}

async function loadMetadata() {
  loadingFormats.value = true
  try {
    const response = await fetch('http://dev.local:7000/api/1/datasets/extensions/')
    allowedFormats.value = await response.json()
  }
  catch (error) {
    console.error('Error loading formats:', error)
  }
  finally {
    loadingFormats.value = false
  }

  loadingLicenses.value = true
  try {
    const response = await fetch('http://dev.local:7000/api/1/datasets/licenses/')
    licenses.value = await response.json()
  }
  catch (error) {
    console.error('Error loading licenses:', error)
  }
  finally {
    loadingLicenses.value = false
  }

  loadingSchemas.value = true
  try {
    const response = await fetch('http://dev.local:7000/api/1/datasets/schemas/')
    schemas.value = await response.json()
  }
  catch (error) {
    console.error('Error loading schemas:', error)
  }
  finally {
    loadingSchemas.value = false
  }

  loadingGranularities.value = true
  try {
    const response = await fetch('http://dev.local:7000/api/1/spatial/granularities/')
    spatialGranularities.value = await response.json()
  }
  catch (error) {
    console.error('Error loading granularities:', error)
  }
  finally {
    loadingGranularities.value = false
  }
}

async function suggestOrganizations(query: string): Promise<Organization[]> {
  try {
    const response = await fetch(`http://dev.local:7000/api/1/organizations/suggest/?q=${encodeURIComponent(query)}&size=20`)
    return await response.json()
  }
  catch (error) {
    console.error('Error suggesting organizations:', error)
    return []
  }
}

async function suggestTags(query: string): Promise<string[]> {
  try {
    const response = await fetch(`http://dev.local:7000/api/1/tags/suggest/?q=${encodeURIComponent(query)}&size=20`)
    const tags: Tag[] = await response.json()
    return tags.map(tag => tag.text)
  }
  catch (error) {
    console.error('Error suggesting tags:', error)
    return []
  }
}

async function suggestSpatialCoverages(query: string): Promise<SpatialZone[]> {
  try {
    const response = await fetch(`http://dev.local:7000/api/1/spatial/zones/suggest/?q=${encodeURIComponent(query)}&size=20`)
    return await response.json()
  }
  catch (error) {
    console.error('Error suggesting spatial coverages:', error)
    return []
  }
}

function updateUrlFromFilters() {
  const query: Record<string, string | number> = {}

  if (searchQuery.value) {
    query.q = searchQuery.value
  }

  if (selectedType.value !== props.objectType) {
    query.type = selectedType.value
  }

  if (currentPage.value > 1) {
    query.page = currentPage.value.toString()
  }

  if (sortBy.value) {
    query.sort = sortBy.value
  }

  if (filters.value.formatFamily !== 'all') {
    query.format_family = filters.value.formatFamily
  }
  if (filters.value.accessType !== 'all') {
    query.access_type = filters.value.accessType
  }
  if (filters.value.lastUpdate !== 'all') {
    query.last_update_range = filters.value.lastUpdate
  }
  if (filters.value.producerType !== 'all') {
    query.producer_type = filters.value.producerType
  }
  if (filters.value.reuseType !== 'all') {
    query.reuse_type = filters.value.reuseType
  }
  if (filters.value.reuseTopic !== 'all') {
    query.reuse_topic = filters.value.reuseTopic
  }
  if (filters.value.dataLabel !== 'all') {
    query.badge = filters.value.dataLabel
  }
  if (filters.value.discussionObjectType !== 'all') {
    query.object_type = filters.value.discussionObjectType
  }

  if (selectedOrganizationIds.value.length > 0) {
    query.organization = selectedOrganizationIds.value.join(',')
  }
  if (selectedTags.value.length > 0) {
    query.tag = selectedTags.value.join(',')
  }
  if (selectedFormats.value.length > 0) {
    query.format = selectedFormats.value.join(',')
  }
  if (selectedLicenses.value.length > 0) {
    query.license = selectedLicenses.value.join(',')
  }
  if (selectedSchemas.value.length > 0) {
    query.schema = selectedSchemas.value.join(',')
  }
  if (selectedGeozones.value.length > 0) {
    query.geozone = selectedGeozones.value.join(',')
  }
  if (selectedGranularities.value.length > 0) {
    query.granularity = selectedGranularities.value.join(',')
  }

  router.replace({ query })
}

async function applyFilters() {
  loading.value = true
  updateUrlFromFilters()
  try {
    const params: Record<string, string | string[]> = {}

    if (filters.value.formatFamily !== 'all') {
      params.format_family = filters.value.formatFamily
    }
    if (filters.value.accessType !== 'all') {
      params.access_type = filters.value.accessType
    }
    if (filters.value.lastUpdate !== 'all') {
      params.last_update_range = filters.value.lastUpdate
    }
    if (filters.value.producerType !== 'all') {
      params.producer_type = filters.value.producerType
    }
    if (filters.value.reuseType !== 'all') {
      params.type = filters.value.reuseType
    }
    if (filters.value.reuseTopic !== 'all') {
      params.topic_object = filters.value.reuseTopic
    }
    if (filters.value.dataLabel !== 'all') {
      params.badge = filters.value.dataLabel
    }
    if (filters.value.discussionObjectType !== 'all') {
      params.object_type = filters.value.discussionObjectType
    }

    if (selectedOrganizationIds.value.length > 0) {
      params.organization = selectedOrganizationIds.value
    }

    else if (advancedFacets.value.organization) {
      params.organization = advancedFacets.value.organization.id
    }

    if (selectedTags.value.length > 0) {
      params.tag = selectedTags.value
    }
    else if (advancedFacets.value.tag) {
      params.tag = advancedFacets.value.tag
    }

    if (selectedFormats.value.length > 0) {
      params.format = selectedFormats.value
    }
    else if (advancedFacets.value.format) {
      params.format = advancedFacets.value.format
    }

    if (selectedLicenses.value.length > 0) {
      params.license = selectedLicenses.value
    }
    else if (advancedFacets.value.license) {
      params.license = advancedFacets.value.license.id
    }

    if (selectedSchemas.value.length > 0) {
      params.schema = selectedSchemas.value
    }
    else if (advancedFacets.value.schema) {
      params.schema = advancedFacets.value.schema.name
    }

    if (selectedGeozones.value.length > 0) {
      params.geozone = selectedGeozones.value
    }
    else if (advancedFacets.value.geozone) {
      params.geozone = advancedFacets.value.geozone.id
    }

    if (selectedGranularities.value.length > 0) {
      params.granularity = selectedGranularities.value
    }
    else if (advancedFacets.value.granularity) {
      params.granularity = advancedFacets.value.granularity.id
    }

    Object.entries(selectedTagFilters.value).forEach(([_filterName, filterValue]) => {
      if (!filterValue) return

      if (Array.isArray(filterValue)) {
        if (filterValue.length > 0) {
          filterValue.forEach((value) => {
            if (value && value !== 'all' && value !== '') {
              // Add as tag parameter
              if (params.tag) {
                if (Array.isArray(params.tag)) {
                  params.tag.push(value)
                }
                else {
                  params.tag = [params.tag, value]
                }
              }
              else {
                params.tag = value
              }
            }
          })
        }
      }
      else if (filterValue !== 'all' && filterValue !== '') {
        if (params.tag) {
          if (Array.isArray(params.tag)) {
            params.tag.push(filterValue)
          }
          else {
            params.tag = [params.tag, filterValue]
          }
        }
        else {
          params.tag = filterValue
        }
      }
    })

    if (sortBy.value) {
      params.sort = sortBy.value
    }

    const result = await fetchSearchResults(selectedType.value, params, currentPage.value)
    searchResults.value[selectedType.value] = result
  }
  finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  applyFilters()
}

function selectFilter(filterType: string, value: string) {
  (filters.value as Record<string, string>)[filterType] = value
  currentPage.value = 1
  applyFilters()
}

function selectType(type: 'datasets' | 'reuses' | 'organizations' | 'dataservices' | 'discussions' | 'posts' | 'topics') {
  selectedType.value = type
  filters.value.formatFamily = 'all'
  filters.value.accessType = 'all'
  filters.value.reuseType = 'all'
  filters.value.reuseTopic = 'all'
  filters.value.dataLabel = 'all'
  selectedTagFilters.value = {}
  applyFilters()
}

function toggleOrganizationFilter(organizationId: string) {
  const index = selectedOrganizationIds.value.indexOf(organizationId)
  if (index > -1) {
    selectedOrganizationIds.value.splice(index, 1)
  }
  else {
    selectedOrganizationIds.value.push(organizationId)
  }
  currentPage.value = 1
  applyFilters()
}

function toggleTagFilter(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
  else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1
  applyFilters()
}

function toggleFormatFilter(format: string) {
  const index = selectedFormats.value.indexOf(format)
  if (index > -1) {
    selectedFormats.value.splice(index, 1)
  }
  else {
    selectedFormats.value.push(format)
  }
  currentPage.value = 1
  applyFilters()
}

function toggleLicenseFilter(licenseId: string) {
  const index = selectedLicenses.value.indexOf(licenseId)
  if (index > -1) {
    selectedLicenses.value.splice(index, 1)
  }
  else {
    selectedLicenses.value.push(licenseId)
  }
  currentPage.value = 1
  applyFilters()
}

function toggleSchemaFilter(schema: string) {
  const index = selectedSchemas.value.indexOf(schema)
  if (index > -1) {
    selectedSchemas.value.splice(index, 1)
  }
  else {
    selectedSchemas.value.push(schema)
  }
  currentPage.value = 1
  applyFilters()
}

function toggleGeozoneFilter(geozoneId: string) {
  const index = selectedGeozones.value.indexOf(geozoneId)
  if (index > -1) {
    selectedGeozones.value.splice(index, 1)
  }
  else {
    selectedGeozones.value.push(geozoneId)
  }
  currentPage.value = 1
  applyFilters()
}

function toggleGranularityFilter(granularityId: string) {
  const index = selectedGranularities.value.indexOf(granularityId)
  if (index > -1) {
    selectedGranularities.value.splice(index, 1)
  }
  else {
    selectedGranularities.value.push(granularityId)
  }
  currentPage.value = 1
  applyFilters()
}

function getDiscussionUrl(discussion: Discussion): string {
  let subjectClass: string | null = null
  let subjectId: string | null = null

  if (discussion.subject_class && discussion.subject_id) {
    subjectClass = discussion.subject_class
    subjectId = discussion.subject_id
  }
  else if (discussion.subject && discussion.subject.class && discussion.subject.id) {
    subjectClass = discussion.subject.class
    subjectId = discussion.subject.id
  }

  if (!subjectClass || !subjectId) {
    return '#'
  }

  const classToPath: Record<string, string> = {
    Dataset: 'datasets',
    Reuse: 'reuses',
    Dataservice: 'dataservices',
    Organization: 'organizations',
  }

  const subjectPath = classToPath[subjectClass] || subjectClass.toLowerCase()

  return `http://dev.local:3000/${subjectPath}/${subjectId}#/discussions/${discussion.id}`
}

function initFiltersFromUrl() {
  const query = route.query

  if (query.q && typeof query.q === 'string') {
    searchQuery.value = query.q
  }

  if (query.type && typeof query.type === 'string') {
    selectedType.value = query.type as 'datasets' | 'reuses' | 'organizations' | 'dataservices' | 'discussions' | 'posts' | 'topics'
  }

  if (query.page && typeof query.page === 'string') {
    currentPage.value = parseInt(query.page)
  }

  if (query.sort && typeof query.sort === 'string') {
    sortBy.value = query.sort
  }

  if (query.format_family && typeof query.format_family === 'string') {
    filters.value.formatFamily = query.format_family
  }
  if (query.access_type && typeof query.access_type === 'string') {
    filters.value.accessType = query.access_type
  }
  if (query.last_update_range && typeof query.last_update_range === 'string') {
    filters.value.lastUpdate = query.last_update_range
  }
  if (query.producer_type && typeof query.producer_type === 'string') {
    filters.value.producerType = query.producer_type
  }
  if (query.reuse_type && typeof query.reuse_type === 'string') {
    filters.value.reuseType = query.reuse_type
  }
  if (query.reuse_topic && typeof query.reuse_topic === 'string') {
    filters.value.reuseTopic = query.reuse_topic
  }
  if (query.badge && typeof query.badge === 'string') {
    filters.value.dataLabel = query.badge
  }
  if (query.object_type && typeof query.object_type === 'string') {
    filters.value.discussionObjectType = query.object_type
  }

  if (query.organization && typeof query.organization === 'string') {
    selectedOrganizationIds.value = query.organization.split(',')
  }
  if (query.tag && typeof query.tag === 'string') {
    selectedTags.value = query.tag.split(',')
  }
  if (query.format && typeof query.format === 'string') {
    selectedFormats.value = query.format.split(',')
  }
  if (query.license && typeof query.license === 'string') {
    selectedLicenses.value = query.license.split(',')
  }
  if (query.schema && typeof query.schema === 'string') {
    selectedSchemas.value = query.schema.split(',')
  }
  if (query.geozone && typeof query.geozone === 'string') {
    selectedGeozones.value = query.geozone.split(',')
  }
  if (query.granularity && typeof query.granularity === 'string') {
    selectedGranularities.value = query.granularity.split(',')
  }
}

onMounted(() => {
  initFiltersFromUrl()

  loadAllResults()
  loadMetadata()

  const hasFilters = Object.keys(route.query).some(key =>
    !['q', 'type'].includes(key),
  )
  if (hasFilters) {
    applyFilters()
  }
})

watch(sortBy, () => {
  currentPage.value = 1
  applyFilters()
})

watch(searchQuery, () => {
  currentPage.value = 1
  updateUrlFromFilters()
  loadAllResults()
})

watch(advancedFacets, () => {
  currentPage.value = 1
  applyFilters()
}, { deep: true })

watch(selectedType, () => {
  filters.value = {
    formatFamily: 'all',
    accessType: 'all',
    lastUpdate: 'all',
    producerType: 'all',
    reuseType: 'all',
    reuseTopic: 'all',
    dataLabel: 'all',
    discussionObjectType: 'all',
  }

  sortBy.value = ''

  currentPage.value = 1

  advancedFacets.value = {
    organization: null,
    tag: null,
    format: null,
    license: null,
    schema: null,
    geozone: null,
    granularity: null,
  }

  selectedOrganizationIds.value = []
  showAllOrganizations.value = false
  selectedTags.value = []
  showAllTags.value = false
  selectedFormats.value = []
  showAllFormats.value = false
  selectedLicenses.value = []
  showAllLicenses.value = false
  selectedSchemas.value = []
  showAllSchemas.value = false
  selectedGeozones.value = []
  showAllGeozones.value = false
  selectedGranularities.value = []
  showAllGranularities.value = false
  showAllTopics.value = false

  applyFilters()
})

watch(activeTagFilters, (newTagFilters) => {
  newTagFilters.forEach((tagFilter) => {
    if (tagFilter.type === 'select' && !(tagFilter.name in selectedTagFilters.value)) {
      selectedTagFilters.value[tagFilter.name] = ''
    }
  })
}, { immediate: true })
</script>
