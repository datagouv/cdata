<script setup lang="ts">
import { computed } from 'vue'
import { RiInformationLine } from '@remixicon/vue'
import type { Resource } from '../../types/resources'
import CopyButton from '../CopyButton.vue'
import DescriptionDetails from '../DescriptionDetails.vue'
import DescriptionTerm from '../DescriptionTerm.vue'
import FormattedDate from '../FormattedDate.vue'
import { filesize } from '../../functions/helpers'
import ExtraAccordion from '../ExtraAccordion.vue'
import Toggletip from '../Toggletip.vue'
import { getResourceTitleId, getResourceLabel, getResourceFilesize } from '../../functions/resources'
import { useTranslation } from '../../composables/useTranslation'

const props = defineProps<{
  resource: Resource
}>()

const hasExtras = computed(() => Object.keys(props.resource.extras).length)
const resourceTitleId = computed(() => getResourceTitleId(props.resource))
const resourceFilesize = computed(() => getResourceFilesize(props.resource))

const { t } = useTranslation()
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-12 flex-col md:flex-row overflow-hidden">
      <dl class="flex-1 max-w-full p-0 m-0">
        <DescriptionTerm>
          {{ t('URL') }}
          <CopyButton
            :label="t(`Copier l'URL`)"
            :copied-label="t('URL copiée !')"
            :text="resource.url"
            :aria-describedby="resourceTitleId"
          />
        </DescriptionTerm>
        <DescriptionDetails :with-ellipsis="false">
          <code class="code truncate p-1">
            <a :href="resource.url">
              {{ resource.url }}
            </a>
          </code>
        </DescriptionDetails>
        <DescriptionTerm class="flex items-center">
          {{ t('URL stable') }}
          <Toggletip
            :styled-button="false"
            button-class="border-transparent -outline-offset-2 inline-flex items-center justify-center rounded-sm p-1 text-gray-medium hover:bg-gray-lower transition-colors"
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
          <CopyButton
            :label="t(`Copier l'URL stable`)"
            :copied-label="t('URL stable copiée !')"
            :text="resource.latest"
            :aria-describedby="resourceTitleId"
          />
        </DescriptionTerm>
        <DescriptionDetails :with-ellipsis="false">
          <code class="code truncate p-1">
            <a :href="resource.latest">
              {{ resource.latest }}
            </a>
          </code>
        </DescriptionDetails>
        <DescriptionTerm>
          {{ t('Identifiant') }}
          <CopyButton
            :label="t(`Copier l'identifiant`)"
            :copied-label="t('ID copié !')"
            :text="resource.id"
            :aria-describedby="resourceTitleId"
          />
        </DescriptionTerm>
        <DescriptionDetails :with-ellipsis="false">
          <code class="code truncate p-1">
            {{ resource.id }}
          </code>
        </DescriptionDetails>
        <template v-if="resource.checksum">
          <DescriptionTerm>
            {{ resource.checksum.type }}
            <CopyButton
              :label="t('Copier la somme de contrôle')"
              :copied-label="t('Somme de contrôle copiée !')"
              :text="resource.checksum.value"
              :aria-describedby="resourceTitleId"
            />
          </DescriptionTerm>
          <DescriptionDetails :with-ellipsis="false">
            <code class="code truncate p-1">
              {{ resource.checksum.value }}
            </code>
          </DescriptionDetails>
        </template>
      </dl>
      <dl
        class="p-0 m-0 shrink-0"
      >
        <DescriptionTerm>{{ t('Créée le') }}</DescriptionTerm>
        <DescriptionDetails>
          <FormattedDate :date="resource.created_at" />
        </DescriptionDetails>
        <DescriptionTerm>{{ t('Modifiée le') }}</DescriptionTerm>
        <DescriptionDetails>
          <FormattedDate :date="resource.last_modified" />
        </DescriptionDetails>
      </dl>
      <dl
        class="p-0 m-0 shrink-0"
      >
        <template v-if="resourceFilesize">
          <DescriptionTerm>{{ t('Taille') }}</DescriptionTerm>
          <DescriptionDetails>
            {{ filesize(resourceFilesize) }}
          </DescriptionDetails>
        </template>
        <template v-if="resource.mime">
          <DescriptionTerm>{{ t('Type') }}</DescriptionTerm>
          <DescriptionDetails>
            {{ getResourceLabel(resource.type) }}
          </DescriptionDetails>
        </template>
        <template v-if="resource.mime">
          <DescriptionTerm>{{ t('Type MIME') }}</DescriptionTerm>
          <DescriptionDetails>
            <code class="code truncate">{{ resource.mime }}</code>
          </DescriptionDetails>
        </template>
      </dl>
    </div>
    <div>
      <ExtraAccordion
        v-if="hasExtras"
        class="pt-6 mt-6 border-t border-gray-default"
        :button-text="t('Voir les extras')"
        :title-text="t('Extras de la ressource')"
        title-level="h5"
        :extra="resource.extras"
      />
    </div>
  </div>
</template>
