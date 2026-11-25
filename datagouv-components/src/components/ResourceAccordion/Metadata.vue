<script setup lang="ts">
import { computed } from 'vue'
import { RiInformationLine } from '@remixicon/vue'
import type { Resource } from '../../types/resources'
import DescriptionList from '../DescriptionList.vue'
import DescriptionListDetails from '../DescriptionListDetails.vue'
import DescriptionListTerm from '../DescriptionListTerm.vue'
import FormattedDate from '../FormattedDate.vue'
import { filesize } from '../../functions/helpers'
import MetadataExtras from '../MetadataExtras.vue'
import TechnicalValue from '../TechnicalValue.vue'
import MetadataEmptyValue from '../MetadataEmptyValue.vue'
import Toggletip from '../Toggletip.vue'
import { getResourceLabel, getResourceFilesize } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  resource: Resource
}>()

const hasExtras = computed(() => Object.keys(props.resource.extras).length)
const resourceFilesize = computed(() => getResourceFilesize(props.resource))

const { t } = useTranslation()
</script>

<template>
  <div class="grid min-w-0 grid-cols-1 items-start gap-x-6 gap-y-5 sm:grid-cols-2">
    <DescriptionList class="!flex !flex-col">
      <div class="min-w-0">
        <DescriptionListTerm>{{ t('URL') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <TechnicalValue
            :value="resource.url"
            :href="resource.url"
            :label="t('Copier le lien')"
            :copied-label="t('URL copiée !')"
          />
        </DescriptionListDetails>
      </div>
      <div class="min-w-0">
        <DescriptionListTerm class="flex items-center gap-1">
          <span>{{ t('URL stable') }}</span>
          <Toggletip
            :styled-button="false"
            button-class="border-transparent -outline-offset-2 inline-flex items-center justify-center rounded-sm p-1 text-gray-secondary hover:bg-gray-some transition-colors"
          >
            <RiInformationLine
              class="size-4"
              aria-hidden="true"
            />
            <span class="sr-only">{{ t(`Qu'est-ce qu'une URL stable ?`) }}</span>
            <template #toggletip>
              <p class="fr-text--sm m-0">
                {{ t(`Cette URL redirige toujours vers la dernière version du fichier. L'URL du fichier, elle, change à chaque mise à jour : privilégiez l'URL stable pour partager la ressource ou l'utiliser dans un script.`) }}
              </p>
            </template>
          </Toggletip>
        </DescriptionListTerm>
        <DescriptionListDetails>
          <TechnicalValue
            :value="resource.latest"
            :href="resource.latest"
            :label="t('Copier le lien stable')"
            :copied-label="t('URL stable copiée !')"
          />
        </DescriptionListDetails>
      </div>
      <div class="min-w-0">
        <DescriptionListTerm>{{ t('Identifiant') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <TechnicalValue
            :value="resource.id"
            :label="t(`Copier l'identifiant`)"
            :copied-label="t('ID copié !')"
          />
        </DescriptionListDetails>
      </div>
      <div class="min-w-0">
        <DescriptionListTerm>{{ resource.checksum?.type ?? t('Somme de contrôle') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <TechnicalValue
            v-if="resource.checksum"
            :value="resource.checksum.value"
            :label="t('Copier la somme de contrôle')"
            :copied-label="t('Somme de contrôle copiée !')"
          />
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
    </DescriptionList>
    <DescriptionList class="!flex !flex-col">
      <div class="min-w-0">
        <DescriptionListTerm>{{ t('Créée le') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="resource.created_at" />
        </DescriptionListDetails>
      </div>
      <div class="min-w-0">
        <DescriptionListTerm>{{ t('Modifiée le') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <FormattedDate :date="resource.last_modified" />
        </DescriptionListDetails>
      </div>
      <div class="min-w-0">
        <DescriptionListTerm>{{ t('Taille') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <template v-if="resourceFilesize !== null">
            {{ filesize(resourceFilesize) }}
          </template>
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <div class="min-w-0">
        <DescriptionListTerm>{{ t('Type') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <template v-if="resource.type">
            {{ getResourceLabel(resource.type) }}
          </template>
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <div class="min-w-0">
        <DescriptionListTerm>{{ t('Type MIME') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <code
            v-if="resource.mime"
            class="font-mono text-[13px]/[18px]"
          >{{ resource.mime }}</code>
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
    </DescriptionList>
    <MetadataExtras
      v-if="hasExtras"
      class="border-y border-gray-default py-4 sm:col-span-2"
      :button-text="t('Voir les extras')"
      :title-text="t('Extras de la ressource')"
      title-level="h5"
      :extra="resource.extras"
    />
  </div>
</template>
