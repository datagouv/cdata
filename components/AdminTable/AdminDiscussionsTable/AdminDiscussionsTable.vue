<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          :sorted="sorted('title')"
          scope="col"
          class="w-1/3"
          @sort="(direction: SortDirection) => $emit('sort', 'title', direction)"
        >
          {{ t("Discussion") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-44"
        >
          {{ t("Statut") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-44"
        >
          {{ t("Nombre de commentaires") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="min-w-56"
        >
          {{ t("Dernier commentaire") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('created')"
          scope="col"
          class="w-44"
          @sort="(direction: SortDirection) => $emit('sort', 'created', direction)"
        >
          {{ t("Créé le") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('closed')"
          scope="col"
          class="w-44"
          @sort="(direction: SortDirection) => $emit('sort', 'closed', direction)"
        >
          {{ t("Fermée le") }}
        </AdminTableTh>
        <AdminTableTh scope="col">
          {{ t("Actions") }}
        </AdminTableTh>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="discussion in discussions"
        :key="discussion.id"
      >
        <td>
          <p class="fr-text--bold">
            <TextClamp
              :text="discussion.title"
              :auto-resize="true"
              :max-lines="1"
            />
          </p>
          <p v-if="!subject && subjects[discussion.subject.id]">
            <a
              class="fr-link inline-flex"
              :href="getSubjectPage(subjects[discussion.subject.id])"
            >
              <component
                :is="getSubjectTypeIcon(discussion.subject.class)"
                class="self-center size-3"
                aria-hidden="true"
              />
              <TextClamp
                class="overflow-wrap-anywhere"
                :text="getSubjectTitle(subjects[discussion.subject.id])"
                :auto-resize="true"
                :max-lines="1"
              />
            </a>
          </p>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getStatus(discussion).type"
          >
            {{ getStatus(discussion).label }}
          </AdminBadge>
        </td>
        <td class="font-mono text-right">
          {{ discussion.discussion.length }}
        </td>
        <td>
          <div>
            <p>{{ formatDate(getLastComment(discussion).posted_on) }}</p>
            <p class="inline-flex items-center">
              {{ t('par ') }}
              <AvatarWithName
                class="fr-ml-1v"
                :user="getLastComment(discussion).posted_by"
              />
            </p>
          </div>
        </td>
        <td>
          {{ formatDate(discussion.created) }}
        </td>
        <td>
          <template v-if="discussion.closed">
            {{ formatDate(discussion.closed) }}
          </template>
        </td>
        <td>
          <template v-if="subject || subjects[discussion.subject.id]">
            <BrandedButton
              size="xs"
              color="secondary-softer"
              :href="getDiscussionUrl(discussion.id, subject || subjects[discussion.subject.id])"
              :icon="RiEyeLine"
              icon-only
              external
              keep-margins-even-without-borders
            >
              {{ getDiscussionUrl(discussion.id, subject || subjects[discussion.subject.id]) }}
            </BrandedButton>

            <DiscussionsRespondModal
              :thread="discussion"
              :subject="(subject || subjects[discussion.subject.id]) ?? undefined"
              @responded="$emit('refresh')"
            />
          </template>
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { AvatarWithName, BrandedButton, useFormatDate } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiEyeLine } from '@remixicon/vue'
import AdminTable from '../Table/AdminTable.vue'
import AdminTableTh from '../Table/AdminTableTh.vue'
import type { Comment, DiscussionSortedBy, DiscussionSubjectTypes, Thread } from '~/types/discussions'
import type { AdminBadgeType, SortDirection } from '~/types/types'
import { getDiscussionUrl, getSubject, getSubjectTypeIcon, getSubjectTitle } from '~/utils/discussions'

const props = defineProps<{
  discussions: Array<Thread>
  sortDirection: SortDirection
  sortedBy: DiscussionSortedBy
  subject?: DiscussionSubjectTypes
}>()

defineEmits<{
  (event: 'sort', column: DiscussionSortedBy, direction: SortDirection): void
  (event: 'refresh'): void
}>()

const { t } = useI18n()
const { formatDate } = useFormatDate()
const { $api } = useNuxtApp()

const subjects = ref<Record<string, DiscussionSubjectTypes | null>>({})
const subjectsPromises = ref<Record<string, Promise<void>>>({})

watchEffect(async () => {
  if (props.subject) return

  for (const discussion of props.discussions) {
    if (discussion.subject.id in subjectsPromises.value) continue

    subjectsPromises.value[discussion.subject.id] = getSubject($api, discussion.subject)
      .then((subject) => {
        subjects.value[discussion.subject.id] = subject // Working because there is no conflicts between IDs from different types
      })
  }

  await Promise.all(Object.values(subjectsPromises.value))
})

function sorted(column: DiscussionSortedBy) {
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}

function getLastComment(discussion: Thread): Comment {
  return discussion.discussion.slice(-1)[0]
}

function getStatus(thread: Thread): { label: string, type: AdminBadgeType } {
  if (thread.closed) {
    return {
      label: t('Clos'),
      type: 'secondary',
    }
  }

  if (thread.discussion.length === 1) {
    return {
      label: t('Nouveau'),
      type: 'primary',
    }
  }

  return {
    label: t('Répondu'),
    type: 'secondary',
  }
}
</script>
