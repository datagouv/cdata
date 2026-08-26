<template>
  <div class="flex items-center space-x-2 text-xs/loose">
    <div class="flex items-center space-x-1 text-mention-grey">
      <OrganizationLogo
        v-if="comment.posted_by_organization"
        :organization="comment.posted_by_organization"
        size-class="size-3"
      />
      <Avatar
        v-else
        :user="comment.posted_by"
        :rounded="true"
        class="size-3"
      />
      <CdataLink
        v-if="comment.posted_by_organization"
        class="link"
        :href="comment.posted_by_organization.page"
      >
        {{ comment.posted_by_organization.name }}
      </CdataLink>
      <CdataLink
        v-else
        class="link"
        :href="comment.posted_by.page"
      >
        {{ comment.posted_by.first_name }} {{ comment.posted_by.last_name }}
      </CdataLink>
    </div>
    <div>—</div>
    <div v-if="comment.last_modified_at">
      <FormattedDate
        :date="comment.last_modified_at"
        :label="date => $t('Mis à jour le {date}', { date })"
      />
    </div>
    <div v-else>
      <FormattedDate
        :date="comment.posted_on"
        :label="date => $t('Posté le {date}', { date })"
      />
    </div>
    <div v-if="isProducer">
      —
    </div>
    <AdminBadge
      v-if="isProducer"
      size="xs"
      type="primary"
    >
      {{ $t('Producteur') }}
    </AdminBadge>
  </div>
</template>

<script setup lang="ts">
import { Avatar, FormattedDate, OrganizationLogo } from '@datagouv/components-next'
import type { Comment, DiscussionSubjectTypes } from '~/types/discussions'
import { isProducerOfSubject } from '~/utils/discussions'

const props = defineProps<{
  comment: Comment
  subject?: DiscussionSubjectTypes
}>()

const isProducer = computed(() => props.subject && isProducerOfSubject(props.subject, props.comment))
</script>
