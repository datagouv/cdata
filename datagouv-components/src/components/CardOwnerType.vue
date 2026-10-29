<script setup lang="ts">
import '../../assets/cards.css'
import { computed } from 'vue'
import { findOrganizationType, type OrganizationTypes, type UserType } from '../functions/organizations'
import OwnerTypeIcon from './OwnerTypeIcon.vue'

const props = defineProps<{ type: OrganizationTypes | UserType }>()
const name = computed(() => findOrganizationType(props.type).label)
</script>

<template>
  <span
    class="dg-card-owner-type"
    :data-type="type"
  >
    <OwnerTypeIcon :type="type" />
    <span>{{ name }}</span>
  </span>
</template>
