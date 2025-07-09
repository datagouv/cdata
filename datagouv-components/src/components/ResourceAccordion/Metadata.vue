<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import type { Resource } from '../../types/resources'
import CopyButton from '../CopyButton.vue'
import DescriptionDetails from '../DescriptionDetails.vue'
import DescriptionList from '../DescriptionList.vue'
import DescriptionTerm from '../DescriptionTerm.vue'
import { useFormatDate } from '../../functions/dates'
import { filesize } from '../../functions/helpers'
import ExtraAccordion from '../ExtraAccordion.vue'
import { getResourceTitleId, getResourceLabel } from '../../functions/resources'
import { useComponentsConfig } from '../../config'

const props = defineProps<{
  resource: Resource
}>()

const hasExtras = computed(() => Object.keys(props.resource.extras).length)
const resourceTitleId = computed(() => getResourceTitleId(props.resource))

const { t } = useI18n()
const { formatDate } = useFormatDate()
const config = useComponentsConfig()
</script>

<template>
  <div>
    <div class="flex gap-3rem flex-col-on-small">
      <DescriptionList class="flex-1">
        <DescriptionTerm>
          {{ t('URL') }}
          <CopyButton
            :label="$t(`Copier l'URL`)"
            :copied-label="$t('URL copiée !')"
            :text="resource.url"
            :aria-describedby="resourceTitleId"
          />
        </DescriptionTerm>
        <DescriptionDetails :with-ellipsis="false">
          <code class="code">
            <a :href="resource.url"><component
              :is="config.textClamp"
              v-if="config && config.textClamp"
              :max-lines="1"
              :autoresize="true"
              :text="resource.url"
            /></a>
          </code>
        </DescriptionDetails>
        <DescriptionTerm>
          {{ t('URL stable') }}
          <CopyButton
            :label="$t(`Copier l'URL stable`)"
            :copied-label="$t('URL stable copiée !')"
            :text="resource.latest"
            :aria-describedby="resourceTitleId"
          />
        </DescriptionTerm>
        <DescriptionDetails :with-ellipsis="false">
          <code class="code">
            <a :href="resource.latest"><component
              :is="config.textClamp"
              v-if="config && config.textClamp"
              :max-lines="1"
              :autoresize="true"
              :text="resource.latest"
            /></a>
          </code>
        </DescriptionDetails>
        <DescriptionTerm>
          {{ t('Identifiant') }}
          <CopyButton
            :label="$t(`Copier l'identifiant`)"
            :copied-label="$t('ID copié !')"
            :text="resource.id"
            :aria-describedby="resourceTitleId"
          />
        </DescriptionTerm>
        <DescriptionDetails :with-ellipsis="false">
          <code class="code">
            <component
              :is="config.textClamp"
              v-if="config && config.textClamp"
              :max-lines="1"
              :autoresize="true"
              :text="resource.id"
            />
          </code>
        </DescriptionDetails>
        <template v-if="resource.checksum">
          <DescriptionTerm>
            {{ resource.checksum.type }}
            <CopyButton
              :label="$t('Copier la somme de contrôle')"
              :copied-label="$t('Somme de contrôle copiée !')"
              :text="resource.checksum.value"
              :aria-describedby="resourceTitleId"
            />
          </DescriptionTerm>
          <DescriptionDetails :with-ellipsis="false">
            <code class="code">
              <component
                :is="config.textClamp"
                v-if="config && config.textClamp"
                :max-lines="1"
                :autoresize="true"
                :text="resource.checksum.value"
              />
            </code>
          </DescriptionDetails>
        </template>
      </DescriptionList>
      <DescriptionList style="flex-shrink: 0;">
        <DescriptionTerm>{{ t('Créée le') }}</DescriptionTerm>
        <DescriptionDetails>
          {{ formatDate(resource.created_at) }}
        </DescriptionDetails>
        <DescriptionTerm>{{ t('Modifiée le') }}</DescriptionTerm>
        <DescriptionDetails>
          {{ formatDate(resource.last_modified) }}
        </DescriptionDetails>
      </DescriptionList>
      <DescriptionList style="flex-shrink: 0;">
        <template v-if="resource.filesize">
          <DescriptionTerm>{{ t('Taille') }}</DescriptionTerm>
          <DescriptionDetails>
            {{ filesize(resource.filesize) }}
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
            <code class="code text-overflow-ellipsis">{{ resource.mime }}</code>
          </DescriptionDetails>
        </template>
      </DescriptionList>
    </div>
    <div>
      <ExtraAccordion
        v-if="hasExtras"
        class="pt-6 mt-6 border-top border-gray-default"
        :button-text="t('Voir les extras')"
        :title-text="t('Extras de la ressource')"
        title-level="h5"
        :extra="resource.extras"
      />
    </div>
  </div>
</template>

<style scoped>
.gap-3rem {
  gap: 3rem;
}

.gap-3rem dl {
  padding-inline-start: 0;
}

@container (max-width: 600px) {
  .flex-col-on-small {
    flex-direction: column
  }
}
</style>
