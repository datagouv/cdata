<template>
  <article class="p-4 border bg-white border-gray-default relative hover:bg-gray-some fr-enlarge-link">
    <div class="flex flex-wrap md:flex-nowrap gap-4 items-start">
      <div
        v-if="showLogo"
        class="flex-none"
      >
        <div class="flex justify-center items-center p-2 border border-gray-lower bg-[#fff] rounded-md overflow-hidden">
          <OrganizationLogo
            v-if="topic.organization"
            :organization="topic.organization"
            size-class="size-12"
          />
          <Avatar
            v-else-if="topic.owner"
            :user="topic.owner"
            :size="48"
          />
          <Placeholder
            v-else
            type="Dataset"
            class="size-12"
          />
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <h4 class="w-full text-base mb-0 flex items-center gap-1">
          <AppLink
            :to="topicUrl || '#'"
            class="text-gray-title text-base bg-none flex items-center w-full truncate gap-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="flex-none"
            >
              <path
                d="M13.0143 10.348L13.8344 10.8285C13.9959 10.9231 14.0482 11.1277 13.9514 11.2854C13.9225 11.3323 13.8824 11.3715 13.8344 11.3996L7.85095 14.905C7.63497 15.0317 7.36503 15.0317 7.14905 14.905L1.16565 11.3996C1.00412 11.305 0.95174 11.1004 1.04866 10.9427C1.07747 10.8958 1.11764 10.8566 1.16565 10.8285L1.9857 10.348L7.50003 13.5786L13.0143 10.348ZM13.0143 7.21729L13.8344 7.69775C13.9959 7.7924 14.0482 7.99696 13.9514 8.1547C13.9225 8.20159 13.8824 8.24083 13.8344 8.26894L7.50003 11.98L1.16565 8.26894C1.00412 8.17428 0.95174 7.96972 1.04866 7.81199C1.07747 7.76509 1.11764 7.72586 1.16565 7.69775L1.9857 7.21729L7.50003 10.4479L13.0143 7.21729ZM7.85095 1.09492L13.8344 4.60035C13.9959 4.69498 14.0482 4.89957 13.9514 5.05729C13.9225 5.10417 13.8824 5.14341 13.8344 5.17153L7.50003 8.88255L1.16565 5.17153C1.00412 5.0769 0.95174 4.87231 1.04866 4.71459C1.07747 4.66771 1.11764 4.62848 1.16565 4.60035L7.14905 1.09492C7.36503 0.96836 7.63497 0.96836 7.85095 1.09492ZM7.50003 2.44291L3.33003 4.88594L7.50003 7.32899L11.67 4.88594L7.50003 2.44291Z"
                fill="#161616"
              />
            </svg>
            <span class="block truncate flex-1">{{ topic.name }}</span>
            <span class="absolute inset-0" />
          </AppLink>
        </h4>

        <div
          v-if="organizationObject || ownerName"
          class="text-sm m-0 flex flex-wrap md:flex-nowrap gap-y-1 items-center truncate"
        >
          <OrganizationNameWithCertificate
            v-if="organizationObject"
            :organization="organizationObject"
            class="flex-shrink-0 truncate"
          />
          <span
            v-else-if="ownerName"
            class="flex-shrink-0 truncate"
          >
            {{ ownerName }}
          </span>
          <span
            v-if="(organizationObject || ownerName) && topic.last_modified"
            class="text-gray-medium mx-1"
          >·</span>
          <span
            v-if="topic.last_modified"
            class="text-gray-medium whitespace-nowrap"
          >
            Mis à jour {{ formatDate(topic.last_modified) }}
          </span>
        </div>

        <p
          v-if="descriptionShort"
          class="fr-text--sm fr-mb-0 overflow-wrap-anywhere hidden sm:block line-clamp-2 mt-1"
        >
          {{ descriptionShort }}
        </p>

        <div
          v-if="showStats && (topic.nb_datasets > 0 || topic.nb_dataservices > 0 || topic.nb_reuses > 0)"
          class="flex items-center gap-4 mt-2 text-xs text-gray-medium"
        >
          <div
            v-if="topic.nb_datasets > 0"
            class="flex items-center gap-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33333 8.33333C3.33333 8.542 3.64067 8.90533 4.35333 9.262C5.276 9.72333 6.58467 10 8 10C9.41533 10 10.724 9.72333 11.6467 9.262C12.3593 8.90533 12.6667 8.542 12.6667 8.33333V6.886C11.5667 7.566 9.88467 8 8 8C6.11533 8 4.43333 7.56533 3.33333 6.886V8.33333ZM12.6667 10.2193C11.5667 10.8993 9.88467 11.3333 8 11.3333C6.11533 11.3333 4.43333 10.8987 3.33333 10.2193V11.6667C3.33333 11.8753 3.64067 12.2387 4.35333 12.5953C5.276 13.0567 6.58467 13.3333 8 13.3333C9.41533 13.3333 10.724 13.0567 11.6467 12.5953C12.3593 12.2387 12.6667 11.8753 12.6667 11.6667V10.2193ZM2 11.6667V5C2 3.34333 4.68667 2 8 2C11.3133 2 14 3.34333 14 5V11.6667C14 13.3233 11.3133 14.6667 8 14.6667C4.68667 14.6667 2 13.3233 2 11.6667ZM8 6.66667C9.41533 6.66667 10.724 6.39 11.6467 5.92867C12.3593 5.572 12.6667 5.20867 12.6667 5C12.6667 4.79133 12.3593 4.428 11.6467 4.07133C10.724 3.61 9.41533 3.33333 8 3.33333C6.58467 3.33333 5.276 3.61 4.35333 4.07133C3.64067 4.428 3.33333 4.79133 3.33333 5C3.33333 5.20867 3.64067 5.572 4.35333 5.92867C5.276 6.39 6.58467 6.66667 8 6.66667Z"
                fill="currentColor"
              />
            </svg>
            <span>{{ topic.nb_datasets }}</span>
          </div>

          <div
            v-if="topic.nb_dataservices > 0"
            class="flex items-center gap-1"
          >
            <svg
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
                fill="currentColor"
              />
            </svg>
            <span>{{ topic.nb_dataservices }}</span>
          </div>

          <div
            v-if="topic.nb_reuses > 0"
            class="flex items-center gap-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33333 2V12.6667H14V14H2V2H3.33333ZM13.5287 4.19533L14.4713 5.138L10.6667 8.94267L8.66667 6.94333L5.80467 9.80467L4.862 8.862L8.66667 5.05733L10.6667 7.05667L13.5287 4.19533Z"
                fill="currentColor"
              />
            </svg>
            <span>{{ topic.nb_reuses }}</span>
          </div>
        </div>

        <div
          v-if="matchingBadges.length > 0"
          class="flex flex-wrap gap-2 mt-2"
        >
          <span
            v-for="badge in matchingBadges"
            :key="badge.value"
            class="px-2 py-1 rounded text-white text-xs font-bold"
            :style="{ backgroundColor: badge.color }"
          >
            {{ badge.name }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { TopicV2 } from '../types/topics'
import { useFormatDate } from '../functions/dates'
import { getOwnerName } from '../functions/owned'
import AppLink from './AppLink.vue'
import OrganizationNameWithCertificate from './OrganizationNameWithCertificate.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import Avatar from './Avatar.vue'
import Placeholder from './Placeholder.vue'

type TagIntoBadge = {
  name: string
  value: string
  color: string
}

type TopicWithStats = TopicV2 & {
  nb_datasets?: number
  nb_dataservices?: number
  nb_reuses?: number
  organization_name?: string
}

const props = withDefaults(defineProps<{
  topic: TopicWithStats
  topicUrl?: RouteLocationRaw
  showLogo?: boolean
  showStats?: boolean
  tagIntoBadge?: TagIntoBadge[]
}>(), {
  topicUrl: undefined,
  showLogo: true,
  showStats: true,
  tagIntoBadge: undefined,
})

const { formatRelativeIfRecentDate } = useFormatDate()

const formatDate = (dateString: string) => {
  return formatRelativeIfRecentDate(dateString, {
    dateStyle: 'long',
    timeStyle: undefined,
  })
}

const organizationObject = computed(() => {
  if (!props.topic.organization || !props.topic.organization_name) return null

  if (typeof props.topic.organization === 'object' && props.topic.organization.id) {
    return props.topic.organization
  }

  return {
    id: props.topic.organization,
    name: props.topic.organization_name,
  }
})

const ownerName = computed(() => {
  if (!props.topic.owner) return ''
  return getOwnerName(props.topic)
})

const descriptionShort = computed(() => {
  if (!props.topic.description) return ''
  const desc = props.topic.description
  return desc.length > 200 ? desc.substring(0, 200) + '...' : desc
})

const matchingBadges = computed(() => {
  if (!props.tagIntoBadge || !props.topic.tags) return []

  const topicTags = Array.isArray(props.topic.tags)
    ? props.topic.tags.map((tag: string | { text?: string, name?: string }) => typeof tag === 'string' ? tag : (tag.text || tag.name || ''))
    : []

  const matches = props.tagIntoBadge.filter(badge => topicTags.includes(badge.value))

  return matches
})
</script>
